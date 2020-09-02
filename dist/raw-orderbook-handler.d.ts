import { Orderbook, RawOrderbook } from './interfaces';
import { Pair } from './market-descriptions';
declare class RawOrderbookHandler {
    private pair;
    private incremental;
    constructor(pair: Pair);
    handle(rawOrderbook: RawOrderbook): Orderbook;
}
export { RawOrderbookHandler as default, RawOrderbookHandler, };
