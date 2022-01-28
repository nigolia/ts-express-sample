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
	CustomStorageFile,
	lazyInject,
	lazyInjectNamed,
} from '@demo/app-common';
import { ModelCodes } from '../../domain/enums/model-codes';
import { ErrorCodes } from '../../domain/enums/error-codes';
import { IFileDocument } from '../../infra/orm-models';
import { FileEntity } from '../../domain/entities/file-entity';
import { IFileRepository } from '../../domain/repositories/i-file-repository';
import { BucketEntity } from '../../domain/entities/bucket-entity';

@injectable()
export class FileRepository implements IFileRepository {
	@lazyInjectNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT)
    private _defaultClient: TNullable<IMongooseClient>;
	@lazyInject(commonInjectorCodes.I_STORAGE_CLIENT)
    private _client: TNullable<ICustomStorageClient>;

    upload = async (entity: TNullable<FileEntity>, storageFile: CustomStorageFile): Promise<TNullable<FileEntity>> => {
    	if (!entity || !storageFile) {
    		return undefined;
    	}
    	try {
    		// upload file to cloud storage
    		await this._client?.createFile(storageFile);
    		// create file document to db
    		const col = this._defaultClient?.getModel<IFileDocument>(ModelCodes.FILE);
    		let obj = <IFileDocument>{
    			creator: entity.creator,
    			modifier: entity.creator,
    			bucketId: entity.bucketId,
    			platform: entity.platform,
    			name: entity.name,
    			destination: entity.destination,
    			mimetype: entity.mimetype,
    			metadata: entity.metadata,
    			size: entity.size,
    			type: entity.type,
    		};
    		obj = await col?.create(obj) as IFileDocument;
    		entity.id = obj.id.toString();

    		return entity;
    	} catch (ex) {
    		const err = CustomError.fromInstance(ex)
    			.useError(cmmErr.ERR_EXEC_DB_FAIL);

    		LOGGER.error(`DB operations fail, ${err.stack}`);
    		throw err;
    	}
    }
    update = async (entity: TNullable<FileEntity>): Promise<TNullable<FileEntity>> => {
    	if (!entity) {
    		return undefined;
    	}
    	const col = this._defaultClient?.getModel<IFileDocument>(ModelCodes.FILE);
    	// if (!CustomValidator.nonEmptyString(entity.id)) {
    	// 	return undefined;
    	// }
    	if (!CustomValidator.nonEmptyString(entity.id)) {
    		try {
    			let obj = <IFileDocument>{
    				creator: entity.creator,
    				modifier: entity.creator,
    				bucketId: entity.bucketId,
    				platform: entity.platform,
    				name: entity.name,
    				destination: entity.destination,
    				mimetype: entity.mimetype,
    				metadata: entity.metadata,
    				size: entity.size,
    				type: entity.type,
    			};
    			obj = await col?.create(obj) as IFileDocument; 
    			entity.id = obj.id.toString();
    			return entity;
    		} catch (ex) {
    			const err = CustomError.fromInstance(ex)
    				.useError(cmmErr.ERR_EXEC_DB_FAIL);

    			LOGGER.error(`DB operations fail, ${err.stack}`);
    			throw err;
    		}
    	}
    	let obj = <IFileDocument>{
    		name: entity.name,
    		metadata: entity.metadata,
    	};
    	await col?.updateOne({ id: entity.id }, { $set: obj });

    	return entity;
    }
    findOne = async (_id: string): Promise<TNullable<FileEntity>> => {
    	if (!CustomValidator.nonEmptyString(_id)) {
    		return undefined;
    	}
    	try {
    		const col = this._defaultClient?.getModel<IFileDocument>(ModelCodes.FILE);
    		const q = {
    			_id,
    		};
    		const doc: IFileDocument = await col?.findOne(q).lean() as IFileDocument;
    		return this._transform(doc);
    	} catch (ex) {
    		const err = CustomError.fromInstance(ex)
    			.useError(cmmErr.ERR_EXEC_DB_FAIL);

    		LOGGER.error(`DB operations fail, ${err.stack}`);
    		throw err;
    	}
    }
	list = async (entity: TNullable<FileEntity>): Promise<TNullable<FileEntity[]>> => {
		if (!entity) {
    		return undefined;
    	}
		const platform = entity?.platform;
		const bucketId = entity?.bucketId;
		if (!CustomValidator.nonEmptyString(platform)) {
			return undefined;
		}
		try {
    		const col = this._defaultClient?.getModel<IFileDocument>(ModelCodes.FILE);
    		const q = {
    			platform,
				bucketId,
				valid: true,
    		};
    		const docs: IFileDocument[] = await col?.find(q).lean() as IFileDocument[];
			const results: TNullable<FileEntity[]> = [];
			for (const doc of docs) {
				results.push(this._transform(doc) as FileEntity);
			}
    		return results;
    	} catch (ex) {
    		const err = CustomError.fromInstance(ex)
    			.useError(cmmErr.ERR_EXEC_DB_FAIL);

    		LOGGER.error(`DB operations fail, ${err.stack}`);
    		throw err;
    	}
	}
	delete = async (bucket: BucketEntity, file: FileEntity, storageFile: CustomStorageFile, token: any): Promise<void> => {
		const matchPolicy = this._checkPolicy(bucket.policy, file.destination, token);
		if (!matchPolicy) {
			throw new CustomError(ErrorCodes.PERMISSION_IS_DENY);
		}
		try {
			if (!this._client) {
				throw new Error('_client is required');
			}

			await this._client?.deleteFile(storageFile);

			const col = this._defaultClient?.getModel<IFileDocument>(ModelCodes.FILE);
			const obj = {
				valid: false,
				invalidTime: new Date(),
			};
			await col?.updateOne({ id: file.id }, { $set: obj });

		} catch (ex) {
    		const err = CustomError.fromInstance(ex)
    			.useError(cmmErr.ERR_EXEC_DB_FAIL);

    		LOGGER.error(`DB operations fail, ${err.stack}`);
    		throw err;
    	}
	}
	download = async (bucket: BucketEntity, file: FileEntity, storageFile: CustomStorageFile, token: any): Promise<Buffer> => {
		const matchPolicy = this._checkPolicy(bucket.policy, file.destination, token);
		if (!matchPolicy) {
			throw new CustomError(ErrorCodes.PERMISSION_IS_DENY);
		}
		try {
			if (!this._client) {
				throw new Error('_client is required');
			}
			storageFile.target = file.destination;

			return this._client.download(storageFile);
		} catch (ex) {
    		const err = CustomError.fromInstance(ex)
    			.useError(cmmErr.ERR_EXEC_DB_FAIL);

    		LOGGER.error(`DB operations fail, ${err.stack}`);
    		throw err;
    	}
	}
	private _checkPolicy = (policy: any[], target: string, token: any): Boolean => {
		// 是否有符合的Policy
		let matchPolicy = false;
		// 目標路徑取到最後一層目錄位置(Ex: upload/58aff/xxxx.xlsx -> upload/58aff)
		target = target.substring(0, target.lastIndexOf('/'));

		for (const _policy of policy) {
			const resource = _policy.resource as string[];
			const principle = _policy.principle;
			console.log('principle: ', principle);
			for (let path of resource) {
				// 資源路徑取到最後一層目錄位置(Ex: upload/58aff/ -> upload/58aff)
				path = path.substring(0, path.lastIndexOf('/'));
				// 將路徑裡的patern做替換(使用principal的內容)
				if (principle) {
					path = this._replacePathByPatern(path, principle);
				}
				// 將路徑裡的patern做替換(使用token的內容)
				path = this._replacePathByPatern(path, token);
				console.log('path: ', path);
				if (target.indexOf(path) > -1) {
					matchPolicy = true;
					break;
				}
			}
			if (matchPolicy) {
				break;
			}
		}
		console.log('matchPolicy: ', matchPolicy);
		return matchPolicy;
	}
	private _replacePathByPatern = (path: string, patern: any): string => {
		for (const key of Object.keys(patern) as string[]) {
			const value = patern[key];
			const regexp = new RegExp(`{${key}}`, 'g');
			path = path.replace(regexp, value);
		}
		return path;
	}

    private _transform = (doc: TNullable<IFileDocument>): TNullable<FileEntity> => {
    	if (!doc) {
    		return undefined;
    	}
    	const obj = CustomClassBuilder.build(FileEntity, doc) as FileEntity;
    	obj.id = doc._id.toString();
    	obj.creator = doc.creator.toString();
    	obj.bucketId = doc.bucketId.toString();
    	obj.metadata = doc.metadata;
    	return obj;
    }
}