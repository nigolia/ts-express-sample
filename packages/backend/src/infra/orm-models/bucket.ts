import { Schema, Document } from 'mongoose';
import { ModelCodes } from '../../domain/enums/model-codes';
import { Types } from 'mongoose';
export const bucketModelName = ModelCodes.BUCKET;

interface IDocumentModel {
    createTime: number,
    modifyTime: Date,
    invalidTime: Date,
    creator: string,
    modifier: string,
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
	creator: {
		type: Types.ObjectId,
	},
	modifier: {
		type: Types.ObjectId,
	},
	valid: {
		type: Boolean,
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
