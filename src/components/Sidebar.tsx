import React, { useState } from 'react';

interface Vault {
    address: string;
    name: string;
    asset: { name: string };
    chainId: number;
    apiVersion: string;
}

interface SidebarProps {
    groupedVaults: { [key: string]: Vault[] };
    handleVaultClick: (vault: Vault) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ groupedVaults, handleVaultClick }) => {
    const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});
    const [activeVault, setActiveVault] = useState<string | null>(null);
  
    const toggleGroup = (assetName: string) => {
      setOpenGroups(prevState => ({
        ...prevState,
        [assetName]: !prevState[assetName],
      }));
    };

    const handleVaultClickWithActive = (vault: Vault) => {
      setActiveVault(vault.address);
      handleVaultClick(vault);
    };
  
    return (
      <div className="w-80 h-screen overflow-y-auto p-2.5"> {/* .sidebar */}
        {Object.keys(groupedVaults).map(assetName => (
          <div key={assetName} className="asset-group">
            <button className="p-2.5 border-none bg-none w-full text-left cursor-pointer hover:bg-blue-700" onClick={() => toggleGroup(assetName)}> {/* .vault-item */}
              {assetName}
              <span className="ml-2">{openGroups[assetName] ? '−' : '+'}</span> {/* Caret for expand/collapse */}
            </button>
            {openGroups[assetName] && (
              <div className="vault-versions pl-4"> {/* Indentation for hierarchy */}
                {groupedVaults[assetName].map(vault => (
                  <button 
                  key={vault.address} 
                  className={`p-2.5 border-none bg-none w-full text-left cursor-pointer hover:bg-blue-700 ${activeVault === vault.address ? 'bg-blue-200' : ''}`}
                  onClick={() => handleVaultClickWithActive(vault)}
                  > 
                    <div>{`${vault.name}`}</div>
                    <div>{`Chain ${vault.chainId} - API Version ${vault.apiVersion}`}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

export default Sidebar;