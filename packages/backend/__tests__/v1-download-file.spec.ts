import * as util from 'util';
import { ObjectId } from 'mongodb';
import * as superTest from 'supertest';
import { mock } from 'jest-mock-extended';
import { defaultContainer, IMongooseClient, CustomStorageBucket, CustomStorageFile, commonInjectorCodes } from '@demo/app-common';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { App } from '../src/bootstrap/app';
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { IBucketRepository } from '../src/domain/repositories/i-bucket-repository';
import { IFileRepository } from '../src/domain/repositories/i-file-repository';
import { BucketEntity } from '../src/domain/entities/bucket-entity';
import { FileEntity } from '../src/domain/entities/file-entity';
import { MockBucket } from '../__mocks__/mock-bucket';

const _ENDPOINT = '/api/v1/storage/b/%s/o/%s';

interface IBody {
	name: string;
};

describe('download file spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let bucketRepo: IBucketRepository;
	let fileRepo: IFileRepository;
	let db: IMongooseClient;
	const defaultBody: IBody = {
		name: 'andy-bucket-7',
	};
	let bucket: BucketEntity;
	let file: FileEntity;
	let storageBucket: CustomStorageBucket;
	let storageFile: CustomStorageFile;
	beforeAll(async (done) => {
		await AppInitializer.tryDbClient();
		AppInitializer.tryInjector();
		db = defaultContainer.getNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
		await db.clearData();
		agentClient = superTest.agent(new App().app);
		bucketRepo = defaultContainer.get<IBucketRepository>(InjectorCodes.I_BUCKET_REPO);
		fileRepo = defaultContainer.get<IFileRepository>(InjectorCodes.I_FILE_REPO);

		bucket = new BucketEntity();
    	bucket.name = defaultBody.name;
    	bucket.creator = new ObjectId().toHexString();

		storageBucket = new CustomStorageBucket();
    	storageBucket.bucketName = defaultBody.name;
		
		// 建立儲存桶
		bucket = await bucketRepo.create(bucket, storageBucket) as BucketEntity;

		storageFile = new CustomStorageFile();
		storageFile.bucketName = storageBucket.bucketName;
    	storageFile.source = './b_list.xlsx';
    	storageFile.target = 'john/b_list.xlsx';

		file = new FileEntity();
		file.generateFileName();
    	file.bucketId = bucket.id;
    	file.platform = 'Luna';
    	file.destination = 'john/b_list.xlsx';
		file.mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
		file.size = 7416;
    	file.creator = new ObjectId().toHexString();

		await fileRepo.upload(file, storageFile);

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
		// test.todo('[2000x] 權限不足');
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