export function getChannel(table) {
    const c = table.split('/')[1];
    if (c === 'trade')
        return 'trades';
    if (c === 'depth5')
        return 'orderbook';
    // if (c === 'depth_l2_tbt') return 'orderbook';
    if (table === 'futures/instruments')
        return 'instruments';
    throw new Error('invalid channel');
}
export function getPair(table, instrument_id) {
    const c = table.split('/')[0];
    if (c === 'spot' && instrument_id === 'BTC-USDT')
        return 'BTC/USDT';
    if (c === 'swap' && instrument_id === 'BTC-USD-SWAP')
        return 'BTC-USD-SWAP/USD';
    throw new Error('invalid pair');
}
export const marketDescriptors = {
    'BTC/USDT': {
        tradesChannel: 'spot/trade:BTC-USDT',
        orderbookChannel: 'spot/depth5:BTC-USDT',
        // orderbookChannel: 'spot/depth_l2_tbt:BTC-USDT',
        instrumentId: 'BTC-USDT',
        normalizeAmount: (price, amount) => amount,
    },
    'BTC-USD-SWAP/USD': {
        tradesChannel: 'swap/trade:BTC-USD-SWAP',
        orderbookChannel: 'swap/depth5:BTC-USD-SWAP',
        // orderbookChannel: 'swap/depth_l2_tbt:BTC-USD-SWAP',
        instrumentId: 'BTC-USD-SWAP',
        normalizeAmount: (price, amount) => amount * 100 * 100 / price,
    },
};
//# sourceMappingURL=market-descriptions.js.map