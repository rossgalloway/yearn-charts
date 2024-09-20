import { gql } from '@apollo/client';

export type Vault = {
  yearn: boolean;
  name: string;
  chainId: number
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

export const filterVaults = (vaults: Vault[]) => vaults.filter(vault => vault.yearn);

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


/*
query ExampleQuery($chainId: Int) {
  vaults(chainId: $chainId) {
    address
    asset {
      name
      symbol
    }
    performanceFee
    tvl {
      close
    }
    pricePerShare
    lastReport
    lastReportDetail {
      apr {
        gross
        net
      }
      profitUsd
    }
    expectedReturn
    apy {
      blockNumber
      blockTime
      grossApr
      inceptionNet
      monthlyNet
      net
      weeklyNet
    }
    sparklines {
      apy {
        address
        blockTime
        chainId
        close
        component
        label
      }
    }
    apiVersion
  }
}
  `;
  */