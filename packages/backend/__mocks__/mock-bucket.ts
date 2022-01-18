import { injectable } from 'inversify';
import { ICustomStorageClient, commonInjectorCodes, CustomStorageFile } from '@demo/app-common';

export class MockBucket implements ICustomStorageClient {
	deleteBucket(name: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	createFile(storageFile: CustomStorageFile): Promise<void> {
		throw new Error('Method not implemented.');
	}
	deleteObject(storageFile: CustomStorageFile): Promise<void> {
		throw new Error('Method not implemented.');
	}
	download(storageFile: CustomStorageFile): Promise<Buffer> {
		throw new Error('Method not implemented.');
	}
	createBucket = async (name: string): Promise<void> => {
		
	}
	checkBucketName(name: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
}