import { LogStatusCodes } from '../enums/log-status-codes';

export class LogEntity {
    public id: string = '';
    public traceId: string = '';
    public status: string = LogStatusCodes.BEFORE_HANDLER;
    public creatorId: string = '';
    public creatorName: string = '';
    public valid: boolean = true;
    public platform: string = '';
    public method: string = '';
    public columnName: string = '';
    public token: any = null;
    public rawValue: any = null;
    public code: number = 0;
    public message: string = '';
}
