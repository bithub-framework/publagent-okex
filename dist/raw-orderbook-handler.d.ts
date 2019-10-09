import { Orderbook, RawOrderbook } from './interfaces';
declare class RawOrderbookHandler {
    private incremental;
    handle(raw: RawOrderbook): Orderbook;
}
export default RawOrderbookHandler;
