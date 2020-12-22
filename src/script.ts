import { adaptor } from 'startable';
import PublicAgent from './public-agent';

console.log = (...args: any[]) => {
    console.info(new Date());
    console.info(...args);
}

console.log('Starting');

const publicAgent = new PublicAgent();
adaptor(publicAgent);

publicAgent.start().then(() => {
    console.log('Started');
}, () => { });
