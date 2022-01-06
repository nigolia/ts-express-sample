import multer from 'multer';

export class ApplicationUpload {
    private static _multer = multer({ limits: { fileSize: 1000000 }, dest: './tmp' });

    static useSingleHandler(fieldName = 'file') {
    	return this._multer.single(fieldName);
    }
}