import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import ApyChart from './components/ApyChart';
import { GET_VAULTS, GET_APY_FOR_VAULT, filterVaults } from './graphql/queries';
import { useQuery, useLazyQuery } from '@apollo/client';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const { data, loading, error } = useQuery(GET_VAULTS);
  const [getApyData, { data: apyData, loading: apyLoading, error: apyError }] = useLazyQuery(GET_APY_FOR_VAULT);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const navigate = useNavigate();
  // Removed unused 'address' variable
  useParams<{ address: string }>();

  const handleVaultClick = (vault: { address: string, name: string, chainId: number }) => {
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
    navigate(`/${vault.address}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const filteredVaults = filterVaults(data.vaults)
    .filter(vault => vault.tvl.close > 100)
    .sort((a, b) => b.tvl.close - a.tvl.close);

  const groupedVaults = filteredVaults.reduce((acc: Record<string, typeof filteredVaults>, vault) => {
    const assetName = vault.asset.name;
    if (!acc[assetName]) {
      acc[assetName] = [];
    }
    acc[assetName].push(vault);
    return acc;
  }, {});

  Object.keys(groupedVaults).forEach(assetName => {
    groupedVaults[assetName].sort((a, b) => a.chainId - b.chainId);
  });

  return (
    <div className="flex">
      <Sidebar groupedVaults={groupedVaults} handleVaultClick={handleVaultClick} />
      <div className="flex-1 p-5 flex flex-col items-center justify-center h-screen">
        {apyLoading && <p>Loading APR data...</p>}
        {apyError && <p>Error: {apyError.message}</p>}
        {!apyData && (
          <div>
            <h2>Choose a Vault on the Left to see APY Data</h2>
          </div>
        )}
        {apyData && (
          <>
            <h1>{selectedAsset ? `${selectedAsset} Chart` : 'Name not found'}</h1>
            <div className="mt-8">
              <ApyChart data={apyData.timeseries} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/:address" element={<App />} />
    </Routes>
  </Router>
);

export default AppWrapper;