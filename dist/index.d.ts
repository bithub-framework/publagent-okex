import { Autonomous } from 'autonomous';
declare class PublicAgentOkexWebsocket extends Autonomous {
    private okex;
    private center;
    private rawOrderbookHandler;
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private connectPublicCenter;
    private connectOkex;
    private onRawData;
    private onRawTradeData;
    private onRawOrderbookData;
    private subscribeTrades;
    private subscribeOrderbook;
}
export default PublicAgentOkexWebsocket;
export { PublicAgentOkexWebsocket };
