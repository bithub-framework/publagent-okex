import Startable from 'startable';
declare class PublicAgentOkexWebsocket extends Startable {
    private broadcast;
    private rawExtractor;
    private btcUsdt;
    private wsServer;
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
}
export { PublicAgentOkexWebsocket as default, PublicAgentOkexWebsocket, };
