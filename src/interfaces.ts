export * from 'interfaces';

export type RawChannel = 'trades' | 'books5';
export type SubscriptionOperation = 'subscribe' | 'unsubscribe';

export interface RawError {
    event: 'error';
    code: string;
    msg: string;
}
export function isRawError(rawMessage: any): rawMessage is RawError {
    return rawMessage.event === 'error';
}

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
export function isRawTradesMessage(message: any, rawInstrumentId: string): message is RawTradesMessage {
    return message.arg?.channel === 'trades' &&
        message.arg?.instId === rawInstrumentId;
}

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
export function isRawOrderbookMessage(message: any, rawInstrumentId: string): message is RawOrderbookMessage {
    return message.arg?.channel === 'books5' &&
        message.arg?.instId === rawInstrumentId;
}

export interface RawUnSubscriptionMessage {
    event: SubscriptionOperation;
    arg: {
        channel: string;
        instId: string;
    }
}
export function isRawUnSubscription(
    message: any,
    operation: SubscriptionOperation,
    rawInstrumentId: string,
    rawChannel: RawChannel,
): message is RawUnSubscriptionMessage {
    return message.event === operation &&
        message.arg?.channel === rawChannel &&
        message.arg?.instId === rawInstrumentId;
}
