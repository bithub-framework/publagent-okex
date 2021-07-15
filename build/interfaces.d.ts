export * from 'interfaces';
export declare type RawChannel = 'trades' | 'books5';
export declare type SubscriptionOperation = 'subscribe' | 'unsubscribe';
export interface RawError {
    event: 'error';
    code: string;
    msg: string;
}
export declare function isRawError(rawMessage: any): rawMessage is RawError;
export interface RawTradesMessage {
    arg: {
        channel: 'trades';
        instId: string;
    };
    data: {
        instId: string;
        tradeId: string;
        px: string;
        sz: string;
        side: 'buy' | 'sell';
        ts: string;
    }[];
}
export declare function isRawTradesMessage(message: any, rawInstrumentId: string): message is RawTradesMessage;
export interface RawOrderbookMessage {
    arg: {
        channel: 'books5';
        instId: string;
    };
    action: 'snapshot';
    data: {
        asks: [string, string, string, string][];
        bids: [string, string, string, string][];
        ts: string;
        checksum: number;
    }[];
}
export declare function isRawOrderbookMessage(message: any, rawInstrumentId: string): message is RawOrderbookMessage;
export interface RawUnSubscriptionMessage {
    event: SubscriptionOperation;
    arg: {
        channel: string;
        instId: string;
    };
}
export declare function isRawUnSubscription(message: any, operation: SubscriptionOperation, rawInstrumentId: string, rawChannel: RawChannel): message is RawUnSubscriptionMessage;
