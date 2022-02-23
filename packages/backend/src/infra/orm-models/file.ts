import { Schema, Document } from 'mongoose';
import { ModelCodes } from '../../domain/enums/model-codes';
import { Types } from 'mongoose';
export const fileModelName = ModelCodes.FILE;

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
    bucketId: string,
    name: string,
    destination: string,
	mimetype: string,
    metadata: any,
    size: number,
    type: string,
	checksum: string,
	checksumMethod: string
};

export interface IFileDocument extends IDocumentModel, Document { };

export const fileSchema = new Schema({
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
	checksum: {
		type: String,
	},
	checksumMethod: {
		type: String,
	},
}, {
	versionKey: false,
	timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime' },
	collection: `${fileModelName}s`,
});
