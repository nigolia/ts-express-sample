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
		this._storage = new Storage({ keyFilename });
	}
	checkBucketName(name: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	createBucket = async (name: string): Promise<void> => {
		if (!CustomValidator.nonEmptyString(name)) {
			throw new Error('儲存桶名稱不能空白');
		}
		await this._storage.createBucket(name);
	}
	deleteBucket = async (name: string): Promise<boolean> => {
		const bucket = this._storage.bucket(name);
		try {
			const response = await bucket.delete({ ignoreNotFound: true });
			return true;
		} catch (err) {
			return false;
		}
	}
	createFile = async (storageFile: CustomStorageFile): Promise<void> => {
		const bucketName: string = storageFile.bucketName;
		const target: string = storageFile.target;
		const source: string = storageFile.source;

		const bucket = this._storage.bucket(bucketName);
		const file = bucket.file(target);

		return new Promise((res, rej) => {
			fs.createReadStream(source)
				.pipe(file.createWriteStream())
				.on('error', function (err) {
					// console.log('err: ', err);
					return rej();
				})
				.on('finish', function () {
					// console.log('The file upload is complete.');
					// The file upload is complete.
					res();
				});
		});
	}
	deleteFile = async (storageFile: CustomStorageFile): Promise<void> => {
		const bucketName: string = storageFile.bucketName;
		const target: string = storageFile.target;

		await this._storage.bucket(bucketName).file(target).delete();
	}
	download = async (storageFile: CustomStorageFile): Promise<Buffer> => {
		// throw new Error('Method not implemented.');
		// Downloads the file
		// const destFileName = '/local/path/to/file.txt';
		// const options = {
		// 	destination: destFileName,
		// };
		// await _storage.bucket(bucketName).file(fileName).download(options);

		const bucketName = storageFile.bucketName;
		const target = storageFile.target;

		const downloadResponse = await this._storage.bucket(bucketName).file(target).download();

		let result: Buffer;
		// if (downloadResponse && downloadResponse.length > 0) {
		result = downloadResponse[0];
		// }
		
		return result;
		/*
		const remoteFile = this._storage.bucket(bucketName).file(target);
		remoteFile.createReadStream()
			.on('error', function(err) {})
			.on('response', function(response) {
				// Server connected and responded with the specified status and headers.
			})
			.on('end', function() {
				// The file is fully downloaded.
			})
			.pipe(fs.createWriteStream(localFilename));
		*/
	}

}
