import QAOW from './index';
import logger from './logger';
import process from 'process';

const agent = new QAOW();

agent.start()
    .then(() => void process.once('SIGINT', () => {
        process.once('SIGINT', () => void process.exit(-1));
        agent.stop();
    }))
    .catch((err: Error) => {
        logger.error(err);
    });
