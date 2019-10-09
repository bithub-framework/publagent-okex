import Autonomous from 'autonomous';
declare class QuoteAgentOkexWebsocket extends Autonomous {
    private okex;
    private center;
    private rawOrderbookHandler;
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private connectQuoteCenter;
    private connectOkex;
    private onRawData;
    private onRawTrades;
    private onRawOrderbook;
    private subscribeTrades;
    private subscribeOrderbook;
}
export default QuoteAgentOkexWebsocket;
