import { adaptor } from 'startable';
import PublicAgent from './public-agent';

const publicAgent = new PublicAgent();
adaptor(publicAgent);

publicAgent.start().then(() => {
    console.log('Started');
}, () => { });
