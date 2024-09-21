import React, { useState } from 'react';
import { CHAIN_ID_TO_NAME, ChainId } from '../constants/chains';
import { getApiVersion } from '../helpers/getApiVersion';

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
    className={`p-2.5 w-full text-left cursor-pointer hover:bg-blue-700 flex justify-between ${className}`}
    onClick={onClick}
  >
    <span>{label}</span>
    <span>{isOpen ? '−' : '+'}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ groupedVaults, handleVaultClick }) => {
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
    <div className="h-screen overflow-y-auto p-2.5" style={{ width: '34rem' }}>
      <input
        type="text"
        placeholder="Search vaults..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full p-2.5 mb-4 border border-gray-300 rounded"
      />
      {Object.keys(filteredGroupedVaults).map(assetName => {
        const isAssetOpen = openGroups[assetName]?.isOpen || false;
        return (
          <div key={assetName}>
            <ToggleButton
              isOpen={isAssetOpen}
              onClick={() => toggleAssetGroup(assetName)}
              label={assetName}
              className={`bg-darkBackground ${isAssetOpen ? 'bg-blue-700' : ''}`}
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
                        className="bg-darkBackground font-bold"
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
                                    className="bg-darkBackground font-semibold"
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
                                            className={`p-2.5 w-full text-left cursor-pointer hover:bg-blue-700 ${
                                              activeVault === vault.address ? 'bg-blue-700' : 'bg-darkBackground'
                                            }`}
                                            onClick={() => handleVaultClickWithActive(vault)}
                                          >
                                            <div>{vault.name}</div>
                                            <div>{`TVL: ${formatCurrency(vault.tvl.close)}`}</div>
                                            <div>{vault.address}</div>
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
  );
};

export default Sidebar;