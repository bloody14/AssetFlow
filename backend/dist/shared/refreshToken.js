"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.hashRefreshToken = exports.generateRefreshToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateRefreshToken = () => {
    return crypto_1.default.randomBytes(40).toString('hex');
};
exports.generateRefreshToken = generateRefreshToken;
const hashRefreshToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
exports.hashRefreshToken = hashRefreshToken;
const verifyRefreshToken = (plainToken, hashedToken) => {
    const hash = (0, exports.hashRefreshToken)(plainToken);
    // Prevent timing attacks by comparing buffers of equal length
    const hashBuffer = Buffer.from(hash);
    const targetBuffer = Buffer.from(hashedToken);
    if (hashBuffer.length !== targetBuffer.length) {
        return false;
    }
    return crypto_1.default.timingSafeEqual(hashBuffer, targetBuffer);
};
exports.verifyRefreshToken = verifyRefreshToken;
