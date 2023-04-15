export interface IChainData {
    name: string;
    chainId: number;
    shortName: string;
    chain: string;
    network: string;
    networkId: number;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpc: string[];
    faucets: string[];
    infoURL: string;
}
//# sourceMappingURL=types.d.ts.map