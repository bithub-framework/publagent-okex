import { OrderAndRaw } from './incremental';
import { Trade, Action } from 'interfaces';
declare function formatTrades(trades: any[]): Trade[];
declare function formatOrder(rawOrder: [string, string, number], action: Action): OrderAndRaw;
declare function formatOrderbook(orderbook: any): OrderAndRaw[];
export { formatOrder, formatOrderbook, formatTrades, };
