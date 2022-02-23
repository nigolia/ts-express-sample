import * as util from 'util';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import * as superTest from 'supertest';
import { mock } from 'jest-mock-extended';
import { CustomError, CustomUtils, ICustomStorageClient, CustomStorageBucket, defaultContainer, IMongooseClient, CustomStorageFile, commonInjectorCodes, defConf } from '@demo/app-common';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { App } from '../src/bootstrap/app';
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { ErrorCodes } from '../src/domain/enums/error-codes';
import { IBucketRepository } from '../src/domain/repositories/i-bucket-repository';
import { IFileRepository } from '../src/domain/repositories/i-file-repository';
import { BucketEntity } from '../src/domain/entities/bucket-entity';
import { FileEntity } from '../src/domain/entities/file-entity';

const _ENDPOINT = '/api/v1/storage/b/%s/o/%s';

interface IBody {
	name: string;
	metadata: any;
};

describe('Delete file spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let bucketRepo: IBucketRepository;
	let fileRepo: IFileRepository;
	let db: IMongooseClient;
	const defaultBody: IBody = {
		name: 'rename',
		metadata: { tag: 'Excel' },
	};
	let bucket: BucketEntity;
	let file:FileEntity;
	let storageBucket: CustomStorageBucket;
	const bucketName = 'andy-bucket-test';
	let fileId = '';
	const tokenPayload = {
		__platform: 'luna',
		__userId: '6211e7bbb056133480280153',
		__userName: 'andy',
		companyId: '58ff',
		account: 'andy',
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
		storageClient.deleteFile.mockResolvedValue();
		defaultContainer.rebind<ICustomStorageClient>(commonInjectorCodes.I_STORAGE_CLIENT).toConstantValue(storageClient);

		bucket = new BucketEntity();
    	bucket.name = bucketName;
		bucket.platform = 'luna';
		bucket.policy = [
			{
				"principle" : {
					"companyId" : "58ff",
				},
				"resource" : [
					"upload/{companyId}/{account}/"
				],
			}
		];

		storageBucket = new CustomStorageBucket();
    	storageBucket.bucketName = bucketName;
	
		const bucketResult = await bucketRepo.create(bucket, storageBucket) as BucketEntity;

		const storageFile = new CustomStorageFile();
    	storageFile.bucketName = bucketName;
    	storageFile.source = './b_list.xlsx';
    	storageFile.target = 'upload/58ff/andy';

		file = new FileEntity();
		file.platform = 'luna';
		file.bucketId = bucketResult.id;
		file.name = 'b_list';
		file.mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
		file.destination = 'upload/58ff/andy/b_list.xlsx';
		const fileResult = await fileRepo.upload(file, storageFile) as FileEntity;
		fileId = fileResult.id;
		done();
	});
	afterAll(async (done) => {
		done();
	});
	describe('Required fileds', () => {
		test('[3001] "name" is empty', async () => {
			const b = CustomUtils.deepClone<IBody>(defaultBody);
			b.name = '';
			const endpoint = util.format(_ENDPOINT, 'XX', 'BB');
			const res = await agentClient
				.patch(endpoint)
				.send(b);

			expect(res.status).toBe(400);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: 3001,
				message: '檔名不存在',
			});
		});
	});
	describe('validation rules', () => {
		test.todo('[2000x] 權限不足');
		test.todo('[2000x] 儲存桶不存在');
		test('[3002] 檔案不存在', async () => {
			const b = CustomUtils.deepClone<IBody>(defaultBody);
			const endpoint = util.format(_ENDPOINT, 'XX', 'BB');
			const res = await agentClient
				.patch(endpoint)
				.send(b);

			expect(res.status).toBe(400);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: 3002,
				message: '檔案不存在',
			});
		});
	});
	describe('success', () => {
		test.only('success', async () => {
			const endpoint = util.format(_ENDPOINT, bucketName, fileId);
			const payload = CustomUtils.deepClone<any>(tokenPayload);
			let token = jwt.sign(
				payload,
				defConf.TOKEN_SECRET
			);
			const res = await agentClient
				.delete(endpoint)
				.set('Authorization', `Bearer ${token}`);

			expect(res.status).toBe(200);
			const file = await fileRepo.findOne(fileId) as FileEntity;
			expect(file).toBeUndefined();
		});
	});
});