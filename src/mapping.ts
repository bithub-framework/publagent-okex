function getChannel(table: string): string {
    const c = table.split('/')[1];
    if (c === 'trade') return 'trades';
    if (c === 'depth') return 'orderbook';
    if (table === 'futures/instruments') return 'instruments';
    throw new Error('invalid channel');
}

function getPair(table: string, instrument_id: string): string {
    const c = table.split('/')[0];
    if (c === 'spot' && instrument_id === 'BTC-USDT') return 'BTC/USDT';
    if (c === 'swap' && instrument_id === 'BTC-USD-SWAP') return 'BTC-USD-SWAP/USD';
    if (
        c === 'futures' && instrument_id
        === marketDescriptors['BTC-USD-THIS-WEEK/USD'].instrumentId
    ) return 'BTC-USD-THIS-WEEK/USD';
    if (
        c === 'futures' && instrument_id
        === marketDescriptors['BTC-USD-NEXT-WEEK/USD'].instrumentId
    ) return 'BTC-USD-NEXT-WEEK/USD';
    if (
        c === 'futures' && instrument_id
        === marketDescriptors['BTC-USD-QUARTER/USD'].instrumentId
    ) return 'BTC-USD-QUARTER/USD';

    throw new Error('invalid pair');
}

interface MarketDescriptor {
    tradesChannel?: string;
    orderbookChannel?: string;
    instrumentId?: string;
}

const marketDescriptors: {
    [key: string]: MarketDescriptor;
} = {
    'BTC/USDT': {
        tradesChannel: 'spot/trade:BTC-USDT',
        orderbookChannel: 'spot/depth:BTC-USDT',
        instrumentId: 'BTC-USDT',
    },
    'BTC-USD-SWAP/USD': {
        tradesChannel: 'swap/trade:BTC-USD-SWAP',
        orderbookChannel: 'swap/depth:BTC-USD-SWAP',
        instrumentId: 'BTC-USD-SWAP',
    },
    'BTC-USD-THIS-WEEK/USD': {},
    'BTC-USD-NEXT-WEEK/USD': {},
    'BTC-USD-QUARTER/USD': {},
};

export {
    marketDescriptors,
    getChannel,
    getPair,
    MarketDescriptor,
}