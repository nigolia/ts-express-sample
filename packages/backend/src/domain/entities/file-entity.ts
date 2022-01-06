import { CustomUtils } from '@demo/app-common';
export class FileEntity {
    public id: string = '';
    public creator: string = '';
    public valid: boolean = true;
    public platform: string = '';
    public bucketId: string = '';
    public name: string = '';
    public destination: string = '';
    public metadata: any;
    public size: number = 0;
    public type: string = '';

    public generateFileName(): void {
    	this.name = `${CustomUtils.generateUniqueId()}|${this.name}`;
    }
}
