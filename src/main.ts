import QAOW from './index';
import timers from 'timers';

const agent = new QAOW();

agent.start()
    .then(() => {
        timers.setTimeout(() => {
            agent.stop();
        }, 10000);
    }).catch((err: Error) => {
        console.log(err);
    });
