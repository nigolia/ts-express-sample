import { CustomUtils } from '@demo/app-common';
export class FileEntity {
    public id: string = '';
    public creatorId: string = '';
	public creatorName: string = '';
    public modifierId: string = '';
	public modifierName: string = '';
	public deletorId: string = '';
	public deletorName: string = '';
    public valid: boolean = true;
    public platform: string = '';
    public bucketId: string = '';
    public name: string = '';
    public destination: string = '';
    public mimetype: string = '';
    public metadata: any;
    public size: number = 0;
    public type: string = '';

    public generateFileName(): void {
    	this.name = `${CustomUtils.generateUniqueId()}|${this.name}`;
    }
}
