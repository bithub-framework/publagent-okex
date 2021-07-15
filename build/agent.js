"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublagentOkex = void 0;
const startable_1 = require("startable");
const events_1 = require("events");
const stream_1 = require("./stream");
const server_1 = require("./server");
class PublagentOkex extends startable_1.Startable {
    constructor(extractorConstructors) {
        super();
        this.broadcast = new events_1.EventEmitter();
        this.stream = new stream_1.Stream();
        this.stream.on('error', console.error);
        this.extractors = extractorConstructors.map(extractorConstructor => new extractorConstructor(this.stream, this.broadcast));
        this.servers = this.extractors.map(extractor => new server_1.Server(extractor.mid, this.broadcast));
    }
    async _start() {
        await this.stream.start(this.starp);
        for (const extractor of this.extractors)
            await extractor.start(this.starp);
        for (const server of this.servers)
            await server.start(this.starp);
    }
    async _stop() {
        for (const server of this.servers)
            await server.stop();
        for (const extractor of this.extractors)
            await extractor.stop();
        await this.stream.stop();
    }
}
exports.PublagentOkex = PublagentOkex;
//# sourceMappingURL=agent.js.map