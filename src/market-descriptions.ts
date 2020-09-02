export type Pair = 'BTC/USDT' | 'BTC-USD-SWAP/USD';
export type Channel = 'trades' | 'orderbook' | 'instruments';

export function getChannel(table: string): Channel {
    const c = table.split('/')[1];
    if (c === 'trade') return 'trades';
    if (c === 'depth_l2_tbt') return 'orderbook';
    if (table === 'futures/instruments') return 'instruments';
    throw new Error('invalid channel');
}

export function getPair(table: string, instrument_id: string): Pair {
    const c = table.split('/')[0];
    if (c === 'spot' && instrument_id === 'BTC-USDT') return 'BTC/USDT';
    if (c === 'swap' && instrument_id === 'BTC-USD-SWAP') return 'BTC-USD-SWAP/USD';
    throw new Error('invalid pair');
}

export interface MarketDescriptor {
    tradesChannel: string;
    orderbookChannel: string;
    instrumentId: string;
    normalizeAmount: (price: number, amount: number) => number;
}

export const marketDescriptors: {
    [key: string]: MarketDescriptor;
} = {
    'BTC/USDT': {
        tradesChannel: 'spot/trade:BTC-USDT',
        orderbookChannel: 'spot/depth_l2_tbt:BTC-USDT',
        instrumentId: 'BTC-USDT',
        normalizeAmount: (price, amount) => amount,
    },
    'BTC-USD-SWAP/USD': {
        tradesChannel: 'swap/trade:BTC-USD-SWAP',
        orderbookChannel: 'swap/depth_l2_tbt:BTC-USD-SWAP',
        instrumentId: 'BTC-USD-SWAP',
        normalizeAmount: (price, amount) => amount * 100 * 100 / price,
    },
};