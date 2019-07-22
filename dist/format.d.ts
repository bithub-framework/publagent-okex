import { OrderWithID } from './incremental';
import { Trade, Action } from 'interfaces';
declare function formatTrades(trades: any[]): Trade[];
declare function formatOrder(rawOrder: any, action: Action): OrderWithID;
declare function formatOrderbook(orderbook: any): OrderWithID[];
export { formatOrder, formatOrderbook, formatTrades, };
