import React, { useState } from 'react';
import './App.css'
import TestChart from './components/TestChart'
import { GET_VAULTS, GET_APY_FOR_VAULT, filterVaults } from './graphql/queries'
import { useQuery, useLazyQuery } from '@apollo/client';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {

  // gets vault data for all chains
  const { data, loading, error } = useQuery(GET_VAULTS);
  const [getApyData, { data: apyData, loading: apyLoading, error: apyError }] = useLazyQuery(GET_APY_FOR_VAULT);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const handleVaultClick = (vault: { address: string,  name: string, chainId: number }) => {
    setSelectedAsset(vault.name);
    getApyData({
      variables: {
        chainId: vault.chainId,
        address: vault.address,
        label: 'apy-bwd-delta-pps',
        component: 'weeklyNet',
        limit: 1000,
      },
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const filteredVaults = filterVaults(data.vaults)
    .filter(vault => vault.tvl.close > 100)
    .sort((a, b) => b.tvl.close - a.tvl.close);

  // Group vaults by asset name
  const groupedVaults = filteredVaults.reduce((acc: Record<string, typeof filteredVaults>, vault) => {
    const assetName = vault.asset.name;
    if (!acc[assetName]) {
      acc[assetName] = [];
    }
    acc[assetName].push(vault);
    return acc;
  }, {});

  // Sort each group by chainId
  Object.keys(groupedVaults).forEach(assetName => {
    groupedVaults[assetName].sort((a, b) => a.chainId - b.chainId);
  });

  console.log(groupedVaults);

  return (
    <div className="flex">
        <Sidebar groupedVaults={groupedVaults} handleVaultClick={handleVaultClick} />
      <div className="flex-1 p-5">
        {apyLoading && <p>Loading APR data...</p>}
        {apyError && <p>Error: {apyError.message}</p>}
        {apyData && (
          <>
            <h1>{selectedAsset ? `${selectedAsset} Chart` : 'Name not found'}</h1>
            <TestChart data={apyData.timeseries} />
            <pre>{JSON.stringify(apyData, null, 2)}</pre>
          </>
        )}
      </div>
    </div>
  )
}

export default App
