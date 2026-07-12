"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeAccessToken = exports.verifyAccessToken = exports.generateAccessToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const auth_1 = require("../constants/auth");
const appError_1 = require("./appError");
const httpStatus_1 = require("../constants/httpStatus");
const generateAccessToken = (payload) => {
    const jti = crypto_1.default.randomUUID();
    return jsonwebtoken_1.default.sign({ ...payload, jti }, env_1.env.JWT_SECRET, {
        expiresIn: auth_1.AUTH_CONSTANTS.TOKEN_EXPIRATION.ACCESS_TOKEN,
        algorithm: auth_1.AUTH_CONSTANTS.ALGORITHMS.JWT,
        issuer: env_1.env.JWT_ISSUER,
        audience: env_1.env.JWT_AUDIENCE,
        keyid: env_1.env.JWT_KEY_ID,
    });
};
exports.generateAccessToken = generateAccessToken;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET, {
            issuer: env_1.env.JWT_ISSUER,
            audience: env_1.env.JWT_AUDIENCE,
            algorithms: [auth_1.AUTH_CONSTANTS.ALGORITHMS.JWT],
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new appError_1.AppError('Token has expired', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.TOKEN_EXPIRED);
        }
        throw new appError_1.AppError('Invalid token', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.TOKEN_INVALID);
    }
};
exports.verifyAccessToken = verifyAccessToken;
const decodeAccessToken = (token) => {
    return jsonwebtoken_1.default.decode(token);
};
exports.decodeAccessToken = decodeAccessToken;
