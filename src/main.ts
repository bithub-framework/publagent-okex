import QuoteAgentOkexWebsocket from './index';
import timers from 'timers';

const agent = new QuoteAgentOkexWebsocket();

agent.start()
    .then(() => {
        timers.setTimeout(() => {
            agent.stop();
        }, 10000);
    }).catch(err => {
        console.log(err);
    });
