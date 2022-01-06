import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import { ICustomStorageClient } from '../custom-types';
import { CustomStorageFile } from '../custom-models/custom-storage-file';
import { CustomValidator } from '../custom-tools/custom-validator';
import { LOGGER } from '..';
import { injectable } from 'inversify';

@injectable()
export class CustomGcsClient implements ICustomStorageClient {
    private _storage: Storage;
    constructor(keyFilename: string) {
    	this._storage = new Storage({keyFilename});
    }
    checkBucketName(name: string): Promise<boolean> {
    	throw new Error('Method not implemented.');
    }
	createBucket = async (name: string): Promise<void> => {
		if (!CustomValidator.nonEmptyString(name)) {
			throw new Error('儲存桶名稱不能空白');
		}
    	await this._storage.createBucket(name);
		// console.log('res: ', res);
	}
	deleteBucket = async (name: string): Promise<void> => {
		const bucket = this._storage.bucket(name);
		await bucket.delete();
	}
	createFile = async (storageFile: CustomStorageFile): Promise<void> => {
		const bucketName: string = storageFile.bucketName;
		const target: string = `${storageFile.target}`;
		console.log('~~~~target: ', target);
		// const target: string = 'tmp/heloooo.txt';
		const source: string = storageFile.source;
		// const source: string = '/d/StorageService/ts-express-sample/README.md';
		// const buffer: Buffer = Buffer.from(storageFile.buffer);
		const bucket = this._storage.bucket(bucketName);
		const file = bucket.file(target);
		// await file.save(buffer);
		console.log('storageFile: ', storageFile);
		console.log('source: ', source);
		console.log(`target: ${target}`);
		console.log(`bucketName: ${bucketName}`);

		fs.createReadStream(source)
			.pipe(file.createWriteStream())
			.on('error', function(err) {
				console.log('err: ', err);
			})
			.on('finish', function() {
				console.log('The file upload is complete.');
				// The file upload is complete.
			});
	}
	deleteObject(storageFile: CustomStorageFile): Promise<void> {
		throw new Error('Method not implemented.');
	}
	download(storageFile: CustomStorageFile): Promise<ReadableStream<any>> {
		throw new Error('Method not implemented.');
	}

}
