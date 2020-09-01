import Startable from 'startable';
declare class Normalizer extends Startable {
    private extractor;
    private rawOrderbookHandler;
    private rawTradesHandler;
    constructor(url: string);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private onRawData;
    unSubscribe(operation: 'subscribe' | 'unsubscribe', channel: string): Promise<void>;
}
export { Normalizer as default, Normalizer, };
