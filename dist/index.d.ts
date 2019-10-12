import Autonomous from 'autonomous';
declare class PublicAgentOkexWebsocket extends Autonomous {
    private okex;
    private center;
    private rawOrderbookHandler;
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private connectPublicCenter;
    private connectOkex;
    private getInstruments;
    private onRawData;
    private onRawInstrumentsData;
    private onRawTradeData;
    private onRawOrderbookData;
    private subscribeInstruments;
    private subscribeTrades;
    private subscribeOrderbook;
}
export default PublicAgentOkexWebsocket;
