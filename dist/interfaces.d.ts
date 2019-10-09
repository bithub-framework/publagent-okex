import { Action, Orderbook, Trade, QuoteDataFromAgentToCenter } from 'interfaces';
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
interface OrderString {
    price: string;
    amount: string;
    action: Action;
}
export { Trade, Action, Orderbook, RawTrades, RawOrderbook, OrderString, QuoteDataFromAgentToCenter, };
