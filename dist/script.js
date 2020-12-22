import { adaptor } from 'startable';
import PublicAgent from './public-agent';
console.log = (...args) => {
    console.info(new Date());
    console.info(...args);
};
console.log('Starting');
const publicAgent = new PublicAgent();
adaptor(publicAgent);
publicAgent.start().then(() => {
    console.log('Started');
}, () => { });
//# sourceMappingURL=script.js.map