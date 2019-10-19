import { RawTrades, Trade } from './interfaces';
declare function formatRawTrade(rawTrades: RawTrades['data'][0], isPerpetual?: boolean): Trade;
export default formatRawTrade;
export { formatRawTrade, };
