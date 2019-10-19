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
};

export {
    marketDescriptors,
    getChannel,
    getPair,
    MarketDescriptor,
}