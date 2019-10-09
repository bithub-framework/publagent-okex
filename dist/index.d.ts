import Autonomous from 'autonomous';
declare class QuoteAgentOkexWebsocket extends Autonomous {
    private okex;
    private center;
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private connectQuoteCenter;
}
export default QuoteAgentOkexWebsocket;
