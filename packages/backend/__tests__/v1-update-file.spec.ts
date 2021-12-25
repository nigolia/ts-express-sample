import * as util from 'util';
import { ObjectId } from 'mongodb';
import * as superTest from 'supertest';
import { CustomError, CustomUtils, defaultContainer, IMongooseClient, commonInjectorCodes } from '@demo/app-common';
import { AppInitializer } from '../src/bootstrap/app-initializer';
import { App } from '../src/bootstrap/app';
import { InjectorCodes } from '../src/domain/enums/injector-codes';
import { ErrorCodes } from '../src/domain/enums/error-codes';
import { IFileRepository } from '../src/domain/repositories/i-file-repository';
import { FileEntity } from '../src/domain/entities/file-entity';

const _ENDPOINT = '/api/v1/storage/b/%s/o/%s';

interface IBody {
	name: string;
	metadata: any;
};

describe('Update file spec', () => {
	let agentClient: superTest.SuperAgentTest;
	let fileRepo: IFileRepository;
	let db: IMongooseClient;
	const defaultBody: IBody = {
		name: 'iLearning',
		metadata: { tag: 'people' },
	};
	let entity:FileEntity;
	beforeAll(async (done) => {
		await AppInitializer.tryDbClient();
		AppInitializer.tryInjector();
		db = defaultContainer.getNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT);
		await db.clearData();
		agentClient = superTest.agent(new App().app);
		fileRepo = defaultContainer.get<IFileRepository>(InjectorCodes.I_FILE_REPO);
		entity = new FileEntity();
		entity.platform = 'LUNA';
		entity.bucketId = new ObjectId().toHexString();
		entity.creator = new ObjectId().toHexString();
		entity.name = 'BBB';
		entity.destination = '/XXX/BBBB';
		entity = await fileRepo.save(entity) as FileEntity;
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
			const endpoint = util.format(_ENDPOINT, 'XX', entity.id);
			const res = await agentClient
				.patch(endpoint)
				.send(defaultBody);

			expect(res.status).toBe(200);
			const file = await fileRepo.findOne(entity.id) as FileEntity;
			expect(file).toBeTruthy();
			expect(file.name).toBe(defaultBody.name);
			expect(file.metadata).toEqual(defaultBody.metadata);
		});
	});
});