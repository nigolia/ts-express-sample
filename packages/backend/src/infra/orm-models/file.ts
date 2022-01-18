import { Schema, Document } from 'mongoose';
import { ModelCodes } from '../../domain/enums/model-codes';
import { Types } from 'mongoose';
export const fileModelName = ModelCodes.FILE;

interface IDocumentModel {
    createTime: number,
    modifyTime: Date,
    invalidTime: Date,
    creator: string,
    modifier: string,
    valid: boolean,
    platform: string,
    bucketId: string,
    name: string,
    destination: string,
	mimetype: string,
    metadata: any,
    size: number,
    type: string,
};

export interface IFileDocument extends IDocumentModel, Document { };

export const fileSchema = new Schema({
	invalidTime: {
		type: Date,
	},
	creator: {
		type: String,
	},
	modifier: {
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
	bucketId: {
		type: Types.ObjectId,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	destination: {
		type: String,
		required: true,
	},
	mimetype: {
		type: String,
		required: true,
	},
	metadata: {
		type: Object,
	},
	size: {
		type: Number,
	},
	type: {
		type: String,
		default: '',
	},
}, {
	versionKey: false,
	timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime' },
	collection: `${fileModelName}s`,
});
