import * as util from 'util';
import { ObjectId } from 'mongodb';
import * as superTest from 'supertest';
import * as fs from 'fs';
import { mock } from 'jest-mock-extended';
import { CustomUtils, defaultContainer, ICustomStorageClient, IMongooseClient, CustomStorageBucket, CustomStorageFile, commonInjectorCodes, defConf } from '@demo/app-common';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { App } from '../src/bootstrap/app';
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { IBucketRepository } from '../src/domain/repositories/i-bucket-repository';
import { IFileRepository } from '../src/domain/repositories/i-file-repository';
import { BucketEntity } from '../src/domain/entities/bucket-entity';
import { FileEntity } from '../src/domain/entities/file-entity';
import jwt from 'jsonwebtoken';
import { MockBucket } from '../__mocks__/mock-bucket';

const _ENDPOINT = '/api/v1/storage/b/%s/o/%s';

interface IBody {
	name: string;
	policy: any;
};

describe('download file spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let bucketRepo: IBucketRepository;
	let fileRepo: IFileRepository;
	let db: IMongooseClient;
	const defaultBody: IBody = {
		name: 'andy-bucket-test',
		policy: [
			{
				"principle" : {
					"companyId" : "58ff",
				},
				"resource" : [
					"upload/{companyId}/{account}/"
				],
			}
		],
	};
	const tokenPayload = {
		platform: 'luna',
		companyId: '58ff',
		account: 'andy',
	};
	let bucket: BucketEntity;
	let file: FileEntity;
	let storageBucket: CustomStorageBucket;
	let storageFile: CustomStorageFile;
	let fileId = '';
	beforeAll(async (done) => {
		await AppInitializer.tryDbClient();
		AppInitializer.tryInjector();
		db = defaultContainer.getNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
		await db.clearData();
		agentClient = superTest.agent(new App().app);
		bucketRepo = defaultContainer.get<IBucketRepository>(InjectorCodes.I_BUCKET_REPO);
		fileRepo = defaultContainer.get<IFileRepository>(InjectorCodes.I_FILE_REPO);

		const buffer = fs.readFileSync('./b_list.xlsx');

		const storageClient = mock<ICustomStorageClient>();
		storageClient.createBucket.mockResolvedValue();
		storageClient.createFile.mockResolvedValue();
		storageClient.download.mockResolvedValue(buffer);
		defaultContainer.rebind<ICustomStorageClient>(commonInjectorCodes.I_STORAGE_CLIENT).toConstantValue(storageClient);

		bucket = new BucketEntity();
		bucket.platform = 'luna';
    	bucket.name = defaultBody.name;
		bucket.policy = defaultBody.policy;

		storageBucket = new CustomStorageBucket();
    	storageBucket.bucketName = defaultBody.name;

		// 建立儲存桶
		bucket = await bucketRepo.create(bucket, storageBucket) as BucketEntity;

		// 上傳檔案
		storageFile = new CustomStorageFile();
		storageFile.bucketName = storageBucket.bucketName;
    	storageFile.source = './b_list.xlsx';
    	storageFile.target = 'upload/58ff/andy/b_list.xlsx';

		file = new FileEntity();
		file.generateFileName();
    	file.bucketId = bucket.id;
    	file.platform = 'luna';
    	file.destination = 'upload/58ff/andy/b_list.xlsx';
		file.mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
		file.size = 7416;

		const fileResult = await fileRepo.upload(file, storageFile);
		fileId = fileResult?.id as string;

		done();
	});
	afterAll(async (done) => {
		done();
	});
	describe('Required fileds', () => {
		test.todo('[2000x] file欄位缺少');
		test.todo('[2000x] data欄位缺少');
	});
	describe('validation rules', () => {
		test.only('[4009] 檔案不存在', async () => {
			const fakeFileId = '61e927b2d0b69fc0fcb75c0b';
			const endpoint = util.format(_ENDPOINT, defaultBody.name, fakeFileId);
			const payload = CustomUtils.deepClone<any>(tokenPayload);
			let token = jwt.sign(
				payload,
				defConf.TOKEN_SECRET,
				{ expiresIn : defConf.TOKEN_DURATION }
			);
			const res = await agentClient
				.get(endpoint)
				.set('Authorization', `Bearer ${token}`);

			expect(res.status).toBe(400);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: 4009,
				message: 'File not found',
			});
		});
		test.only('[4008] 權限被拒絕', async () => {
			const endpoint = util.format(_ENDPOINT, defaultBody.name, fileId);
			const payload = CustomUtils.deepClone<any>(tokenPayload);
			payload.account = 'fakeUser';

			let token = jwt.sign(
				payload,
				defConf.TOKEN_SECRET,
				{ expiresIn : defConf.TOKEN_DURATION }
			);
			const res = await agentClient
				.get(endpoint)
				.set('Authorization', `Bearer ${token}`);

			expect(res.status).toBe(400);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: 4008,
				message: 'Permission denied',
			});
		});
	});
	describe('success', () => {
		test.only('success', async () => {
			const endpoint = util.format(_ENDPOINT, defaultBody.name, fileId);
			const payload = CustomUtils.deepClone<any>(tokenPayload);
			let token = jwt.sign(
				payload,
				defConf.TOKEN_SECRET
			);

			const res = await agentClient
				.get(endpoint)
				.set('Authorization', `Bearer ${token}`);

			expect(res.status).toBe(200);
		});
	});
});