"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getChannel(table) {
    const c = table.split('/')[1];
    if (c === 'trade')
        return 'trades';
    if (c === 'depth')
        return 'orderbook';
    throw new Error('invalid channel');
}
exports.getChannel = getChannel;
function getPair(table, instrument_id) {
    const c = table.split('/')[0];
    if (c === 'spot' && instrument_id === 'BTC-USDT')
        return 'BTC/USDT';
    if (c === 'swap' && instrument_id === 'BTC-USD-SWAP')
        return 'BTC-USD-SWAP/USD';
    throw new Error('invalid pair');
}
exports.getPair = getPair;
const MARKETS = [
    {
        pair: 'BTC/USDT',
        tradesChannel: 'spot/trade:BTC-USDT',
        orderbookChannel: 'spot/depth:BTC-USDT',
    }, {
        pair: 'BTC-USD-SWAP/USD',
        tradesChannel: 'swap/trade:BTC-USD-SWAP',
        orderbookChannel: 'swap/depth:BTC-USD-SWAP',
    }
];
exports.MARKETS = MARKETS;
//# sourceMappingURL=mapping.js.map