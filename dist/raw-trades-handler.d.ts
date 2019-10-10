import { RawTrades, Trade } from './interfaces';
declare function formatRawTrade(rawTrades: RawTrades['data'][0], isContract?: boolean): Trade;
export { formatRawTrade, };
