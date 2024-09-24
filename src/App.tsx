// src/App.tsx
import React, { useState, useEffect, lazy, Suspense } from 'react'; // Updated import to include useEffect
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { GET_VAULTS, GET_APY_FOR_VAULT, filterVaults } from './graphql/queries';
import { useQuery, useLazyQuery } from '@apollo/client';
import { LoadingSpinner, ErrorMessage } from './components/Loading';
import { ChainId } from './constants/chains';
const ApyChart = lazy(() => import('./components/ApyChart'));
const ApyChart2 = lazy(() => import('./components/ApyChart2'));
const Sidebar = lazy(() => import('./components/Sidebar'));
import NavBar from './components/NavBar';

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
  const { chainId, address } = useParams<{ chainId: string, address: string }>(); // Updated to include chainId
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleVaultClick = (vault: { address: string, name: string, chainId: ChainId, apiVersion: string }) => { // Updated to include apiVersion
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
    const versionPrefix = vault.apiVersion.startsWith('0') ? 'vaults' : vault.apiVersion.startsWith('3') ? 'v3' : ''; // Determine version prefix
    navigate(`/${versionPrefix}/${vault.chainId}/${vault.address}`); // Updated to include version prefix
  };

  const handleMenuClick = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  const filteredVaults = filterVaults(data.vaults)
    .filter(vault => vault.tvl && vault.tvl.close > 100) // Filter out vaults with null tvl and tvl.close <= 100
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
    <div className="flex flex-col h-screen w-screen">
      <NavBar onMenuClick={handleMenuClick} isSidebarOpen={isSidebarOpen} />
      <div className="flex flex-1 flex-col md:flex-row relative">
        <Suspense fallback={<div>Loading...</div>}>
          {/* Sidebar */}
          <div
            className={`fixed inset-y-0 right-0 z-30 w-full lg:w-96 lg:max-w-96 lg:min-w-96 p-4 lg:pl-2 lg:pr-2 lg:pt-0 lg:pb-0 bg-lightBackground dark:bg-darkBackground lg:bg-transparent transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex`}
          // style={{ width: '20rem', maxWidth: '20rem' }} // Fixed syntax errors
          >
            <Sidebar
              groupedVaults={groupedVaults}
              handleVaultClick={handleVaultClick}
              setIsSidebarOpen={setIsSidebarOpen} // Pass setIsSidebarOpen
              isSidebarOpen={isSidebarOpen} // Pass isSidebarOpen
            />
          </div>
          <div className="flex-1 flex flex-col items-center w-full lg:mr-[3rem] xl:mr-[6rem]">
            {apyLoading && <LoadingSpinner />}
            {apyError && <ErrorMessage error={apyError} />}
            {!apyLoading && !apyError && !apyData && (
              <div>
                <h2>Choose a Vault on the Left to see APY Data</h2>
              </div>
            )}
            {apyData && (
              <ApyChart2 data={apyData.timeseries} selectedAsset={selectedAsset} />
            )}
          </div>
        </Suspense>
      </div>
    </div>
  );
}

const AppWrapper: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/:versionPrefix/:chainId/:address" element={<App />} /> {/* Updated to include versionPrefix */}
    </Routes>
  </Router>
);

export default AppWrapper;