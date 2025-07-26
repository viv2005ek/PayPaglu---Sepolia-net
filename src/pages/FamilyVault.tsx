import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { Vault, Plus, Minus, UserPlus, Users, Crown, UserCheck } from 'lucide-react';
import Background from './Background';

interface VaultInfo {
  creator: string;
  members: string[];
  isCreator: boolean;
}

const useVaultBalance = (contract: ethers.Contract | null, vaultCreator: string | null, account: string | null) => {
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const fetchBalance = useCallback(async () => {
    if (!contract || !vaultCreator || !account) return;
    try {
      setIsLoading(true);
      // Force fresh data from blockchain (bypass cache)
      const balanceWei = await contract.getVaultBalance(vaultCreator, { blockTag: 'latest' });
      setBalance(ethers.formatEther(balanceWei));
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contract, vaultCreator, account]);

  useEffect(() => {
    fetchBalance();
    
    // Listen for balance changes
    const listener = () => {
      fetchBalance();
    };

    if (contract && vaultCreator) {
      // Listen for deposit events
      contract.on('VaultDeposit', (creator, member, amount) => {
        if (creator === vaultCreator) listener();
      });
      
      // Listen for withdraw events
      contract.on('VaultWithdraw', (creator, member, amount) => {
        if (creator === vaultCreator) listener();
      });
    }

    const interval = setInterval(fetchBalance, 10000);
    return () => {
      clearInterval(interval);
      contract?.removeAllListeners('VaultDeposit');
      contract?.removeAllListeners('VaultWithdraw');
    };
  }, [fetchBalance, contract, vaultCreator]);

  return { balance, isLoading, refresh: fetchBalance, lastUpdated };
};

const FamilyVault: React.FC = () => {
  const { contract, account, provider } = useWeb3();
  const [vaults, setVaults] = useState<VaultInfo[]>([]);
  const [selectedVault, setSelectedVault] = useState<VaultInfo | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  const { balance: vaultBalance, isLoading: balanceLoading, refresh: refreshBalance } = 
    useVaultBalance(contract, selectedVault?.creator || null, account);

  // Add this function to completely reset the component state
  const hardRefresh = useCallback(() => {
    setVaults([]);
    setSelectedVault(null);
    setForceUpdate(prev => !prev);
  }, []);

  const fetchAllVaults = useCallback(async () => {
    if (!contract || !account) return;

    try {
      setIsLoading(true);
      const allVaults: VaultInfo[] = [];
      const memberVaultCreators = await contract.getVaultsForMember(account);

      await Promise.all(memberVaultCreators.map(async (creator) => {
        try {
          const members = await contract.getVaultMembers(creator);
          allVaults.push({
            creator,
            members,
            isCreator: creator.toLowerCase() === account.toLowerCase(),
          });
        } catch (error) {
          console.error(`Error fetching vault ${creator}:`, error);
        }
      }));

      setVaults(allVaults);
      if (allVaults.length > 0 && !selectedVault) {
        setSelectedVault(allVaults[0]);
      }
    } catch (error) {
      console.error('Error fetching vaults:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contract, account, selectedVault, forceUpdate]); // Add forceUpdate to dependencies

  useEffect(() => {
    if (contract && account) {
      fetchAllVaults();
    }
  }, [contract, account, fetchAllVaults]);

  // Add this effect to listen for account changes
useEffect(() => {
  if (!window.ethereum) return;

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      hardRefresh();
    } else if (accounts[0] !== account) {
      hardRefresh();
    }
  };

  window.ethereum.on('accountsChanged', handleAccountsChanged);
  
  return () => {
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  };
}, [account, hardRefresh]);
  const createVault = async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      const tx = await contract.createVault();
      await tx.wait();
      hardRefresh(); // Use hard refresh instead
      setShowCreateForm(false);
      alert('Vault created successfully!');
    } catch (error) {
      console.error('Create vault error:', error);
      alert('Failed to create vault');
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !newMemberAddress || !selectedVault) return;

    try {
      setIsLoading(true);
      const tx = await contract.addToVault(selectedVault.creator, newMemberAddress);
      await tx.wait();
      hardRefresh(); // Use hard refresh instead
      setNewMemberAddress('');
      alert('Member added successfully!');
    } catch (error: any) {
      console.error('Add member error:', error);
      alert(`Failed to add member: ${error.reason || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const depositToVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !depositAmount || !selectedVault || !account) return;

    try {
      setIsLoading(true);
      const amountWei = ethers.parseEther(depositAmount);
      const tx = await contract.depositToVault(selectedVault.creator, { 
        value: amountWei 
      });
      await tx.wait();
      setDepositAmount('');
      hardRefresh(); // Use hard refresh instead
      alert('Deposit successful!');
    } catch (error: any) {
      console.error('Deposit error:', error);
      alert(`Deposit failed: ${error.reason || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawFromVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !withdrawAmount || !selectedVault || !account) return;

    try {
      setIsLoading(true);
      const amountWei = ethers.parseEther(withdrawAmount);
      const tx = await contract.withdrawFromVault(selectedVault.creator, amountWei);
      await tx.wait();
      setWithdrawAmount('');
      hardRefresh(); // Use hard refresh instead
      alert('Withdrawal successful!');
    } catch (error: any) {
      console.error('Withdraw error:', error);
      alert(`Withdrawal failed: ${error.reason || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && vaults.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading vaults...</p>
      </div>
    );
  }

  return ( <div className=''><Background />
    <div className="max-w-4xl mx-auto space-y-6 backdrop-blur-sm rounded-xl shadow-xl border bg-transparent border-white/20 p-6" key={`${account}-${forceUpdate}`}>
     
      <div className="flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold text-gray-800">Family Vaults</h1>
        <div className="flex space-x-2">
          <button
            onClick={hardRefresh}
            disabled={isLoading}
            className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
          >
            Force Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Plus size={20} />
            <span>Create New Vault</span>
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-md bg-transparent rounded-xl shadow-xl border border-white/20 p-6">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New Family Vault</h2>
            <div className="flex space-x-3">
              <button
                onClick={createVault}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Vault'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {vaults.length === 0 ? (
        <div className=" rounded-xl shadow-sm border border-gray-200 p-8 text-center backdrop-blur-md bg-transparent border-white/20 ">
          <Vault className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-xl font-semibold mb-2">No Family Vaults</h2>
          <p className="text-gray-600 mb-6">
            You're not a member of any vaults yet. Create one or ask to be added.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-transparent rounded-xl shadow-sm border border-gray-200 p-4 backdrop-blur-md border-white/20 ">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center space-x-2">
                  <Users size={20} />
                  <span>My Vaults</span>
                </h3>
                <button 
                  onClick={fetchAllVaults}
                  disabled={isLoading}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  Refresh
                </button>
              </div>
              <div className="space-y-2">
                {vaults.map((vault) => (
                  <button
                    key={vault.creator}
                    onClick={() => setSelectedVault(vault)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedVault?.creator === vault.creator
                        ? 'bg-purple-100 border-purple-200 border'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {vault.creator.slice(0, 8)}...{vault.creator.slice(-6)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {vault.isCreator ? 'Your Vault' : 'Family Vault'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {vault.isCreator ? (
                          <Crown size={16} className="text-yellow-500" />
                        ) : (
                          <UserCheck size={16} className="text-green-500" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedVault && (
            <div className="lg:col-span-2 space-y-6 backdrop-blur-sm bg-transparent rounded-xl shadow-xl border border-white/20">
              <div className=" rounded-xl shadow-sm border border-gray-200 p-6 backdrop-blur-md bg-transparent border-white/20 ">
                <div className="flex items-center space-x-3 mb-6">
                  <Vault className="text-purple-500" size={24} />
                  <h2 className="text-xl font-semibold">
                    {selectedVault.isCreator ? 'My Vault' : 'Family Vault'}
                  </h2>
                  {selectedVault.isCreator && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      Creator
                    </span>
                  )}
                </div>

                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-purple-800 text-sm">Vault Balance</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {balanceLoading ? (
                          <span className="inline-flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                          </span>
                        ) : (
                          `${parseFloat(vaultBalance).toFixed(4)} ETH`
                        )}
                      </p>
                    </div>
                    <button 
                      onClick={refreshBalance}
                      disabled={balanceLoading}
                      className="text-xs bg-white hover:bg-gray-50 px-2 py-1 rounded border border-purple-200 flex items-center"
                    >
                      {balanceLoading ? (
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form onSubmit={depositToVault} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Deposit ETH
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.0000"
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !depositAmount || parseFloat(depositAmount) <= 0}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </form>

                  <form onSubmit={withdrawFromVault} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Withdraw ETH
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        max={parseFloat(vaultBalance)}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.0000"
                        disabled={isLoading || balanceLoading}
                      />
                      <button
                        type="submit"
                        disabled={
                          isLoading || 
                          balanceLoading ||
                          !withdrawAmount || 
                          parseFloat(withdrawAmount) <= 0 || 
                          parseFloat(withdrawAmount) > parseFloat(vaultBalance)
                        }
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Minus size={20} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className=" rounded-xl shadow-sm border border-gray-200 p-6 backdrop-blur-md bg-transparent  border-white/20 ">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="text-blue-500" size={24} />
                  <h3 className="text-lg font-semibold">Vault Members</h3>
                </div>

                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {selectedVault.members.map((member, index) => (
                    <div key={`${member}-${index}`} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-medium">
                        {member === account ? 'You' : `${member.slice(0, 6)}...${member.slice(-4)}`}
                      </span>
                      {index === 0 && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          Creator
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {selectedVault.isCreator && (
                  <form onSubmit={addMember} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Add New Member
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMemberAddress}
                        onChange={(e) => setNewMemberAddress(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0x..."
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !newMemberAddress || !ethers.isAddress(newMemberAddress)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <UserPlus size={20} />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
};

export default FamilyVault;