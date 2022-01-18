import { CustomError, ICodeObject, HttpCodes } from '@demo/app-common';

export enum ErrorCodes {
    CHAT_ROOM_ID_INVALID = 'CHAT_ROOM_ID_INVALID',
    CLIENT_USER_ID_INVALID = 'CLIENT_USER_ID_INVALID',
    CLIENT_USER_NAME_INVALID = 'CLIENT_USER_NAME_INVALID',
    CLIENT_NAME_INVALID = 'CLIENT_NAME_INVALID',
    CLIENT_CALLBACK_INVALID  = 'CLIENT_CALLBACK_INVALID',
    NOT_EXIST_CHAT_ROOM = 'NOT_EXIST_CHAT_ROOM',
    CHAT_ROOM_IS_CLOSE = 'CHAT_ROOM_IS_CLOSE',
	FILE_NAME_IS_EMPTY = 'FILE_NAME_IS_EMPTY',
	FILE_IS_NOT_EXISTS = 'FILE_IS_NOT_EXISTS',
	BUCKET_IS_NOT_EXISTS = 'BUCKET_IS_NOT_EXISTS',
	FILE_IS_REQUIRED = 'FILE_IS_REQUIRED',
	BUCKET_IS_ALREADY_EXISTS = 'BUCKET_IS_ALREADY_EXISTS'
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
		alias: ErrorCodes.FILE_NAME_IS_EMPTY,
		httpStatus: HttpCodes.BAD_REQ,
		message: '檔名不存在',
		code: 3001,
	},
	{
		alias: ErrorCodes.FILE_IS_NOT_EXISTS,
		httpStatus: HttpCodes.BAD_REQ,
		message: '檔案不存在',
		code: 3002,
	},
	{
		alias: ErrorCodes.FILE_IS_REQUIRED,
		httpStatus: HttpCodes.BAD_REQ,
		message: '未選擇上傳檔案',
		code: 3003,
	},
	{
		alias: ErrorCodes.BUCKET_IS_NOT_EXISTS,
		httpStatus: HttpCodes.BAD_REQ,
		message: '儲存桶不存在',
		code: 4001,
	},
	{
		alias: ErrorCodes.BUCKET_IS_ALREADY_EXISTS,
		httpStatus: HttpCodes.BAD_REQ,
		message: '儲存桶名稱重複',
		code: 4002,
	}
];

CustomError.mergeCodes(_codes);



