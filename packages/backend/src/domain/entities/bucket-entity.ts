import { PolicyValueObject } from '../value-objects/policy-value-object';
import { CorsValueObject } from '../value-objects/cors-value-object';
import { LifecycleValueObject } from '../value-objects/lifecycle-value-object';

export class BucketEntity {
    public id: string = '';
    public creatorId: string = '';
	public creatorName: string = '';
    public modifierId: string = '';
	public modifierName: string = '';
	public deletorId: string = '';
	public deletorName: string = '';
    public valid: boolean = true;
    public platform: string = '';
    public name: string = '';
    public policy: PolicyValueObject[] = [];
	public cors: CorsValueObject[] = [];
	public lifecycle: LifecycleValueObject = { rule: []};
}
