import * as util from 'util';
import * as superTest from 'supertest';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { mock } from 'jest-mock-extended';
import { CustomUtils, defaultContainer, ICustomStorageClient, IMongooseClient, CustomStorageBucket, commonInjectorCodes, defConf } from '@demo/app-common';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { App } from '../src/bootstrap/app';
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { IBucketRepository } from '../src/domain/repositories/i-bucket-repository';
import { IFileRepository } from '../src/domain/repositories/i-file-repository';
import { BucketEntity } from '../src/domain/entities/bucket-entity';
import { FileEntity } from '../src/domain/entities/file-entity';

const _ENDPOINT = '/api/v1/storage/b/%s/o';

interface IBody {
	file: string,
	data: string
};

describe('upload file spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let bucketRepo: IBucketRepository;
	let fileRepo: IFileRepository;
	let db: IMongooseClient;
	const data = {
		"target": "xlsxFile/58ff",
	};
	const dataBase64 = Buffer.from(JSON.stringify(data)).toString('base64');
	// const xlsxBuffer = fs.readFileSync(xlsxFilepath);
	// const defaultBody: IBody = {
	// 	data: dataBase64,
	// };
	let entity: BucketEntity;
	let storageBucket: CustomStorageBucket;
	const bucketName = 'andy-bucket-test';
	const tokenPayload = {
		__platform: 'luna',
		__userId: '6211e7bbb056133480280153',
		__userName: 'andy',
	};
	beforeAll(async (done) => {
		await AppInitializer.tryDbClient();
		AppInitializer.tryInjector();
		db = defaultContainer.getNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
		await db.clearData();
		agentClient = superTest.agent(new App().app);
		bucketRepo = defaultContainer.get<IBucketRepository>(InjectorCodes.I_BUCKET_REPO);
		fileRepo = defaultContainer.get<IFileRepository>(InjectorCodes.I_FILE_REPO);

		const storageClient = mock<ICustomStorageClient>();
		storageClient.createBucket.mockResolvedValue();
		storageClient.createFile.mockResolvedValue();
		defaultContainer.rebind<ICustomStorageClient>(commonInjectorCodes.I_STORAGE_CLIENT).toConstantValue(storageClient);

		entity = new BucketEntity();
    	entity.name = bucketName;
		entity.platform = 'luna';

		storageBucket = new CustomStorageBucket();
    	storageBucket.bucketName = bucketName;
	
		await bucketRepo.create(entity, storageBucket);
		done();
	});
	afterAll(async (done) => {
		done();
	});
	describe('Required fileds', () => {
	});
	describe('validation rules', () => {;
	});
	describe('success', () => {
		test.only('success', async () => {
			const endpoint = util.format(_ENDPOINT, bucketName);
			const payload = CustomUtils.deepClone<any>(tokenPayload);
			let token = jwt.sign(
				payload,
				defConf.TOKEN_SECRET
			);
			const res = await agentClient
				.post(endpoint)
				.set('Authorization', `Bearer ${token}`)
				.field('Content-Type', 'multipart/form-data')
				.attach('file', './b_list.xlsx')
				.field('data', dataBase64);

			expect(res.status).toBe(200);
			const fileId = res.body.result._id;
			expect(fileId).not.toBeUndefined();
		});
	});
});