declare class QuoteAgentOkexWebsocket {
    private okex;
    constructor();
    start(): Promise<void>;
    stop(): void;
}
export default QuoteAgentOkexWebsocket;
