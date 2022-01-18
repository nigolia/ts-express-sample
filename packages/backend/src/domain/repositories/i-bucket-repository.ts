import { TNullable, CustomStorageBucket } from '@demo/app-common';
import { BucketEntity } from '../entities/bucket-entity';

export interface IBucketRepository {
    create(entity: TNullable<BucketEntity>, storageBucket: CustomStorageBucket): Promise<TNullable<BucketEntity>>;
    update(entity: TNullable<BucketEntity>): Promise<TNullable<BucketEntity>>;
    findOneByName(name: string): Promise<TNullable<BucketEntity>>;
    delete(name: string): Promise<void>;
    list(entity: TNullable<BucketEntity>): Promise<TNullable<BucketEntity[]>>;
}
