import * as util from 'util';
import * as superTest from 'supertest';
import jwt from 'jsonwebtoken';
import { mock } from 'jest-mock-extended';
import { CustomUtils, defaultContainer, ICustomStorageClient, IMongooseClient, CustomStorageBucket, commonInjectorCodes, defConf } from '@demo/app-common';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { App } from '../src/bootstrap/app';
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { IBucketRepository } from '../src/domain/repositories/i-bucket-repository';
import { BucketEntity } from '../src/domain/entities/bucket-entity';

const _ENDPOINT = '/api/v1/storage/b/%s';

interface IBody {
	cors: any;
};

describe('update bucket spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let bucketRepo: IBucketRepository;
	let db: IMongooseClient;
	const defaultBody: IBody = {
		cors: [
			{
				"origin": "https://luna.compal-health.com",
				"method": ["POST", "GET", "DELETE"],
				"responseHeader": ["Content-Type"],
				"maxAgeSeconds": 3600,
			}
		],
	};
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

		const storageClient = mock<ICustomStorageClient>();
		storageClient.createBucket.mockResolvedValue();
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
	describe('validation rules', () => {
		test.only('[4003] 儲存桶不存在', async () => {
			const fakeBucketName = 'andy-bucket-test-fake';
			const endpoint = util.format(_ENDPOINT, fakeBucketName);
			const payload = CustomUtils.deepClone<any>(tokenPayload);
			let token = jwt.sign(
				payload,
				defConf.TOKEN_SECRET
			);
			const res = await agentClient
				.patch(endpoint)
				.set('Authorization', `Bearer ${token}`)
				.send(defaultBody);

			expect(res.status).toBe(400);
			expect(res.body).toEqual({
				traceId: expect.any(String),
				code: 4003,
				message: 'Bucket not found',
			});
		});
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
				.patch(endpoint)
				.set('Authorization', `Bearer ${token}`)
				.send(defaultBody);

			expect(res.status).toBe(200);
			const bucket = await bucketRepo.findOneByName(bucketName) as BucketEntity;
			expect(bucket).toBeTruthy();
			expect(bucket.cors).toStrictEqual(defaultBody.cors);
		});
	});
});