import { Storage } from '@google-cloud/storage';
import { ICustomStorageClient } from '../custom-types';
import { CustomStorageFile } from '../custom-models/custom-storage-file';

export class CustomGcsClient implements ICustomStorageClient {
    private _storage: Storage;
    constructor(keyFilename: string) {
    	this._storage = new Storage({keyFilename});
    }
    checkBucketName(name: string): Promise<boolean> {
    	throw new Error('Method not implemented.');
    }
	createBucket = async (name: string): Promise<void> => {
    	await this._storage.createBucket(name);
	}
	deleteBucket(name: string): Promise<void> {
		throw new Error('Method not implemented.');
	}
	uploadObject(file: CustomStorageFile): Promise<void> {
		throw new Error('Method not implemented.');
	}
	deleteObject(file: CustomStorageFile): Promise<void> {
		throw new Error('Method not implemented.');
	}
	download(file: CustomStorageFile): Promise<ReadableStream<any>> {
		throw new Error('Method not implemented.');
	}

}
