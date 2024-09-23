import React, { useState } from 'react';
import { CHAIN_ID_TO_NAME, ChainId } from '../constants/chains';
import { getApiVersion } from '../helpers/getApiVersion';
import Hamburger from 'hamburger-react';
import Logo from '/logo.svg';

interface Vault {
  address: string;
  name: string;
  asset: { name: string };
  chainId: ChainId;
  apiVersion: string;
  tvl: { close: number };
}

interface SidebarProps {
  groupedVaults: { [key: string]: Vault[] };
  handleVaultClick: (vault: Vault) => void;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>; // Accept setIsSidebarOpen
  isSidebarOpen: boolean; // Accept isSidebarOpen
}

interface OpenGroupsState {
  [assetName: string]: {
    isOpen: boolean;
    chains: {
      [chainName: string]: {
        isOpen: boolean;
        versions: {
          [version: string]: boolean;
        };
      };
    };
  };
}

// Reusable ToggleButton component
interface ToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isOpen, onClick, label, className }) => (
  <button
    className={`p-2.5 w-full text-left cursor-pointer font-med hover:bg-blue-700 hover:text-white flex justify-between ${className}`}
    onClick={onClick}
  >
    <span>{label}</span>
    <span>{isOpen ? '−' : '+'}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({
  groupedVaults,
  handleVaultClick,
  setIsSidebarOpen,
  isSidebarOpen,
}) => {
  const [openGroups, setOpenGroups] = useState<OpenGroupsState>({});
  const [activeVault, setActiveVault] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Function to toggle asset group
  const toggleAssetGroup = (assetName: string) => {
    setOpenGroups(prevState => ({
      ...prevState,
      [assetName]: {
        ...prevState[assetName],
        isOpen: !prevState[assetName]?.isOpen,
      },
    }));
  };

  // Function to toggle chain group
  const toggleChainGroup = (assetName: string, chainName: string) => {
    setOpenGroups(prevState => ({
      ...prevState,
      [assetName]: {
        ...prevState[assetName],
        chains: {
          ...prevState[assetName]?.chains,
          [chainName]: {
            ...prevState[assetName]?.chains?.[chainName],
            isOpen: !prevState[assetName]?.chains?.[chainName]?.isOpen,
          },
        },
      },
    }));
  };

  // Function to toggle version group
  const toggleVersionGroup = (assetName: string, chainName: string, version: string) => {
    setOpenGroups(prevState => ({
      ...prevState,
      [assetName]: {
        ...prevState[assetName],
        chains: {
          ...prevState[assetName]?.chains,
          [chainName]: {
            ...prevState[assetName]?.chains?.[chainName],
            versions: {
              ...prevState[assetName]?.chains?.[chainName]?.versions,
              [version]: !prevState[assetName]?.chains?.[chainName]?.versions?.[version],
            },
          },
        },
      },
    }));
  };

  // Handle vault click and set active vault
  const handleVaultClickWithActive = (vault: Vault) => {
    setActiveVault(vault.address);
    handleVaultClick(vault);
    setIsSidebarOpen(false);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };

  // Filter and group vaults based on search term
  const filteredGroupedVaults = Object.keys(groupedVaults).reduce((acc: Record<string, Vault[]>, assetName) => {
    const filteredVaults = groupedVaults[assetName].filter(
      vault =>
        vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vault.address.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    if (filteredVaults.length > 0) {
      acc[assetName] = filteredVaults;
    }
    return acc;
  }, {});

return (
  <div className="md:pr-4 md:h-[calc(100vh-64px)] h-[100vh] pr-0 flex flex-col">
    {/* Menu Header for Mobile */}
    <div className="md:hidden flex items-center justify-between mb-4">
      <div className="flex items-center">
        <img src={Logo} className="w-8 h-8 mr-2" alt="Logo" />
        <span className="text-xl font-bold">Yearn Charts</span>
      </div>
      <Hamburger
        toggled={isSidebarOpen}
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
        size={20}
        direction="right"
      />
    </div>
    {/* Search Bar */}
    <div className="sticky top-0 z-10 bg-lightBackground dark:bg-gray-800"> {/* Added background color */}
      <input
        type="text"
        placeholder="Search vaults..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full p-2.5 border border-gray-300 rounded"
      />
    </div>
    <div className="h-4"></div>
    <div className="overflow-y-auto flex-1"> {/* Added flex-1 */}
      {Object.keys(filteredGroupedVaults).map(assetName => {
        const isAssetOpen = openGroups[assetName]?.isOpen || false;
        return (
          <div key={assetName}>
            <ToggleButton
              isOpen={isAssetOpen}
              onClick={() => toggleAssetGroup(assetName)}
              label={assetName}
              className={` ${isAssetOpen ? 'font-bold' : ''}`}
            />
            {isAssetOpen && (
              <div className="pl-4">
                {/* Group vaults by chain */}
                {Object.keys(
                  filteredGroupedVaults[assetName].reduce((acc: Record<string, Vault[]>, vault) => {
                    const chainName = CHAIN_ID_TO_NAME[vault.chainId];
                    if (!acc[chainName]) acc[chainName] = [];
                    acc[chainName].push(vault);
                    return acc;
                  }, {}),
                ).map(chainName => {
                  const isChainOpen = openGroups[assetName]?.chains?.[chainName]?.isOpen || false;
                  return (
                    <div key={chainName}>
                      <ToggleButton
                        isOpen={isChainOpen}
                        onClick={() => toggleChainGroup(assetName, chainName)}
                        label={chainName}
                        className={` ${isChainOpen ? 'font-bold' : ''}`}
                      />
                      {isChainOpen && (
                        <div className="pl-4">
                          {/* Group vaults by version */}
                          {Object.keys(
                            filteredGroupedVaults[assetName]
                              .filter(vault => CHAIN_ID_TO_NAME[vault.chainId] === chainName)
                              .reduce((acc: Record<string, Vault[]>, vault) => {
                                const version = getApiVersion(vault.apiVersion);
                                if (!acc[version]) acc[version] = [];
                                acc[version].push(vault);
                                return acc;
                              }, {}),
                          )
                            .sort(version => (version === 'v3' ? -1 : 1))
                            .map(version => {
                              const isVersionOpen =
                                openGroups[assetName]?.chains?.[chainName]?.versions?.[version] || false;
                              return (
                                <div key={version}>
                                  <ToggleButton
                                    isOpen={isVersionOpen}
                                    onClick={() => toggleVersionGroup(assetName, chainName, version)}
                                    label={version}
                                    className={` ${isVersionOpen ? 'font-bold' : ''}`}
                                  />
                                  {isVersionOpen && (
                                    <div className="pl-4">
                                      {filteredGroupedVaults[assetName]
                                        .filter(
                                          vault =>
                                            CHAIN_ID_TO_NAME[vault.chainId] === chainName &&
                                            getApiVersion(vault.apiVersion) === version,
                                        )
                                        .map(vault => (
                                          <button
                                            key={vault.address}
                                            className={`p-2.5 w-full text-left cursor-pointer hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white`}
                                            onClick={() => handleVaultClickWithActive(vault)}
                                          >
                                            <div>{vault.name}</div>
                                            <div>{`TVL: ${formatCurrency(vault.tvl.close)}`}</div>
                                            <div title={vault.address}>
                                              {`${vault.address.slice(0, 8)}...${vault.address.slice(-8)}`}
                                            </div>
                                          </button>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);
}
export default Sidebar;
