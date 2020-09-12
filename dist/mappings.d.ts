export declare type Pair = 'BTC/USDT' | 'BTC-USD-SWAP/USD';
export declare type Channel = 'trades' | 'orderbook' | 'instruments';
export declare function getChannel(table: string): Channel;
export declare function getPair(table: string, instrument_id: string): Pair;
export interface MarketDescriptor {
    tradesChannel: string;
    orderbookChannel: string;
    instrumentId: string;
    normalizeAmount: (price: number, amount: number) => number;
}
export declare const marketDescriptors: {
    [key: string]: MarketDescriptor;
};
