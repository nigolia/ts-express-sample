import { TNullable, CustomStorageFile } from '@demo/app-common';
import { FileEntity } from '../entities/file-entity';
import { BucketEntity } from '../entities/bucket-entity';

export interface IFileRepository {
    upload(entity: TNullable<FileEntity>, storageFile: CustomStorageFile): Promise<TNullable<FileEntity>>;
    update(entity: TNullable<FileEntity>): Promise<TNullable<FileEntity>>;
    findOne(id: string): Promise<TNullable<FileEntity>>;
    delete(bucketEntity: TNullable<BucketEntity>, fileEntity: TNullable<FileEntity>, storageFile: CustomStorageFile, token: any): Promise<void>;
    download(bucketEntity: TNullable<BucketEntity>, fileEntity: TNullable<FileEntity>, storageFile: CustomStorageFile, token: any): Promise<Buffer>;
    list(entity: TNullable<FileEntity>): Promise<TNullable<FileEntity[]>>;
}
