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
	lazyInject,
	lazyInjectNamed,
} from '@demo/app-common';
import { ModelCodes } from '../../domain/enums/model-codes';
import { ErrorCodes } from '../../domain/enums/error-codes';
import { ILogDocument } from '../../infra/orm-models';
import { ILogRepository } from 'backend/src/domain/repositories/i-log-repository';
import { LogEntity } from 'backend/src/domain/entities/log-entity';

@injectable()
export class LogRepository implements ILogRepository {
	@lazyInjectNamed(commonInjectorCodes.I_MONGOOSE_CLIENT, commonInjectorCodes.DEFAULT_MONGO_CLIENT)
    private _defaultClient: TNullable<IMongooseClient>;

	create = async (entity: TNullable<LogEntity>):Promise<void> => {
		if (!entity) {
    		return undefined;
    	}
		const col = this._defaultClient?.getModel<ILogDocument>(ModelCodes.LOG);
		let obj = <ILogDocument>{
			traceId: entity.traceId,
			status: entity.status,
			creatorId: entity.creatorId,
			creatorName: entity.creatorName,
			platform: entity.platform,
			method: entity.method,
			columnName: entity.columnName,
			token: entity.token,
			rawValue: entity.rawValue,
		};
		obj = await col?.create(obj) as ILogDocument;
	}

	update = async (entity: TNullable<LogEntity>):Promise<void> => {
		if (!entity) {
    		return undefined;
    	}
		if (!CustomValidator.nonEmptyString(entity.traceId)) {
			return undefined;
		}
		try {
			const col = this._defaultClient?.getModel<ILogDocument>(ModelCodes.LOG);
			let obj = <ILogDocument>{};
			if (entity.status) {
				obj.status = entity.status;
			}
			if (entity.token) {
				obj.token = entity.token;
			}
			if (entity.platform) {
				obj.platform = entity.platform;
			}
			if (entity.creatorId) {
				obj.creatorId = entity.creatorId;
			}
			if (entity.creatorName) {
				obj.creatorName = entity.creatorName;
			}
			if (entity.code) {
				obj.code = entity.code;
			}
			if (entity.message) {
				obj.message = entity.message;
			}

			await col?.updateOne({ traceId: entity.traceId }, { $set: obj });
		} catch (ex) {
			const err = CustomError.fromInstance(ex)
				.useError(cmmErr.ERR_EXEC_DB_FAIL);

			LOGGER.error(`DB operations fail, ${err.stack}`);
			throw err;
		}
	}
}