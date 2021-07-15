"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRawUnSubscription = exports.isRawOrderbookMessage = exports.isRawTradesMessage = exports.isRawError = void 0;
__exportStar(require("interfaces"), exports);
function isRawError(rawMessage) {
    return rawMessage.event === 'error';
}
exports.isRawError = isRawError;
function isRawTradesMessage(message, rawInstrumentId) {
    return message.arg?.channel === 'trades' &&
        message.arg?.instId === rawInstrumentId;
}
exports.isRawTradesMessage = isRawTradesMessage;
function isRawOrderbookMessage(message, rawInstrumentId) {
    return message.arg?.channel === 'books5' &&
        message.arg?.instId === rawInstrumentId;
}
exports.isRawOrderbookMessage = isRawOrderbookMessage;
function isRawUnSubscription(message, operation, rawInstrumentId, rawChannel) {
    return message.event === operation &&
        message.arg?.channel === rawChannel &&
        message.arg?.instId === rawInstrumentId;
}
exports.isRawUnSubscription = isRawUnSubscription;
//# sourceMappingURL=interfaces.js.map