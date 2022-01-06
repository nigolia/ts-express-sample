import { TNullable, CustomStorageFile } from '@demo/app-common';
import { FileEntity } from '../entities/file-entity';

export interface IFileRepository {
    upload(entity: TNullable<FileEntity>, storageFile: CustomStorageFile): Promise<TNullable<FileEntity>>;
    update(entity: TNullable<FileEntity>): Promise<TNullable<FileEntity>>;
    findOne(id: string): Promise<TNullable<FileEntity>>;
}
