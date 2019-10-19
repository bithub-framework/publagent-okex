import { Orderbook, RawOrderbook } from './interfaces';
declare class RawOrderbookHandler {
    private isPerpetual;
    private incremental;
    constructor(isPerpetual?: boolean);
    handle(raw: RawOrderbook['data'][0]): Orderbook;
}
export default RawOrderbookHandler;
export { RawOrderbookHandler };
