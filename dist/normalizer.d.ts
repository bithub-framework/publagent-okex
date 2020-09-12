import Startable from 'startable';
import { Operation } from './interfaces';
import { Pair } from './mappings';
declare class Normalizer extends Startable {
    private extractor;
    private rawOrderbookHandler;
    private rawTradesHandler;
    constructor();
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private onRawData;
    unSubscribe(operation: Operation, pair: Pair): Promise<void>;
}
export { Normalizer as default, Normalizer, };
