import { PolicyValueObject } from '../value-objects/policy-value-object';
import { CorsValueObject } from '../value-objects/cors-value-object';

export class BucketEntity {
    public id: string = '';
    public creator: string = '';
    public modifier: string = '';
    public valid: boolean = true;
    public platform: string = '';
    public name: string = '';
    public policy: PolicyValueObject[] = [];
	public cors: CorsValueObject[] = [];
	// public lifecycle: any;
}
