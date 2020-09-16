export * from 'interfaces';
export declare type Channel = 'trades' | 'orderbook';
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
    data: RawDataData[];
}
export interface RawDataData {
    timestamp: string;
    instrument_id: string;
}
export interface RawTrade extends RawDataData {
    price: string;
    side: 'buy' | 'sell';
    size: string;
    trade_id: string;
}
export interface RawDataTrades extends RawData {
    table: string;
    data: RawTrade[];
}
export declare type RawOrder = [string, string, number];
export interface RawOrderbook extends RawDataData {
    asks: RawOrder[];
    bids: RawOrder[];
    checksum?: number;
}
export interface RawDataOrderbook extends RawData {
    table: string;
    action?: 'partial' | 'update';
    data: RawOrderbook[];
}
