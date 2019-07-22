import { OrderAndRaw } from './incremental';
import {
    Trade, Action, Order,
} from 'interfaces';

function formatTrades(trades: any[]): Trade[] {
    return trades.map(trade => ({
        action: trade.side === 'buy' ? Action.BID : Action.ASK,
        price: Number.parseFloat(trade.price),
        amount: Number.parseFloat(trade.size),
        time: new Date(trade.timestamp).getTime(),
    })).reverse();
}

function formatOrder(rawOrder: [string, string, number], action: Action): OrderAndRaw {
    const order: Order = {
        action,
        price: Number.parseFloat(rawOrder[0]),
        amount: Number.parseFloat(rawOrder[1]),
    };
    return {
        order,
        raw: [rawOrder[0], rawOrder[1]],
    }
}

function formatOrderbook(orderbook: any): OrderAndRaw[] {
    return [
        ...orderbook.bids.map((rawOrder: any) =>
            formatOrder(rawOrder, Action.BID)),
        ...orderbook.asks.map((rawOrder: any) =>
            formatOrder(rawOrder, Action.ASK)),
    ]
}

export {
    formatOrder,
    formatOrderbook,
    formatTrades,
};