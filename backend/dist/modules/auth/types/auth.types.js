"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainRevokedBy = exports.DomainSessionStatus = void 0;
var DomainSessionStatus;
(function (DomainSessionStatus) {
    DomainSessionStatus["ACTIVE"] = "ACTIVE";
    DomainSessionStatus["EXPIRED"] = "EXPIRED";
    DomainSessionStatus["REVOKED"] = "REVOKED";
    DomainSessionStatus["COMPROMISED"] = "COMPROMISED";
    DomainSessionStatus["ARCHIVED"] = "ARCHIVED";
})(DomainSessionStatus || (exports.DomainSessionStatus = DomainSessionStatus = {}));
var DomainRevokedBy;
(function (DomainRevokedBy) {
    DomainRevokedBy["USER"] = "USER";
    DomainRevokedBy["ADMIN"] = "ADMIN";
    DomainRevokedBy["SYSTEM"] = "SYSTEM";
    DomainRevokedBy["SECURITY_ENGINE"] = "SECURITY_ENGINE";
})(DomainRevokedBy || (exports.DomainRevokedBy = DomainRevokedBy = {}));
