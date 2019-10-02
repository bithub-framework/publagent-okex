import Autonomous from 'autonomous';
declare class QuoteAgentOkexWebsocket extends Autonomous {
    private okex;
    private center;
    private subscriberTrade;
    private subscriberOrderbook;
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private connectQuoteCenter;
    private connectOkex;
    private subscribeTrades;
    private subscribeOrderbook;
}
export default QuoteAgentOkexWebsocket;
