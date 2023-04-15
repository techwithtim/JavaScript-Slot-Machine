# evm-chains

Package to query chain data from [ethereum-lists/chains](https://github.com/ethereum-lists/chains)

## Install

```sh
npm install --save evm-chains

#or

yarn add evm-chains
```

## API

```typescript
function getAllChains(): IChainData[];
function getChain(chainId: number): IChainData;
function getChainByChainId(chainId: number): IChainData;
function getChainByKeyValue(key: string, value: any): IChainData;
function getChainByNetworkId(networkId: number): number;
function convertNetworkIdToChainId(networkId: number): number;
function convertChainIdToNetworkId(chainId: number): number;
```

## Types

```typescript
interface IChainData {
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
```

## Data Source

[https://github.com/ethereum-lists/chains](https://github.com/ethereum-lists/chains)
