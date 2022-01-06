import { Response, NextFunction, Router } from 'express';
import * as uuid from 'uuid';
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
	CustomStorageFile,
	CustomStorageBucket,
} from '@demo/app-common';
import { handleExpressAsync, ICustomExpressRequest } from '../application-types';
import { InjectorCodes } from '../../domain/enums/injector-codes';
import { IFileRepository } from '../../domain/repositories/i-file-repository';
import { IBucketRepository } from '../../domain/repositories/i-bucket-repository';
import { ErrorCodes } from '../../domain/enums/error-codes';
import { BucketEntity } from '../../domain/entities/bucket-entity';
import { FileEntity } from '../../domain/entities/file-entity';
import { UploadFileRequest } from '../../domain/value-objects/upload-file-request';
import { ApplicationUpload } from '../application-upload';
import { ObjectId } from 'mongodb';

@injectable()
export class StorageController {

    @lazyInject(InjectorCodes.I_FILE_REPO)
	private _repoFile: TNullable<IFileRepository>;

	@lazyInject(InjectorCodes.I_BUCKET_REPO)
	private _repoBucket: TNullable<IBucketRepository>;

    public createBucket = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
    	const bucketName: string = req.params.bucketName;

    	const bucket = new BucketEntity();
    	bucket.name = bucketName;
    	bucket.platform = 'Luna';
    	bucket.creator = new ObjectId().toHexString();

    	const storageBucket: CustomStorageBucket = new CustomStorageBucket();
    	storageBucket.bucketName = bucketName;

    	await this._repoBucket?.create(bucket, storageBucket);
        
    	res.locals['result'] = new CustomResult().withResult();
    	await next();
    }

    public uploadFile = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
    	const storageFile: CustomStorageFile = new CustomStorageFile();
    	const mReq = new UploadFileRequest();
    	mReq.bucketName = req.params.bucketName;
    	mReq.data = req.body.data;
    	mReq.decodeData();

    	const file = req.file;

    	if (!file) {
    		throw new Error('error');
    	}

    	const bucket = await this._repoBucket?.findOneByName(mReq.bucketName);
    	if (!bucket) {
    		throw new Error('bucket is not exists');
    	}

    	const _file = new FileEntity();
    	_file.name = file.originalname;
    	_file.generateFileName();
    	_file.bucketId = bucket.id;
    	_file.platform = 'Luna';
    	_file.destination = `${mReq.target}/${_file.name}`;
    	_file.creator = new ObjectId().toHexString();

    	storageFile.bucketName = mReq.bucketName;
    	storageFile.source = file.path; 
    	storageFile.target = `${mReq.target}/${_file.name}`;

    	const fileResult = await this._repoFile?.upload(_file, storageFile);

    	const result = {
    		file: {
    			_id: fileResult?.id,
    		},
    	};
    	res.locals['result'] = new CustomResult().withResult(result);
    	await next();
    }

    public downloadFile = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {

    }

    public updateFile = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
    	// const { bucketName, fileId } : { bucketName: string, fileId: string } = req.params;

    	const fileId: string = req.params.fileId;
    	const bucketName: string = req.params.bucketName;
    	const { name, metadata } : { name: string, metadata: any } = req.body;
    	CustomValidator.nonEmptyString(name, ErrorCodes.FILE_NAME_IS_EMPTY);
    	const file = await this._repoFile?.findOne(fileId);
    	if (!file) {
    		throw new CustomError(ErrorCodes.FILE_IS_NOT_EXISTS);
    	}
    	file.name = name;
    	file.metadata = metadata;
    	await this._repoFile?.update(file);
    	res.locals['result'] = new CustomResult().withResult();
    	await next();
    }

    public static build(): Router {
    	const _ctrl = new StorageController();
    	const r = Router();
    	// 建立儲存桶
    	r.route('/storage/b/:bucketName/')
    		.post(handleExpressAsync(_ctrl.createBucket));
    	// 上傳檔案
    	r.route('/storage/b/:bucketName/o')
    		.post(ApplicationUpload.useSingleHandler(), handleExpressAsync(_ctrl.uploadFile));
    	// 下載檔案
    	r.route('/storage/b/:bucketName/o/:fileId')
    		.get(ApplicationUpload.useSingleHandler(), handleExpressAsync(_ctrl.downloadFile));
    	// 更新檔案
    	r.route('/storage/b/:bucketName/o/:fileId')
    		.patch(handleExpressAsync(_ctrl.updateFile));
    	return r;
    }
}