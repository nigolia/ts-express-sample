import { injectable, inject, named } from 'inversify';
import {
	LOGGER,
	TNullable,
	CustomValidator,
	IMongooseClient,
	commonInjectorCodes,
	CustomClassBuilder,
	ErrorCodes as cmmErr,
	CustomError,
	ICustomStorageClient,
	CustomStorageBucket,
	lazyInject,
} from '@demo/app-common';
import { ModelCodes } from '../../domain/enums/model-codes';
import { IBucketDocument } from '../../infra/orm-models';
import { BucketEntity } from '../../domain/entities/bucket-entity';
import { IBucketRepository } from '../../domain/repositories/i-bucket-repository';
import { FileEntity } from 'backend/src/domain/entities/file-entity';

@injectable()
export class BucketRepository implements IBucketRepository {
    private _defaultClient: IMongooseClient;
    private _client: ICustomStorageClient;

    constructor(
		@inject(commonInjectorCodes.I_MONGOOSE_CLIENT) @named(commonInjectorCodes.DEFAULT_MONGO_CLIENT) defaultClient: IMongooseClient,
        @inject(commonInjectorCodes.I_STORAGE_CLIENT) client: ICustomStorageClient
    ) {
    	this._defaultClient = defaultClient;
    	this._client = client;
    }
    create = async (entity: TNullable<BucketEntity>, storageBucket: CustomStorageBucket): Promise<TNullable<BucketEntity>> => {
    	if (!entity || !storageBucket) {
    		return undefined;
    	}
    	try {
    		await this._client?.createBucket(storageBucket.bucketName);
    		console.log(`BucketEntity: ${BucketEntity}`);
    		// db create file record
    		const col = this._defaultClient.getModel<IBucketDocument>(ModelCodes.BUCKET);
    		let obj = <IBucketDocument>{
    		// 	creator: entity.creator,
    		// 	modifier: entity.creator,
    		// 	bucketId: entity.bucketId,
    		// 	platform: entity.platform,
    			name: entity.name,
    		// 	destination: entity.destination,
    		// 	metadata: entity.metadata,
    		// 	size: entity.size,
    		// 	type: entity.type,
    		};
    		obj = await col.create(obj);
    		entity.id = obj.id.toString();

    		return entity;
    	} catch (ex) {
    		console.log('ex: ', ex);
    		const err = CustomError.fromInstance(ex)
    			.useError(cmmErr.ERR_EXEC_DB_FAIL);

    		LOGGER.error(`DB operations fail, ${err.stack}`);
    		throw err;
    	}
    }
    update(entity: TNullable<BucketEntity>): Promise<TNullable<BucketEntity>> {
    	throw new Error('Method not implemented.');
    }
    findOneByName = async (name: string): Promise<TNullable<BucketEntity>> => {
    	if (!CustomValidator.nonEmptyString(name)) {
    		return undefined;
    	}
    	try {
    		const col = this._defaultClient.getModel<IBucketDocument>(ModelCodes.BUCKET);
    		const q = {
    			name,
    		};
    		const doc: IBucketDocument = await col.findOne(q).lean();
    		return this._transform(doc);
    	} catch (ex) {
    		const err = CustomError.fromInstance(ex)
    			.useError(cmmErr.ERR_EXEC_DB_FAIL);

    		LOGGER.error(`DB operations fail, ${err.stack}`);
    		throw err;
    	}
    }

	private _transform = (doc: TNullable<IBucketDocument>): TNullable<BucketEntity> => {
    	if (!doc) {
    		return undefined;
    	}
    	const obj = CustomClassBuilder.build(BucketEntity, doc) as BucketEntity;
    	obj.id = doc._id.toString();
    	return obj;
	}
	/*
    create = async (entity: TNullable<BucketEntity>, storageFile: CustomStorageFile): Promise<TNullable<BucketEntity>> => {
    	if (!entity || !storageFile) {
    		return undefined;
    	}
    	try {
    		// await this._client?.createFile(storageFile);
    		// db create file record
    		const col = this._defaultClient.getModel<IBucketDocument>(ModelCodes.BUCKET);
    		// let obj = <IFileDocument>{
    		// 	creator: entity.creator,
    		// 	modifier: entity.creator,
    		// 	bucketId: entity.bucketId,
    		// 	platform: entity.platform,
    		// 	name: entity.name,
    		// 	destination: entity.destination,
    		// 	metadata: entity.metadata,
    		// 	size: entity.size,
    		// 	type: entity.type,
    		// };
    		obj = await col.create(obj);
    		entity.id = obj.id.toString();

    		return entity;
    	} catch (ex) {
    		console.log('ex: ', ex);
    		const err = CustomError.fromInstance(ex)
    			.useError(cmmErr.ERR_EXEC_DB_FAIL);

    		LOGGER.error(`DB operations fail, ${err.stack}`);
    		throw err;
    	}
    }
    update = async (entity: TNullable<BucketEntity>): Promise<TNullable<BucketEntity>> => {
    	if (!entity) {
    		return undefined;
    	}
    	const col = this._defaultClient.getModel<IBucketDocument>(ModelCodes.FILE);
    	if (!CustomValidator.nonEmptyString(entity.id)) {
    		return undefined;
    	}
    	let obj = <IBucketDocument>{
    		name: entity.name,
    		metadata: entity.metadata,
    	};
    	await col.updateOne({ id: entity.id }, { $set: obj });
    	return entity;
    }
    findOne = async (id: string): Promise<TNullable<BucketEntity>> => {
    	if (!CustomValidator.nonEmptyString(id)) {
    		return undefined;
    	}
    	try {
    		const col = this._defaultClient.getModel<IBucketDocument>(ModelCodes.BUCKET);
    		const q = {
    			id,
    		};
    		const doc: IBucketDocument = await col.findOne(q).lean();
    		return this._transform(doc);
    	} catch (ex) {
    		const err = CustomError.fromInstance(ex)
    			.useError(cmmErr.ERR_EXEC_DB_FAIL);

    		LOGGER.error(`DB operations fail, ${err.stack}`);
    		throw err;
    	}
    }
	*/
}