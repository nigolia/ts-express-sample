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
} from '@demo/app-common';
import { ModelCodes } from '../../domain/enums/model-codes';
import { IFileDocument } from '../../infra/orm-models';
import { FileEntity } from '../../domain/entities/file-entity';
import { IFileRepository } from '../../domain/repositories/i-file-repository';

@injectable()
export class FileRepository implements IFileRepository {
    private _defaultClient: IMongooseClient;

    constructor(
		@inject(commonInjectorCodes.I_MONGOOSE_CLIENT) @named(commonInjectorCodes.DEFAULT_MONGO_CLIENT) defaultClient: IMongooseClient
    ) {
    	this._defaultClient = defaultClient;
    }
    save = async (entity: TNullable<FileEntity>): Promise<TNullable<FileEntity>> => {
    	if (!entity) {
    		return undefined;
    	}
    	const col = this._defaultClient.getModel<IFileDocument>(ModelCodes.FILE);
    	if (!CustomValidator.nonEmptyString(entity.id)) {
    		try {
    			let obj = <IFileDocument>{
    				creator: entity.creator,
    				modifier: entity.creator,
    				bucketId: entity.bucketId,
    				platform: entity.platform,
    				name: entity.name,
    				destination: entity.destination,
    				metadata: entity.metadata,
    				size: entity.size,
    				type: entity.type,
    			};
    			obj = await col.create(obj); 
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
    	await col.updateOne({ id: entity.id }, { $set: obj });
    	return entity;
    }
    findOne = async (id: string): Promise<TNullable<FileEntity>> => {
    	if (!CustomValidator.nonEmptyString(id)) {
    		return undefined;
    	}
    	try {
    		const col = this._defaultClient.getModel<IFileDocument>(ModelCodes.FILE);
    		const q = {
    			id,
    		};
    		const doc: IFileDocument = await col.findOne(q).lean();
    		return this._transform(doc);
    	} catch (ex) {
    		const err = CustomError.fromInstance(ex)
    			.useError(cmmErr.ERR_EXEC_DB_FAIL);

    		LOGGER.error(`DB operations fail, ${err.stack}`);
    		throw err;
    	}
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