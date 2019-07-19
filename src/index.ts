import { V3WebsocketClient } from '@okfe/okex-node';

class QuoteAgentOkexWebsocket {
    private okex = new V3WebsocketClient();

    constructor() {
    }

    async start(): Promise<void> {
        this.okex.connect();
        await new Promise((resolve, reject) => {
            this.okex.once('open', resolve);
            this.okex.once('error', reject);
        });
        this.okex.subscribe('spot/trade:btc-usdt');
        this.okex.on('message', msg => void console.log(msg));
    }

    stop(): void {
        this.okex.close();
    }
}

export default QuoteAgentOkexWebsocket;