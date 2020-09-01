import Startable from 'startable';
declare class PublicAgentOkexWebsocket extends Startable {
    private normalizer;
    private center;
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private connectOkex;
    private connectPublicCenter;
    private subscribeTrades;
    private subscribeOrderbook;
}
export { PublicAgentOkexWebsocket as default, PublicAgentOkexWebsocket, };
