export const commonInjectorCodes = {
	I_MONGOOSE_CLIENT: Symbol('iMongooseClient'),
	DEFAULT_MONGO_CLIENT: Symbol('defaultMongoClient'),
	I_HTTP_CLIENT: Symbol('iHttpClient'),
	I_REDIS_CLIENT: Symbol('iRedisClient'),
	DEFAULT_REDIS_CLIENT: Symbol('defaultRedisClient'),
	I_STORAGE_CLIENT: Symbol('iStroageClient'),
	GCS_STORAGE_CLIENT: Symbol('gcsStorageClient'),
};
