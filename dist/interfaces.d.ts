export * from 'interfaces';
import { Action } from 'interfaces';
interface RawTrades {
    table: string;
    data: {
        instrument_id: string;
        price: string;
        side: string;
        size: string;
        timestamp: string;
        trade_id: string;
    }[];
}
interface RawOrderbook {
    table: string;
    action: string;
    data: {
        instrument_id: string;
        asks: [string, string, number][];
        bids: [string, string, number][];
        checksum: number;
        timestamp: string;
    }[];
}
interface Config {
    PUBLIC_CENTER_BASE_URL: string;
    OKEX_WEBSOCKET_URL: string;
    OKEX_RESTFUL_BASE_URL: string;
    ORDERBOOK_DEPTH: number;
}
interface OrderString {
    price: string;
    amount: string;
    action: Action;
}
export { RawTrades, RawOrderbook, OrderString, Config, };
