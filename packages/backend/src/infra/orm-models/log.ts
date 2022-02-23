import { Schema, Document } from 'mongoose';
import { ModelCodes } from '../../domain/enums/model-codes';
import { Types } from 'mongoose';
export const logModelName = ModelCodes.LOG;

interface ILogModel {
	traceId: string,
	status: string,
    createTime: Date,
    creatorId: string,
	creatorName: string,
    valid: boolean,
    platform: string,
	method: string,
    columnName: string,
    token: any,
	rawValue: any,
	code: number,
	message: string,
};

export interface ILogDocument extends ILogModel, Document { };

export const logSchema = new Schema({
	traceId: {
		type: String,
	},
	status: {
		type: String,
	},
	createTime: {
		type: Date,
	},
	creatorId: {
		type: String,
	},
	creatorName: {
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
	method: {
		type: String,
		default: '',
	},
	columnName: {
		type: String,
		default: '',
	},
	token: {
		type: {},
	},
	rawValue: {
		type: {},
	},
	code: Number,
	message: String,
}, {
	versionKey: false,
	timestamps: { createdAt: 'createTime', updatedAt: 'modifyTime' },
	collection: `${logModelName}s`,
});
