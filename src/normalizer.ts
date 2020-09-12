import Startable from 'startable';
import RawExtractor from './raw-extractor';
import RawOrderbookHandler from './raw-orderbook-handler';
import RawTradesHandler from './raw-trades-handler';
import {
    RawDataOrderbook,
    RawDataTrades,
    RawUnSub,
    RawData,
    Operation,
} from './interfaces';
import {
    getChannel,
    getPair,
    Pair,
    marketDescriptors,
} from './mappings';

/*
    'trades' pair trades
    'orderbook' pair orderbook
*/

class Normalizer extends Startable {
    private extractor: RawExtractor;
    private rawOrderbookHandler: {
        [pair: string]: RawOrderbookHandler;
    } = {};
    private rawTradesHandler: {
        [pair: string]: RawTradesHandler;
    } = {};

    constructor() {
        super();
        this.extractor = new RawExtractor();
    }

    protected async _start(): Promise<void> {
        this.extractor.on('error', console.error);
        await this.extractor.start(err => void this.stop(err));
        this.extractor.on('data', (raw: RawData) => {
            try {
                this.onRawData(raw);
            } catch (err) {
                this.stop(err);
            }
        });
    }

    protected async _stop(): Promise<void> {
        await this.extractor.stop();
    }

    private onRawData(raw: RawData): void {
        const { table } = raw;
        const channel = getChannel(table);
        if (channel === 'trades') {
            for (const rawTrade of (<RawDataTrades>raw).data) {
                const { instrument_id } = rawTrade;
                const pair = getPair(table, instrument_id);
                this.emit('trades', pair,
                    this.rawTradesHandler[pair].handle([rawTrade]),
                );
            }
        }
        if (channel === 'orderbook') {
            for (const rawOrderbookData of (<RawDataOrderbook>raw).data) {
                const { instrument_id } = rawOrderbookData;
                const pair = getPair(table, instrument_id);
                this.emit('orderbook', pair,
                    // this.rawOrderbookHandler[pair].handle(rawOrderbookData),
                    this.rawOrderbookHandler[pair].handleStock(rawOrderbookData),
                );
            }
        }
    }

    public async unSubscribe(
        operation: Operation,
        pair: Pair,
    ) {
        this.rawTradesHandler[pair] = new RawTradesHandler(pair);
        this.rawOrderbookHandler[pair] = new RawOrderbookHandler(pair);
        await this.extractor.send({
            op: operation,
            args: [
                marketDescriptors[pair].tradesChannel,
                marketDescriptors[pair].orderbookChannel,
            ],
        });

        const waitForUnsub = (operation: Operation, rawChannel: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                const onUnSub = (raw: RawUnSub) => {
                    if (
                        raw.event === operation &&
                        raw.channel === rawChannel
                    ) {
                        this.extractor.off('(un)sub', onUnSub);
                        this.extractor.off('error', reject);
                        resolve();
                    }
                }
                this.extractor.on('(un)sub', onUnSub);
                this.extractor.on('error', reject);
            });
        }
        await Promise.all([
            waitForUnsub(operation, marketDescriptors[pair].tradesChannel),
            waitForUnsub(operation, marketDescriptors[pair].orderbookChannel),
        ]);
    }
}

export {
    Normalizer as default,
    Normalizer,
};
