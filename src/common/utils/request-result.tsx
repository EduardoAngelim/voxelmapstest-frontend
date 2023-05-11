export default class RequestResult {
    public hasError: boolean = false;
    public message: string | null = null;
    public execptionMessage: string | null = null;
    public result: any = [];
}