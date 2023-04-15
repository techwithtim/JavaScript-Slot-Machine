"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chains_1 = require("./chains");
function getAllChains() {
    return chains_1.chains;
}
exports.getAllChains = getAllChains;
function getChain(chainId) {
    const chain = chains_1.chains.find(x => x.chainId === chainId);
    if (typeof chain === 'undefined') {
        throw new Error(`No chain found matching chainId: ${chainId}`);
    }
    return chain;
}
exports.getChain = getChain;
function getChainByChainId(chainId) {
    const chain = getChain(chainId);
    return chain;
}
exports.getChainByChainId = getChainByChainId;
function getChainByKeyValue(key, value) {
    const allChains = getAllChains();
    let chain;
    const matches = allChains.filter(chain => chain[key] === value);
    if (matches && matches.length) {
        chain = matches[0];
    }
    if (typeof chain === 'undefined') {
        throw new Error(`No chain found matching ${key}: ${value}`);
    }
    return chain;
}
exports.getChainByKeyValue = getChainByKeyValue;
function getChainByNetworkId(networkId) {
    const chain = getChainByKeyValue('networkId', networkId);
    return chain;
}
exports.getChainByNetworkId = getChainByNetworkId;
function convertNetworkIdToChainId(networkId) {
    const chain = getChainByNetworkId(networkId);
    return chain.chainId;
}
exports.convertNetworkIdToChainId = convertNetworkIdToChainId;
function convertChainIdToNetworkId(chainId) {
    const chain = getChain(chainId);
    return chain.networkId;
}
exports.convertChainIdToNetworkId = convertChainIdToNetworkId;
//# sourceMappingURL=utils.js.map