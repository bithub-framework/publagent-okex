import test from 'ava';
import QAOW from '../../';
import fse from 'fs-extra';
import path from 'path';
import axios from 'axios';
import Bluebird from 'bluebird';
import { Trade } from 'interfaces';

const config: {
    QUOTE_CENTER_PORT: number;
    OKEX_URL: string;
} = fse.readJsonSync(path.join(__dirname, '../../cfg/config.json'));

test.serial('1', async t => {
    console.log = t.log;
    console.info = t.log;
    console.error = t.log;

    const qAOW = new QAOW();
    await qAOW.start();
    let latest = 0;
    for (let i = 1; i <= 5; i++) {
        await axios
            .get(`http://localhost:${config.QUOTE_CENTER_PORT}/trades`, {
                params: {
                    exchange: 'okex',
                    pair: 'btc.usdt',
                    from: latest,
                }
            }).then(res => {
                const trades: Trade[] = res.data;
                t.log(trades);
                if (trades.length) latest = trades[trades.length - 1].id;
            }).catch(err => {
                t.log(err.stack);
            });
        await Bluebird.delay(1000);
    }
    await qAOW.stop();
});