import Startable from 'startable';
import EventEmitter from 'events';
import WsServer from './ws-server';
import BtcUsdt from './btc-usdt';
import Deserializer from './deserializer';

class PublicAgentOkexWebsocket extends Startable {
    private broadcast = new EventEmitter();
    private deserializer = new Deserializer();
    private btcUsdt = new BtcUsdt(
        this.deserializer,
        this.broadcast,
    );
    private wsServer = new WsServer(this.broadcast);

    protected async _start(): Promise<void> {
        this.deserializer.on('error', console.error);
        console.log(1);
        await this.deserializer.start(err => this.stop(err));
        console.log(2);
        await this.btcUsdt.start(err => this.stop(err));
        console.log(3);
        await this.wsServer.start(err => this.stop(err));
        console.log(4);
    }

    protected async _stop(): Promise<void> {
        await this.wsServer.stop();
        await this.btcUsdt.stop();
        await this.deserializer.stop();
    }
}

export {
    PublicAgentOkexWebsocket as default,
    PublicAgentOkexWebsocket,
};
