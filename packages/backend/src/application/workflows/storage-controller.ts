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
import { PolicyValueObject } from '../../domain/value-objects/policy-value-object';
import { CorsValueObject } from '../../domain/value-objects/cors-value-object';
import { LifecycleValueObject } from '../../domain/value-objects/lifecycle-value-object';
import { ObjectId } from 'mongodb';

@injectable()
export class StorageController {

    @lazyInject(InjectorCodes.I_FILE_REPO)
	private _repoFile: TNullable<IFileRepository>;

	@lazyInject(InjectorCodes.I_BUCKET_REPO)
	private _repoBucket: TNullable<IBucketRepository>;

    public createBucket = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
    	const bucketName: string = req.params.bucketName;
    	const { __platform } : { __platform: string } = req.user;
    	const { policy, cors, lifecycle } : { policy: PolicyValueObject[], cors: CorsValueObject[], lifecycle: LifecycleValueObject } = req.body;

    	const bucket = new BucketEntity();
    	bucket.name = bucketName;
    	bucket.platform = __platform;
    	bucket.policy = policy;
    	bucket.cors = cors;
    	bucket.lifecycle = lifecycle;

    	const storageBucket = new CustomStorageBucket();
    	storageBucket.bucketName = bucketName;

    	const bucketResult = await this._repoBucket?.create(bucket, storageBucket);

    	const result = {
    		_id: bucketResult?.id,
    	};
        
    	res.locals['result'] = new CustomResult().withResult(result);
    	await next();
    }

	public updateBucket = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
		const bucketName: string = req.params.bucketName;
		const { __platform } : { __platform: string } = req.user;
    	const { policy, cors, lifecycle } : { policy: PolicyValueObject[], cors: CorsValueObject[], lifecycle: LifecycleValueObject } = req.body;

		// get bucket document form db
		const checkBucket = await this._repoBucket?.findOneByName(bucketName);

		// check bucket is exists
		if (!checkBucket || checkBucket.platform !== __platform) {
			throw new CustomError(ErrorCodes.BUCKET_NOT_FOUND);
		}

		const bucket = new BucketEntity();
    	bucket.name = bucketName;
    	bucket.platform = __platform;
    	bucket.policy = policy;
    	bucket.cors = cors;
    	bucket.lifecycle = lifecycle;

		await this._repoBucket?.update(bucket);

		res.locals['result'] = new CustomResult().withResult();
    	await next();
	}

	public deleteBucket = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
		const bucketName: string = req.params.bucketName;
		const { __platform } : { __platform: string } = req.user;

		// get bucket document form db
		const bucket = await this._repoBucket?.findOneByName(bucketName);

		// check bucket is exists
		if (!bucket || bucket.platform !== __platform) {
			throw new CustomError(ErrorCodes.BUCKET_NOT_FOUND);
		}

		// delete bucket from cloud storage
		await this._repoBucket?.delete(bucketName);

		res.locals['result'] = new CustomResult().withResult();
    	await next();
	}

	public listBuckets = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
		const { __platform } : { __platform: string } = req.user;
		const bucket = new BucketEntity();
		bucket.platform = __platform;

		const results = await this._repoBucket?.list(bucket);

		res.locals['result'] = new CustomResult().withResult(results);
    	await next();
	}

    public uploadFile = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
    	const { __platform } : { __platform: string } = req.user;
    	const mReq = new UploadFileRequest();
    	mReq.bucketName = req.params.bucketName;
    	mReq.data = req.body.data;
    	mReq.decodeData();

    	const uploadFile = req.file;

    	if (!uploadFile) {
    		throw new CustomError(ErrorCodes.MISSING_FILE);
    	}

    	// check bucket is exists
    	const bucket = await this._repoBucket?.findOneByName(mReq.bucketName);
    	if (!bucket || bucket.platform !== __platform) {
    		throw new CustomError(ErrorCodes.BUCKET_NOT_FOUND);
    	}

    	const file = new FileEntity();
    	file.name = uploadFile.originalname;
    	file.generateFileName();
    	file.bucketId = bucket.id;
    	file.platform = __platform;
    	file.destination = `${mReq.target}/${file.name}`;
    	file.mimetype = uploadFile.mimetype;
    	file.size = uploadFile.size;

    	const storageFile = new CustomStorageFile();
    	storageFile.bucketName = mReq.bucketName;
    	storageFile.source = uploadFile.path; 
    	storageFile.target = `${mReq.target}/${file.name}`;

    	const fileResult = await this._repoFile?.upload(file, storageFile);

    	const result = {
    		_id: fileResult?.id,
    	};

    	res.locals['result'] = new CustomResult().withResult(result);
    	await next();
    }

    public downloadFile = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<any> => {
    	const bucketName = req.params.bucketName;
    	const fileId = req.params.fileId;

    	const storageFile = new CustomStorageFile();
    	storageFile.bucketName = bucketName;

    	const bucket = await this._repoBucket?.findOneByName(bucketName);
		
    	const file = await this._repoFile?.findOne(fileId) as FileEntity;
    	if (!file) {
    		throw new CustomError(ErrorCodes.FILE_NOT_FOUND);
    	}
    	const result = await this._repoFile?.download(bucket, file, storageFile, req.user) as Buffer;

    	res.set('Content-Type', `${file.mimetype};charset=UTF-8`);
    	res.set('Content-Disposition', `attachment; filename=${file.name}`);

    	// return res.send(result);
    	return res.end(result);
    }


    public updateFile = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
    	const fileId: string = req.params.fileId;
    	const { name, metadata } : { name: string, metadata: any } = req.body;

    	CustomValidator.nonEmptyString(name, ErrorCodes.MISSING_FILE_NAME);

    	const file = await this._repoFile?.findOne(fileId);
    	if (!file) {
    		throw new CustomError(ErrorCodes.FILE_NOT_FOUND);
    	}

    	file.name = name;
    	file.metadata = metadata;
	
    	await this._repoFile?.update(file);
	
    	res.locals['result'] = new CustomResult().withResult();
    	await next();
    }

	public listFiles = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
		const { __platform } : { __platform: string } = req.user;
		const bucketName = req.params.bucketName;

		// console.log('req.params: ', JSON.stringify(req.params, undefined, 2));
		// console.log('req.query: ', JSON.stringify(req.query, undefined, 2));

		const bucket = await this._repoBucket?.findOneByName(bucketName);

		// check bucket is exists
		if (!bucket || bucket.platform !== __platform) {
			throw new CustomError(ErrorCodes.BUCKET_NOT_FOUND);
		}
	
		const file = new FileEntity();
		file.platform = __platform;
    	file.bucketId = bucket.id;
	
		const results = await this._repoFile?.list(file);

		res.locals['result'] = new CustomResult().withResult(results);
    	await next();
	}

	public deleteFile = async (req: ICustomExpressRequest, res: Response, next: NextFunction): Promise<void> => {
		const fileId: string = req.params.fileId;
		const bucketName = req.params.bucketName;	

    	const bucket = await this._repoBucket?.findOneByName(bucketName);
		
    	const file = await this._repoFile?.findOne(fileId) as FileEntity;
    	if (!file) {
    		throw new CustomError(ErrorCodes.FILE_NOT_FOUND);
    	}

		const storageFile = new CustomStorageFile();
    	storageFile.bucketName = bucketName;
		storageFile.target = file.destination;

    	await this._repoFile?.delete(bucket, file, storageFile, req.user);
	
    	res.locals['result'] = new CustomResult().withResult();
    	await next();
	}

	public static build(): Router {
    	const _ctrl = new StorageController();
    	const r = Router();
    	// 建立儲存桶
    	r.route('/storage/b/:bucketName')
    		.post(handleExpressAsync(_ctrl.createBucket));
    	// 更新儲存桶
    	r.route('/storage/b/:bucketName')
    		.patch(handleExpressAsync(_ctrl.updateBucket));
    	// 刪除儲存桶
    	r.route('/storage/b/:bucketName')
    		.delete(handleExpressAsync(_ctrl.deleteBucket));
    	// 查詢儲存桶列表
    	r.route('/storage/b')
    		.get(handleExpressAsync(_ctrl.listBuckets));
    	// 上傳檔案
    	r.route('/storage/b/:bucketName/o')
    		.post(ApplicationUpload.useSingleHandler(), handleExpressAsync(_ctrl.uploadFile));
    	// 下載檔案
    	r.route('/storage/b/:bucketName/o/:fileId')
    		.get(handleExpressAsync(_ctrl.downloadFile));
    	// 更新檔案
    	r.route('/storage/b/:bucketName/o/:fileId')
    		.patch(handleExpressAsync(_ctrl.updateFile));
		// 刪除檔案
    	r.route('/storage/b/:bucketName/o/:fileId')
    		.delete(handleExpressAsync(_ctrl.deleteFile));
    	// 查詢物件列表
    	r.route('/storage/b/:bucketName/o')
    		.get(handleExpressAsync(_ctrl.listFiles));
    	return r;
	}
}