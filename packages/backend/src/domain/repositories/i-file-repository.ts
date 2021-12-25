import { TNullable } from '@demo/app-common';
import { FileEntity } from '../entities/file-entity';

export interface IFileRepository {
    save(entity: TNullable<FileEntity>): Promise<TNullable<FileEntity>>;
    findOne(id: string): Promise<TNullable<FileEntity>>;
}
