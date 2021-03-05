"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upperNibble = void 0;
const upperNibble = (byte) => (byte & 0xf0) >> 4;
exports.upperNibble = upperNibble;
exports.default = exports.upperNibble;
//# sourceMappingURL=upperNibble.js.map