import { Orderbook, RawOrderbook } from './interfaces';
declare class RawOrderbookHandler {
    private isContract;
    private incremental;
    constructor(isContract?: boolean);
    handle(raw: RawOrderbook['data'][0]): Orderbook;
}
export default RawOrderbookHandler;
