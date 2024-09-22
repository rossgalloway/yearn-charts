import React, { useState, useEffect, lazy, Suspense } from 'react'; // Updated import to include useEffect
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { GET_VAULTS, GET_APY_FOR_VAULT, filterVaults } from './graphql/queries';
import { useQuery, useLazyQuery } from '@apollo/client';
import { LoadingSpinner, ErrorMessage } from './components/Loading';
import { ChainId } from './constants/chains';
const ApyChart = lazy(() => import('./components/ApyChart'));
const Sidebar = lazy(() => import('./components/Sidebar'));

interface Vault {
  address: string;
  name: string;
  asset: { name: string };
  chainId: ChainId;
  apiVersion: string;
  tvl: { close: number };
}

interface GroupedVaults {
  [key: string]: Vault[];
}

const App: React.FC = () => {
  const { data, loading, error } = useQuery(GET_VAULTS);
  const [getApyData, { data: apyData, loading: apyLoading, error: apyError }] = useLazyQuery(GET_APY_FOR_VAULT);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const navigate = useNavigate();
  const { address } = useParams<{ address: string }>(); 

  useEffect(() => {
    if (address && data) {
      const vault = data.vaults.find((v: { address: string }) => v.address === address);
      if (vault) {
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
      }
    }
  }, [address, data]); 

  const handleVaultClick = (vault: { address: string, name: string, chainId: ChainId }) => {
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

  if (loading) return <LoadingSpinner />; 
  if (error) return <ErrorMessage error={error} />; 

  const filteredVaults = filterVaults(data.vaults)
    .filter(vault => vault.tvl.close > 100)
    .sort((a, b) => b.tvl.close - a.tvl.close);

  const groupedVaults: GroupedVaults = filteredVaults.reduce((acc: GroupedVaults, vault) => {
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
    <div className="flex h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <Sidebar groupedVaults={groupedVaults} handleVaultClick={handleVaultClick} />
        <div className="flex-1 p-5 flex flex-col items-center justify-center">
          {apyLoading && <LoadingSpinner />}
          {apyError && <ErrorMessage error={apyError} />}
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
      </Suspense>
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