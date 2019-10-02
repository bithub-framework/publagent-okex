import { Action } from 'interfaces';
interface RawTradeData {
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
interface RawOrderbookData {
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
interface RawSubSuccData {
    event: string;
    channel: string;
}
interface OrderString {
    price: string;
    amount: string;
    action: Action;
}
interface RawErrorData {
    event: string;
    message: string;
    errorCode: string;
}
export { RawTradeData, RawSubSuccData, RawOrderbookData, OrderString, RawErrorData, };
