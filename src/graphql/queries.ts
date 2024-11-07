import { gql } from '@apollo/client';
import { ChainId } from '../constants/chains';

export type Vault = {
  yearn: boolean;
  v3: boolean;
  name: string;
  chainId: ChainId
  address: string;
  asset: {
    name: string;
    symbol: string;
  };
  apiVersion: string;
  tvl: {
    blockTime: string;
    close: number;
    component: string;
    label: string;
  };
  pricePerShare: number;
};

export const GET_VAULTS = gql`
  query GetVaultData {
    vaults {
      yearn
      v3
      name
      chainId
      address
      asset {
        name
        symbol
      }
      apiVersion
      tvl {
        blockTime
        close
        component
        label
      }
      pricePerShare
    }
  }
`;

export const filterVaults = (vaults: Vault[]) => vaults.filter(vault => vault.yearn && vault.v3);

export const GET_APY_FOR_VAULT = gql`
query ApyQuery($label: String!, $chainId: Int, $address: String, $limit: Int, $component: String) {
  timeseries(label: $label, chainId: $chainId, address: $address, limit: $limit, component: $component) {
    chainId
    address
    label
    component
    period
    time
    value
  }
}
`;
