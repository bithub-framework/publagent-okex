import {
    Trade, Action,
} from 'interfaces';
import {
    RawTradeData,
    RawOrderbookData,
    OrderString,
} from './interface';

function formatRawTrades(trades: RawTradeData['data']): Trade[] {
    return trades.map(trade => ({
        action: trade.side === 'buy' ? Action.BID : Action.ASK,
        price: Number.parseFloat(trade.price),
        amount: Number.parseFloat(trade.size),
        time: new Date(trade.timestamp).getTime(),
    })).reverse();
}

function formatRawOrderToOrderString(
    rawOrder: RawOrderbookData['data'][0]['asks'][0],
    action: Action
): OrderString {
    return {
        action,
        price: rawOrder[0],
        amount: rawOrder[1],
    };

}

function formatRawOrderbookToOrdersString(
    orderbook: RawOrderbookData['data'][0]
): OrderString[] {
    return [
        ...orderbook.bids.map(rawOrder =>
            formatRawOrderToOrderString(rawOrder, Action.BID)),
        ...orderbook.asks.map(rawOrder =>
            formatRawOrderToOrderString(rawOrder, Action.ASK)),
    ]
}

export {
    formatRawOrderbookToOrdersString,
    formatRawTrades,
};