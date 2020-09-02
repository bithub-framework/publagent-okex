import Startable from 'startable';
import RawExtractor from './raw-extractor';
import RawOrderbookHandler from './raw-orderbook-handler';
import RawTradesHandler from './raw-trades-handler';
import { getChannel, getPair, marketDescriptors, } from './market-descriptions';
/*
    'trades' pair trades
    'orderbook' pair orderbook
*/
class Normalizer extends Startable {
    constructor(url) {
        super();
        this.rawOrderbookHandler = {};
        this.rawTradesHandler = {};
        this.extractor = new RawExtractor(url);
    }
    async _start() {
        this.extractor.on('error', console.error);
        await this.extractor.start(err => void this.stop(err));
        this.extractor.on('data', (raw) => {
            try {
                this.onRawData(raw);
            }
            catch (err) {
                this.stop(err);
            }
        });
    }
    async _stop() {
        await this.extractor.stop();
    }
    onRawData(raw) {
        const { table } = raw;
        const channel = getChannel(table);
        if (channel === 'trades') {
            for (const rawTrade of raw.data) {
                const { instrument_id } = rawTrade;
                const pair = getPair(table, instrument_id);
                this.emit('trades', pair, this.rawTradesHandler[pair].handle([rawTrade]));
            }
        }
        if (channel === 'orderbook') {
            for (const rawOrderbookData of raw.data) {
                const { instrument_id } = rawOrderbookData;
                const pair = getPair(table, instrument_id);
                this.emit('orderbook', pair, 
                // this.rawOrderbookHandler[pair].handle(rawOrderbookData),
                this.rawOrderbookHandler[pair].handleStock(rawOrderbookData));
            }
        }
    }
    waitForUnsub(operation, rawChannel) {
        return new Promise((resolve, reject) => {
            const onUnSub = (raw) => {
                if (raw.event === operation &&
                    raw.channel === rawChannel) {
                    this.extractor.off('(un)sub', onUnSub);
                    this.extractor.off('error', reject);
                    resolve();
                }
            };
            this.extractor.on('(un)sub', onUnSub);
            this.extractor.on('error', reject);
        });
    }
    async unSubscribe(operation, pair) {
        this.rawTradesHandler[pair] = new RawTradesHandler(pair);
        this.rawOrderbookHandler[pair] = new RawOrderbookHandler(pair);
        await this.extractor.send({
            op: operation,
            args: [
                marketDescriptors[pair].tradesChannel,
                marketDescriptors[pair].orderbookChannel,
            ],
        });
        await Promise.all([
            this.waitForUnsub(operation, marketDescriptors[pair].tradesChannel),
            this.waitForUnsub(operation, marketDescriptors[pair].orderbookChannel),
        ]);
    }
}
export { Normalizer as default, Normalizer, };
//# sourceMappingURL=normalizer.js.map