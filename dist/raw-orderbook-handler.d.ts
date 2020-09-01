import { Orderbook, RawOrderbook } from './interfaces';
import { Pair } from './market-descriptions';
declare class RawOrderbookHandler {
    private pair;
    private incremental;
    constructor(pair: Pair);
    handle(raw: RawOrderbook['data'][0]): Orderbook;
}
export default RawOrderbookHandler;
export { RawOrderbookHandler };
