export * from 'interfaces';
export declare type Operation = 'subscribe' | 'unsubscribe';
export interface RawMessage {
    table?: string;
    event?: 'error' | Operation;
}
export interface RawUnSub extends RawMessage {
    event: Operation;
    channel: string;
}
export interface RawError extends RawMessage {
    event: 'error';
    message: string;
}
export interface RawData extends RawMessage {
    table: string;
    data: {}[];
}
export interface RawTrade {
    instrument_id: string;
    price: string;
    side: 'buy' | 'sell';
    size: string;
    timestamp: string;
    trade_id: string;
}
export interface RawDataTrades extends RawData {
    table: string;
    data: RawTrade[];
}
export declare type RawOrder = [string, string, number];
export interface RawOrderbook {
    instrument_id: string;
    asks: RawOrder[];
    bids: RawOrder[];
    checksum: number;
    timestamp: string;
}
export interface RawDataOrderbook extends RawData {
    table: string;
    action: 'partial' | 'update';
    data: RawOrderbook[];
}
export interface StringOrder {
    price: string;
    amount: string;
    action: 'ask' | 'bid';
}
