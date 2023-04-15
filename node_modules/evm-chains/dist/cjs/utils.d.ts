import { IChainData } from './types';
export declare function getAllChains(): IChainData[];
export declare function getChain(chainId: number): IChainData;
export declare function getChainByChainId(chainId: number): IChainData;
export declare function getChainByKeyValue(key: string, value: any): IChainData;
export declare function getChainByNetworkId(networkId: number): IChainData;
export declare function convertNetworkIdToChainId(networkId: number): number;
export declare function convertChainIdToNetworkId(chainId: number): number;
//# sourceMappingURL=utils.d.ts.map