export class CorsValueObject {
    public origin: string = '';
    public method: string[] = [];
    public responseHeader: string[] = [];
    public maxAgeSeconds: number = 0;
}
