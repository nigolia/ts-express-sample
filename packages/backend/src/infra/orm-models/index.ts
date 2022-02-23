import { IMongooseClient } from '@demo/app-common';
import { IClientCredentialDocument, clientCredentialModelName, clientCredentialSchema } from './client-credential';
import { IChatRoomDocument, chatRoomModelName, chatRoomSchema } from './chat-room';
import { ITokenDocument, tokenModelName, tokenSchema } from './token';
import { IFileDocument, fileModelName, fileSchema } from './file';
import { IBucketDocument, bucketModelName, bucketSchema } from './bucket';
import { ILogDocument, logModelName, logSchema } from './log';


export function load(client?: IMongooseClient): void {
	if (!client) {
		throw new Error('Mongo client is null, terminated....');
	}
	client.registerModel<IClientCredentialDocument>(clientCredentialModelName, clientCredentialSchema);
	client.registerModel<IChatRoomDocument>(chatRoomModelName, chatRoomSchema);
	client.registerModel<ITokenDocument>(tokenModelName, tokenSchema);
	client.registerModel<IFileDocument>(fileModelName, fileSchema);
	client.registerModel<IBucketDocument>(bucketModelName, bucketSchema);
	client.registerModel<ILogDocument>(logModelName, logSchema);
}


export {
	IClientCredentialDocument,
	IChatRoomDocument,
	ITokenDocument,
	IFileDocument,
	IBucketDocument,
	ILogDocument,
};
