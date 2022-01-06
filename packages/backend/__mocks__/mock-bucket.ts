import { injectable } from 'inversify';
import { ICustomStorageClient, commonInjectorCodes, CustomStorageFile } from '@demo/app-common';

export class MockBucket implements ICustomStorageClient {
	createBucket = async (name: string): Promise<void> => {
		
	}
	checkBucketName(name: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	deleteBucket(name: string): Promise<void> {
		throw new Error('Method not implemented.');
	}
	createFile(storageFile: CustomStorageFile): Promise<void> {
		throw new Error('Method not implemented.');
	}
	deleteObject(storageFile: CustomStorageFile): Promise<void> {
		throw new Error('Method not implemented.');
	}
	download(storageFile: CustomStorageFile): Promise<ReadableStream<any>> {
		throw new Error('Method not implemented.');
	}

}