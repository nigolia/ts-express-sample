import { TNullable } from '@demo/app-common';
import { LogEntity } from '../entities/log-entity';
import { LogStatusCodes } from '../enums/log-status-codes';

export interface ILogRepository {
    create(entity: TNullable<LogEntity>): Promise<void>;
    update(entity: TNullable<LogEntity>): Promise<void>;
}
