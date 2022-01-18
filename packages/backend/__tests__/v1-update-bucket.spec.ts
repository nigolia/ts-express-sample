import * as util from 'util';
import { ObjectId } from 'mongodb';
import * as superTest from 'supertest';
import { mock } from 'jest-mock-extended';
import { defaultContainer, IMongooseClient, CustomStorageBucket, commonInjectorCodes } from '@demo/app-common';
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

describe('update bucket spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let bucketRepo: IBucketRepository;
	let db: IMongooseClient;
	const defaultBody: IBody = {
		name: 'andy-bucket-7',
	};
	let entity: BucketEntity;
	let storageBucket: CustomStorageBucket;
	beforeAll(async (done) => {
		await AppInitializer.tryDbClient();
		AppInitializer.tryInjector();
		db = defaultContainer.getNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
		await db.clearData();
		agentClient = superTest.agent(new App().app);
		bucketRepo = defaultContainer.get<IBucketRepository>(InjectorCodes.I_BUCKET_REPO);

		entity = new BucketEntity();
    	entity.name = defaultBody.name;
    	entity.creator = new ObjectId().toHexString();

		storageBucket = new CustomStorageBucket();
    	storageBucket.bucketName = defaultBody.name;
	
		await bucketRepo.create(entity, storageBucket);
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
			const endpoint = util.format(_ENDPOINT, defaultBody.name);
			const res = await agentClient
				.delete(endpoint);

			expect(res.status).toBe(200);
			const bucket = await bucketRepo.findOneByName(defaultBody.name) as BucketEntity;
			expect(bucket).toBeUndefined();
		});
	});
});