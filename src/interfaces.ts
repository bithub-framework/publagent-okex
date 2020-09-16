export * from 'interfaces';

export const enum Channel {
    TRADES = 'trades',
    ORDERBOOK = 'orderbook',
}

export const enum Operation {
    subscribe = 'subscribe',
    unsubscribe = 'unsubscribe',
}

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

export type RawOrder = [string, string, number];

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

