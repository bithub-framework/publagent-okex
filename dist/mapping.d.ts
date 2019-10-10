declare function getChannel(table: string): string;
declare function getPair(table: string, instrument_id: string): string;
interface MarketDescriptor {
    tradesChannel?: string;
    orderbookChannel?: string;
    instrumentId?: string;
}
declare const marketDescriptors: {
    [key: string]: MarketDescriptor;
};
export { marketDescriptors, getChannel, getPair, MarketDescriptor, };
