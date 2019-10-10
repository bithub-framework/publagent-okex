declare function getChannel(table: string): string;
declare function getPair(table: string, instrument_id: string): string;
declare const MARKETS: {
    pair: string;
    tradesChannel: string;
    orderbookChannel: string;
}[];
export { MARKETS, getChannel, getPair, };
