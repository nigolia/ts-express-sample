import * as util from 'util';
import { ObjectId } from 'mongodb';
import * as superTest from 'supertest';
import jwt from 'jsonwebtoken';
import { mock } from 'jest-mock-extended';
import { CustomUtils, defaultContainer, ICustomStorageClient, IMongooseClient, CustomStorageBucket, commonInjectorCodes, defConf } from '@demo/app-common';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { App } from '../src/bootstrap/app';
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { IBucketRepository } from '../src/domain/repositories/i-bucket-repository';
import { BucketEntity } from '../src/domain/entities/bucket-entity';
import { MockBucket } from '../__mocks__/mock-bucket';

const _ENDPOINT = '/api/v1/storage/b/%s';

interface IBody {
	name: string;
};

describe('create bucket spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let bucketRepo: IBucketRepository;
	let db: IMongooseClient;
	const defaultBody: IBody = {
		name: 'andy-bucket-test',
	};
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

		const storageClient = mock<ICustomStorageClient>();
		storageClient.createBucket.mockResolvedValue();
		defaultContainer.rebind<ICustomStorageClient>(commonInjectorCodes.I_STORAGE_CLIENT).toConstantValue(storageClient);

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
		test.todo('[2000x] 權限不足');
		test.todo('[2000x] 儲存桶名稱不正確');
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
				.send(defaultBody);

			expect(res.status).toBe(200);
			const bucket = await bucketRepo.findOneByName(bucketName) as BucketEntity;
			expect(bucket).toBeTruthy();
			expect(bucket.name).toBe(bucketName);
		});
	});
});