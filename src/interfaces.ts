export * from 'interfaces';
import {
    Action,
} from 'interfaces';

type Operation = 'subscribe' | 'unsubscribe';

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

export interface RawTrades extends RawData {
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

export interface RawOrderbook extends RawData {
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

export interface StringOrder {
    price: string;
    amount: string;
    action: Action;
}