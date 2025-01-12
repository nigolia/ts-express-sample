import { Schema, Document } from 'mongoose';
import { ModelCodes } from '../../domain/enums/model-codes';
import { Types } from 'mongoose';
export const bucketModelName = ModelCodes.BUCKET;

interface IDocumentModel {
    createTime: Date,
    modifyTime: Date,
    invalidTime: Date,
    creatorId: string,
	creatorName: string,
    modifierId: string,
	modifierName: string,
	deletorId: string,
	deletorName: string,
    valid: boolean,
    platform: string,
    name: string,
    policy: any[],
	cors: any[],
    lifecycle: any,
};

export interface IBucketDocument extends IDocumentModel, Document { };

export const bucketSchema = new Schema({
	createTime: {
		type: Date,
	},
	modifyTime: {
		type: Date,
	},
	invalidTime: {
		type: Date,
	},
	creatorId: {
		type: String,
	},
	creatorName: {
		type: String,
	},
	modifierId: {
		type: String,
	},
	modifierName: {
		type: String,
	},
	deletorId: {
		type: String,
	},
	deletorName: {
		type: String,
	},
	valid: {
		type: Boolean,
		default: true,
	},
	platform: {
		type: String,
		default: '',
	},
	name: {
		type: String,
		index: { unique: true },
		required: true,
	},
	policy: {
		type: [{}],
	},
	cors: {
		type: [{}],
	},
	lifecycle: {
		type: {},
	},
}, {
	versionKey: false,
	timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime' },
	collection: `${bucketModelName}s`,
});
