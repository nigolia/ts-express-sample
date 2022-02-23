import { CustomError, ICodeObject, HttpCodes } from '@demo/app-common';

export enum ErrorCodes {
    CHAT_ROOM_ID_INVALID = 'CHAT_ROOM_ID_INVALID',
    CLIENT_USER_ID_INVALID = 'CLIENT_USER_ID_INVALID',
    CLIENT_USER_NAME_INVALID = 'CLIENT_USER_NAME_INVALID',
    CLIENT_NAME_INVALID = 'CLIENT_NAME_INVALID',
    CLIENT_CALLBACK_INVALID  = 'CLIENT_CALLBACK_INVALID',
    NOT_EXIST_CHAT_ROOM = 'NOT_EXIST_CHAT_ROOM',
    CHAT_ROOM_IS_CLOSE = 'CHAT_ROOM_IS_CLOSE',
	MISSING_PLATFORM = 'MISSING_PLATFORM',
	MISSING_USER_ID = 'MISSING_USER_ID',
	MISSING_USER_NAME = 'MISSING_USER_NAME',
	BUCKET_NAME_ALREADY_EXISTS = 'BUCKET_NAME_ALREADY_EXISTS',
	INVALID_BUCKET_NAME = 'INVALID_BUCKET_NAME',
	BUCKET_NOT_FOUND = 'BUCKET_NOT_FOUND',
	BUCKET_NOT_EMPTY = 'BUCKET_NOT_EMPTY',
	MISSING_FILE = 'MISSING_FILE',
	MISSING_DATA = 'MISSING_DATA',
	INVALID_DATA_TARGET = 'INVALID_DATA_TARGET',
	PERMISSION_DENY = 'PERMISSION_DENY',
	FILE_NOT_FOUND = 'FILE_NOT_FOUND',
	MISSING_FILE_NAME = 'MISSING_FILE_NAME',
	MISSING_TOKEN = 'MISSING_TOKEN',
	INVALID_SIGNATURE = 'INVALID_SIGNATURE',
	
};

const _codes: Array<ICodeObject> = [
	{
		alias: ErrorCodes.NOT_EXIST_CHAT_ROOM,
		httpStatus: HttpCodes.BAD_REQ,
		message: '聊天室不存在',
		code: 1001,
	},
	{
		alias: ErrorCodes.CHAT_ROOM_ID_INVALID,
		httpStatus: HttpCodes.BAD_REQ,
		message: '無效聊天室代碼',
		code: 1002,
	},
	{
		alias: ErrorCodes.CLIENT_USER_ID_INVALID,
		httpStatus: HttpCodes.BAD_REQ,
		message: '無效使用者代碼',
		code: 1003,
	},
	{
		alias: ErrorCodes.CLIENT_USER_NAME_INVALID,
		httpStatus: HttpCodes.BAD_REQ,
		message: '無效使用者名稱',
		code: 1004,
	},
	{
		alias: ErrorCodes.CHAT_ROOM_IS_CLOSE,
		httpStatus: HttpCodes.BAD_REQ,
		message: '關閉房間狀態無法加入',
		code: 1011,
	},
	{
		alias: ErrorCodes.CLIENT_NAME_INVALID,
		httpStatus: HttpCodes.BAD_REQ,
		message: '無效客戶名稱',
		code: 2001,
	},
	{
		alias: ErrorCodes.CLIENT_CALLBACK_INVALID,
		httpStatus: HttpCodes.BAD_REQ,
		message: '無效客戶回調網址',
		code: 2004,
	},
	{
		alias: ErrorCodes.MISSING_PLATFORM,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'Token is missing __platform',
		code: 3001,
	},
	{
		alias: ErrorCodes.MISSING_USER_ID,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'Token is missing __userId',
		code: 3002,
	},
	{
		alias: ErrorCodes.MISSING_USER_NAME,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'Token is missing __userName',
		code: 3003,
	},
	{
		alias: ErrorCodes.BUCKET_NAME_ALREADY_EXISTS,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'Bucket name already exists',
		code: 4001,
	},
	{
		alias: ErrorCodes.INVALID_BUCKET_NAME,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'Invalid bucket name',
		code: 4002,
	},
	{
		alias: ErrorCodes.BUCKET_NOT_FOUND,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'Bucket not found',
		code: 4003,
	},
	{
		alias: ErrorCodes.BUCKET_NOT_EMPTY,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'Bucket not empty',
		code: 4004,
	},
	{
		alias: ErrorCodes.MISSING_FILE,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'Request body is missing file',
		code: 4005,
	},
	{
		alias: ErrorCodes.MISSING_DATA,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'Request body is missing data',
		code: 4006,
	},
	{
		alias: ErrorCodes.INVALID_DATA_TARGET,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'invalid data target',
		code: 4007,
	},
	{
		alias: ErrorCodes.PERMISSION_DENY,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'Permission denied',
		code: 4008,
	},
	{
		alias: ErrorCodes.FILE_NOT_FOUND,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'File not found',
		code: 4009,
	},
	{
		alias: ErrorCodes.MISSING_FILE_NAME,
		httpStatus: HttpCodes.BAD_REQ,
		message: 'File name is missing',
		code: 4010,
	},
	{
		alias: ErrorCodes.MISSING_TOKEN,
		httpStatus: HttpCodes.UN_AUTHORIZE,
		message: 'No authorization token was found',
		code: 9000,
	},
	{
		alias: ErrorCodes.INVALID_SIGNATURE,
		httpStatus: HttpCodes.UN_AUTHORIZE,
		message: 'invalid signature',
		code: 9001,
	}
];

CustomError.mergeCodes(_codes);



