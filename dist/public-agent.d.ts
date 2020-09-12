import Startable from 'startable';
declare class PublicAgentOkexWebsocket extends Startable {
    private broadcast;
    private normalizer;
    private wsServer;
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
}
export { PublicAgentOkexWebsocket as default, PublicAgentOkexWebsocket, };
