import { TNullable, CustomError, LOGGER, CustomUtils } from '@demo/app-common';

interface IMetadata {
    target: string;
    metadata: any;
}

export class UploadFileRequest {
    public bucketName: string = '';
    public data: string = '';
    private _metadata: TNullable<IMetadata>;

    public get target(): string {
    	return this._metadata?.target as string;
    }
    public get metadata(): any {
    	return this._metadata?.metadata as any;
    }
    public decodeData = (): void => {
    	try {
    		// const test = '';
    		const str = CustomUtils.fromBase64ToString(this.data);
    		// const str = '{"target":"john", "age":22, "class":"mca"}';
    		const obj = JSON.parse(str);
    		this._metadata = JSON.parse(str) as IMetadata;
    		console.log(`this._metadata: ${this._metadata}`);
    	} catch (ex) {
    		const err = CustomError.fromInstance(ex);

    		LOGGER.error(`decodeData fail, ${err.stack}`);
    		throw err;
    	}
    }
}