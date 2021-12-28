import { Response, NextFunction, Router } from 'express';
import { injectable } from 'inversify';
import {
	CustomClassBuilder,
	CustomResult,
	lazyInject,
	TNullable,
	CustomUtils,
	LOGGER,
	CustomValidator,
	CustomError,
	ICustomStorageClient,
	commonInjectorCodes,
} from '@demo/app-common';
import { handleExpressAsync, ICustomExpressRequest } from '../application-types';
import { InjectorCodes } from '../../domain/enums/injector-codes';
import { IFileRepository } from '../../domain/repositories/i-file-repository';
import { ErrorCodes } from '../../domain/enums/error-codes';


@injectable()
export class FileController {

    @lazyInject(InjectorCodes.I_FILE_REPO)
	private _repo: TNullable<IFileRepository>;

    @lazyInject(commonInjectorCodes.I_STORAGE_CLIENT)
    private _client: TNullable<ICustomStorageClient>;

    public update = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
    	// const { bucketName, fileId } : { bucketName: string, fileId: string } = req.params;

    	await this._client?.createBucket(`${Date.now()}_andytest`);

    	const fileId: string = req.params.fileId;
    	const bucketName: string = req.params.bucketName;
    	const { name, metadata } : { name: string, metadata: any } = req.body;
    	CustomValidator.nonEmptyString(name, ErrorCodes.FILE_NAME_IS_EMPTY);
    	const file = await this._repo?.findOne(fileId);
    	if (!file) {
    		throw new CustomError(ErrorCodes.FILE_IS_NOT_EXISTS);
    	}
    	file.name = name;
    	file.metadata = metadata;
    	await this._repo?.save(file);
    	res.locals['result'] = new CustomResult().withResult();
    	await next();
    }

    public static build(): Router {
    	const _ctrl = new FileController();
    	const r = Router();
    	r.route('/storage/b/:bucketName/o/:fileId')
    		.patch(handleExpressAsync(_ctrl.update));

    	return r;
    }
}