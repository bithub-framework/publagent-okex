import { Orderbook, RawOrderbook } from './interfaces';
import { Pair } from './mappings';
declare class RawOrderbookHandler {
    private pair;
    private incremental;
    constructor(pair: Pair);
    handle(rawOrderbook: RawOrderbook): Orderbook;
    handleStock(rawOrderbook: RawOrderbook): Orderbook;
}
export { RawOrderbookHandler as default, RawOrderbookHandler, };
