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
	lazyInjectNamed,
} from '@demo/app-common';
import { ModelCodes } from '../../domain/enums/model-codes';
import { ErrorCodes } from '../../domain/enums/error-codes';
import { IBucketDocument } from '../../infra/orm-models';
import { BucketEntity } from '../../domain/entities/bucket-entity';
import { IBucketRepository } from '../../domain/repositories/i-bucket-repository';

@injectable()
export class BucketRepository implements IBucketRepository {
    @lazyInjectNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT)
	private _defaultClient: TNullable<IMongooseClient>;
    @lazyInject(commonInjectorCodes.I_STORAGE_CLIENT)
	private _client: TNullable<ICustomStorageClient>;

    create = async (entity: TNullable<BucketEntity>, storageBucket: CustomStorageBucket): Promise<TNullable<BucketEntity>> => {
    	if (!entity || !storageBucket) {
    		return undefined;
    	}
    	try {
    		// cloud storage create bucket
    		await this._client?.createBucket(storageBucket.bucketName);
    	} catch (ex) {
    		// console.log('ex: ', JSON.stringify(ex, undefined, 2));
    		throw new CustomError(ErrorCodes.BUCKET_IS_ALREADY_EXISTS);
    	}

    	try {
    		// db create bucket document
    		const col = this._defaultClient?.getModel<IBucketDocument>(ModelCodes.BUCKET);
    		let obj = <IBucketDocument>{
    			platform: entity.platform,
    			name: entity.name,
    			policy: entity.policy,
    			cors: entity.cors,
    			lifecycle: entity.lifecycle,
    		};
    		obj = await col?.create(obj) as IBucketDocument;
    		entity.id = obj.id.toString();

    		return entity;
    	} catch (ex) {
    		// console.log('ex: ', ex);
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
    	const col = this._defaultClient?.getModel<IBucketDocument>(ModelCodes.BUCKET);
    	if (!CustomValidator.nonEmptyString(entity.name)) {
    		return undefined;
    	}
    	const q = {
    		name: entity.name,
    		platform: entity.platform,
    		valid: true,
    	};
    	let obj = <IBucketDocument>{
    		policy: entity.policy,
    		cors: entity.cors,
    		lifecycle: entity.lifecycle,
    	};
    	await col?.updateOne(q, { $set: obj });
	
    	return entity;
    }
    findOneByName = async (name: string): Promise<TNullable<BucketEntity>> => {
    	if (!CustomValidator.nonEmptyString(name)) {
    		return undefined;
    	}
    	try {
    		const col = this._defaultClient?.getModel<IBucketDocument>(ModelCodes.BUCKET);
    		const q = {
    			name,
    			valid: true,
    		};
    		const doc = await col?.findOne(q).lean() as IBucketDocument;
    		return this._transform(doc);
    	} catch (ex) {
    		const err = CustomError.fromInstance(ex)
    			.useError(cmmErr.ERR_EXEC_DB_FAIL);

    		LOGGER.error(`DB operations fail, ${err.stack}`);
    		throw err;
    	}
    }
	delete = async (name: string): Promise<void> => {
		if (!CustomValidator.nonEmptyString(name)) {
    		return undefined;
    	}
		try {
			const response = await this._client?.deleteBucket(name);
			if (!response) {
				throw new Error('gcs bucket delete faild');
			}
			const col = this._defaultClient?.getModel<IBucketDocument>(ModelCodes.BUCKET);
			const q = {
    			name,
    		};
			const obj = {
				name: `${name}_delete_${Date.now()}`,
				valid: false,
				invalidTime: new Date(),
			};
    		await col?.updateOne(q, { $set: obj }).lean();
		} catch (ex) {
			console.log('~~~ex: ', ex);
    		const err = CustomError.fromInstance(ex)
    			.useError(cmmErr.ERR_EXEC_DB_FAIL);

    		LOGGER.error(`DB operations fail, ${err.stack}`);
    		throw err;
    	}
	}
	list = async (entity: TNullable<BucketEntity>): Promise<TNullable<BucketEntity[]>> => {
		if (!entity) {
    		return undefined;
    	}
		const platform = entity?.platform;
		if (!CustomValidator.nonEmptyString(platform)) {
			return undefined;
		}
		try {
    		const col = this._defaultClient?.getModel<IBucketDocument>(ModelCodes.BUCKET);
    		const q = {
    			platform,
				valid: true,
    		};
    		const docs: IBucketDocument[] = await col?.find(q).lean() as IBucketDocument[];
			const results: TNullable<BucketEntity[]> = [];
			for (const doc of docs) {
				results.push(this._transform(doc) as BucketEntity);
			}
    		return results;
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
}