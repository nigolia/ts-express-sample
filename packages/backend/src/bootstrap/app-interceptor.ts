import * as fs from 'fs-extra';
import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import { LOGGER, HttpCodes, CustomError, CustomResult, getTraceId, CustomValidator, lazyInject, TNullable } from '@demo/app-common';
import { ICustomExpressRequest } from '../application/application-types';
import { LogStatusCodes } from '../domain/enums/log-status-codes';
import { ErrorCodes } from '../domain/enums/error-codes';
import { InjectorCodes } from '../domain/enums/injector-codes';
import { IBucketRepository } from '../domain/repositories/i-bucket-repository';
import { BucketEntity } from '../domain/entities/bucket-entity';
import { ILogRepository } from '../domain/repositories/i-log-repository';
import { LogEntity } from '../domain/entities/log-entity';
@injectable()
export class AppInterceptor {

	@lazyInject(InjectorCodes.I_LOG_REPO)
	private static _repoLog: TNullable<ILogRepository>;

	/** Before starting request handler */
	static async beforeHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
		LOGGER.info('-----------------------------------------------------------');
		LOGGER.info(`${req.method} ${req.path} - start`);
		
		if (!['/api/v1'].includes(req.path)) {
			const log = new LogEntity();
			log.traceId = getTraceId();
			log.status = LogStatusCodes.BEFORE_HANDLER;
			log.method = req.method;
			log.columnName = req.path;
			log.rawValue = req.body;
			await AppInterceptor?._repoLog?.create(log);
		}

		await next();
	}

	/** Complete request */
	static async completeHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
		const r = res.locals['result'] as CustomResult;
		if (!r) {
			return next();
		}
		const traceId = getTraceId();
		if (!['/api/v1'].includes(req.path)) {
			const log = new LogEntity();
			log.traceId = traceId;
			log.status = LogStatusCodes.COMPLETE_HANDLER;
			log.token = req.user;
			log.platform = req.user?.__platform as string;
			log.creatorId = req.user?.__userId as string;
			log.creatorName = req.user?.__userName as string;
			await AppInterceptor._repoLog?.update(log);
		}
		LOGGER.info(`${req.method} ${req.originalUrl} - 200`);
		r.traceId = traceId;
		res.status(HttpCodes.OK).json(r);
	}

	/** Error handler */
	static async errorHandler(ex: any, req: Request, res: Response, next: NextFunction): Promise<any> {
		const traceId = getTraceId();
		let error: CustomError = ex;
		if (!(ex instanceof CustomError)) {
			LOGGER.error(ex.stack);
			error = new CustomError('', ex.message);
		}
		if (!['/api/v1'].includes(req.path)) {
			const log = new LogEntity();
			log.traceId = traceId;
			log.status = LogStatusCodes.ERROR_HANDLER;
			log.token = req.user;
			log.platform = req.user?.__platform as string;
			log.creatorId = req.user?.__userId as string;
			log.creatorName = req.user?.__userName as string;
			log.code = error.code;
			log.message = error.message;
			await AppInterceptor._repoLog?.update(log);
		}
		const result = new CustomResult()
			.withTraceId(traceId)
			.withCode(error.code)
			.withMessage(error.message);

		res.status(error.httpStatus).json(result);

		const str = `${req.method} ${req.originalUrl} - ${error.httpStatus} [${error.type}] ${error.message}`;
		if (error?.isException()) {
			LOGGER.error(str);
		} else {
			LOGGER.warn(str);
		}

		const cReq = <ICustomExpressRequest>req;
		const tasks: Array<any> = [];
		if (cReq.file) {
			tasks.push(fs.unlink(cReq.file.path));
		}
		if (cReq.files) {
			const files = Object.keys(cReq.files);
			files.forEach((x) => {
				// const ary = cReq.files[x];
				// if (CustomValidator.nonEmptyArray(ary)) {
				// 	ary.forEach((f) => tasks.push(fs.unlink(f.path)));
				// }
			});
		}
		if (CustomValidator.nonEmptyArray(tasks)) {
			Promise.all(tasks).catch((ex) => LOGGER.error(ex.stack));
		}

	}

	/** Path not found handler */
	static async notFoundHandler(req: Request, res: Response): Promise<any> {
		const str = `${req.method} ${req.originalUrl} - 404 Path not found`;
		LOGGER.info(str);
		res.status(HttpCodes.NOT_FOUND).send(str);
	}

	static async policyHandler(req: Request, res: Response): Promise<any> {
		LOGGER.info('-----------------------------------------------------------');
		LOGGER.info(`${req.method} ${req.path} - start`);

		const bucketName = req.params.bucketName;

		const apis = [
			'/api/v1/storage/b/:bucketName/o/:fileId'
		];

		// await next();

		const error = new CustomError(ErrorCodes.PERMISSION_DENY);
		const result = new CustomResult()
			.withTraceId(getTraceId())
			.withCode(error.code)
			.withMessage(error.message);

		res.status(error.httpStatus).json(result);
	}
}

declare global {
    namespace Express {
        interface User {
            __platform: string,
            __userId: string,
            __userName: string,
        }

        interface Request {
            user?: User | undefined;
        }
    }
}