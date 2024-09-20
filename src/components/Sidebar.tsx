import React, { useState } from 'react';
import { CHAIN_ID_TO_NAME } from '../constants/chains';
import { getApiVersion } from '../helpers/getApiVersion';

// Define the Vault interface to represent the structure of a vault object
interface Vault {
    address: string; // The address of the vault
    name: string; // The name of the vault
    asset: { name: string }; // The asset associated with the vault
    chainId: number; // The chain ID where the vault is located
    apiVersion: string; // The API version of the vault
    tvl: { close: number }; // The total value locked (TVL) in the vault
}

// Define the SidebarProps interface to represent the props passed to the Sidebar component
interface SidebarProps {
    groupedVaults: { [key: string]: Vault[] }; // An object where keys are asset names and values are arrays of Vaults
    handleVaultClick: (vault: Vault) => void; // A function to handle vault click events
}

// Define the Sidebar functional component
const Sidebar: React.FC<SidebarProps> = ({ groupedVaults, handleVaultClick }) => {
    // State to manage which groups are open or closed
    const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});
    // State to manage the currently active vault
    const [activeVault, setActiveVault] = useState<string | null>(null);
    // State to manage the search term input by the user
    const [searchTerm, setSearchTerm] = useState<string>(''); // Added search term state

    // Function to toggle the open/closed state of a group
    const toggleGroup = (assetName: string) => {
      setOpenGroups(prevState => ({
        ...prevState,
        [assetName]: !prevState[assetName],
      }));
    };

    // Function to handle vault click events and set the active vault
    const handleVaultClickWithActive = (vault: Vault) => {
      setActiveVault(vault.address);
      handleVaultClick(vault);
    };

    // Function to format a number as currency
    const formatCurrency = (value: number) => {
      return `$${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`; // Format currency
    };

    // Filter the grouped vaults based on the search term
    const filteredGroupedVaults = Object.keys(groupedVaults).reduce((acc: Record<string, Vault[]>, assetName) => {
      const filteredVaults = groupedVaults[assetName].filter(vault => 
        vault.name.toLowerCase().includes(searchTerm.toLowerCase()) || // Updated filter condition
        vault.address.toLowerCase().includes(searchTerm.toLowerCase()) // Updated filter condition
      );
      if (filteredVaults.length > 0) {
        acc[assetName] = filteredVaults;
      }
      return acc;
    }, {});
  
    return (
      <div className="h-screen overflow-y-auto p-2.5" style={{ width: '34rem' }}> {/* Changed width to 30rem */}
        <input 
          type="text" 
          placeholder="Search vaults..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full p-2.5 mb-4 border border-gray-300 rounded" 
        /> {/* Added search bar */}
        {Object.keys(filteredGroupedVaults).map(assetName => (
          <div key={assetName} className="asset-group">
            <button 
            className={`p-2.5 border-none bg-none w-full text-left cursor-pointer hover:bg-blue-700 bg-darkBackground flex justify-between ${filteredGroupedVaults[assetName].some(vault => vault.address === activeVault) ? 'bg-blue-700' : ''}`} 
            onClick={() => toggleGroup(assetName)}> 
            <span className="flex-grow">{assetName}</span>
            <span className="ml-2">{openGroups[assetName] ? '−' : '+'}</span> 
            </button>
            {openGroups[assetName] && (
              <div className="vault-versions pl-4"> {/* Indentation for hierarchy */}
                {Object.keys(filteredGroupedVaults[assetName].reduce((acc: Record<string, Vault[]>, vault) => {
                  const chainName = CHAIN_ID_TO_NAME[vault.chainId as keyof typeof CHAIN_ID_TO_NAME];
                  if (!acc[chainName]) acc[chainName] = [];
                  acc[chainName].push(vault);
                  return acc;
                }, {})).map(chainName => (
                  <div key={chainName} className="chain-group">
                    <button 
                    className="chain-name font-bold p-2.5 border-none bg-none w-full text-left cursor-pointer hover:bg-blue-700 bg-darkBackground flex justify-between"
                    onClick={() => toggleGroup(chainName)}>
                      <span className="flex-grow">{chainName}</span>
                      <span className="ml-2">{openGroups[chainName] ? '−' : '+'}</span>
                    </button>
                    {openGroups[chainName] && (
                      <div className="pl-4"> {/* Further indentation for sub-items */}
                        {Object.keys(filteredGroupedVaults[assetName].filter(vault => CHAIN_ID_TO_NAME[vault.chainId as keyof typeof CHAIN_ID_TO_NAME] === chainName).reduce((acc: Record<string, Vault[]>, vault) => {
                          const version = getApiVersion(vault.apiVersion);
                          if (version === 'unknown') throw new Error(`Unknown API version for vault ${vault.address}`);
                          if (!acc[version]) acc[version] = [];
                          acc[version].push(vault);
                          return acc;
                        }, {})).sort(a => a === 'v3' ? -1 : 1).map(version => ( // Changed line to sort versions
                          <div key={version} className="version-group">
                            <button 
                            className="version-name font-semibold p-2.5 border-none bg-none w-full text-left cursor-pointer hover:bg-blue-700 bg-darkBackground flex justify-between"
                            onClick={() => toggleGroup(version)}>
                              <span className="flex-grow">{version}</span>
                              <span className="ml-2">{openGroups[version] ? '−' : '+'}</span>
                            </button>
                            {openGroups[version] && (
                              <div className="pl-4"> {/* Further indentation for sub-items */}
                                {filteredGroupedVaults[assetName].filter(vault => CHAIN_ID_TO_NAME[vault.chainId as keyof typeof CHAIN_ID_TO_NAME] === chainName && getApiVersion(vault.apiVersion) === version).map(vault => (
                                  <button 
                                  key={vault.address} 
                                  className={`p-2.5 border-none bg-none w-full text-left cursor-pointer hover:bg-blue-700 ${activeVault === vault.address ? 'bg-blue-700' : ' bg-darkBackground'}`}
                                  onClick={() => handleVaultClickWithActive(vault)}
                                  > 
                                    <div>{`${vault.name}`}</div>
                                    <div>{`${CHAIN_ID_TO_NAME[vault.chainId as keyof typeof CHAIN_ID_TO_NAME]} - API Version ${vault.apiVersion}`}</div>
                                    <div>{`TVL: ${formatCurrency(vault.tvl.close)}`}</div> {/* Added formatted TVL display */}
                                    <div>{`${vault.address}`}</div> {/* Added address display */}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
}
export default Sidebar;