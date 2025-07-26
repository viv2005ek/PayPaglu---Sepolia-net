import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { Transaction } from '../types';
import { History, ArrowUpRight, ArrowDownRight, Vault, Copy, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Background from './Background';

const TransactionHistory: React.FC = () => {
  const { contract, account } = useWeb3();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received' | 'vault'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [contract, account]);

  useEffect(() => {
    filterAndSortTransactions();
  }, [transactions, filter, sortBy, sortOrder]);

const isDuplicateVaultTx = (tx: Transaction, index: number, allTx: Transaction[]) => {
  // Only check for vault transactions where sender === receiver
  if (tx.method.includes('vault') && tx.sender.toLowerCase() === tx.receiver.toLowerCase()) {
    // Check if we've already seen this exact transaction
    const isDuplicate = allTx.some((otherTx, otherIndex) => {
      return (
        otherIndex < index &&
        otherTx.sender.toLowerCase() === tx.sender.toLowerCase() &&
        otherTx.receiver.toLowerCase() === tx.receiver.toLowerCase() &&
        otherTx.amount === tx.amount &&
        otherTx.timestamp.getTime() === tx.timestamp.getTime() &&
        otherTx.method === tx.method
      );
    });
    
    if (isDuplicate) {
      console.log("Found duplicate vault transaction:", tx);
      return true;
    }
  }
  return false;
};
const normalizeTxForComparison = (tx: Transaction) => {
  return {
    sender: tx.sender.toLowerCase(),
    receiver: tx.receiver.toLowerCase(),
    amount: tx.amount,
    timestamp: tx.timestamp.getTime(),
    method: tx.method
  };
};

const fetchTransactions = async () => {
  if (!contract || !account) return;

  try {
    setIsLoading(true);
    const txData = await contract.getTransactions(account);
    
    console.log("Raw transaction data from contract:", txData);
    
    const formattedTx = txData.map((tx: any) => ({
      sender: tx.sender,
      receiver: tx.receiver,
      amount: ethers.formatEther(tx.amount),
      gasUsed: ethers.formatEther(tx.gasUsed),
      timestamp: new Date(Number(tx.timestamp) * 1000),
      method: tx.method,
    }));

    console.log("Formatted transactions:", formattedTx);
    setTransactions(formattedTx);
  } catch (error) {
    console.error('Error fetching transactions:', error);
  } finally {
    setIsLoading(false);
  }
};
 const filterAndSortTransactions = () => {
  let result = [...transactions];
  
  // First remove exact duplicates
  const uniqueTxs: Transaction[] = [];
  const seenTxs = new Set<string>();
  
  result.forEach(tx => {
    const normalized = normalizeTxForComparison(tx);
    const txKey = JSON.stringify(normalized);
    
    if (!seenTxs.has(txKey)) {
      seenTxs.add(txKey);
      uniqueTxs.push(tx);
    } else {
      console.log("Removing duplicate transaction:", tx);
    }
  });

  result = uniqueTxs;

  // Apply filters
  if (filter === 'sent') {
    result = result.filter(tx => 
      tx.sender.toLowerCase() === account?.toLowerCase() && tx.method === 'send'
    );
  } else if (filter === 'received') {
    result = result.filter(tx => 
      tx.receiver.toLowerCase() === account?.toLowerCase() && tx.method === 'send'
    );
  } else if (filter === 'vault') {
    result = result.filter(tx => 
      tx.method === 'vault_deposit' || tx.method === 'vault_withdraw'
    );
  }

  // Apply sorting
  result.sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? b.timestamp.getTime() - a.timestamp.getTime()
        : a.timestamp.getTime() - b.timestamp.getTime();
    } else {
      return sortOrder === 'desc'
        ? parseFloat(b.amount) - parseFloat(a.amount)
        : parseFloat(a.amount) - parseFloat(b.amount);
    }
  });

  console.log("Final filtered transactions:", result);
  setFilteredTransactions(result);
};

  const getTransactionType = (tx: Transaction) => {
    const isSender = tx.sender.toLowerCase() === account?.toLowerCase();
    const isReceiver = tx.receiver.toLowerCase() === account?.toLowerCase();
    
    switch (tx.method) {
      case 'vault_deposit':
        return isSender && isReceiver ? 'Vault Self-Deposit' : 
               isSender ? 'Vault Deposit' : 'Vault Contribution';
      case 'vault_withdraw':
        return isSender && isReceiver ? 'Vault Self-Withdrawal' : 
               isSender ? 'Vault Withdrawal' : 'Vault Distribution';
      case 'send':
        return isSender ? 'Sent' : 'Received';
      default:
        return 'Transaction';
    }
  };

  const getTransactionColor = (tx: Transaction) => {
    const isSender = tx.sender.toLowerCase() === account?.toLowerCase();
    const isReceiver = tx.receiver.toLowerCase() === account?.toLowerCase();
    
    if (tx.method === 'vault_deposit') {
      if (isSender && isReceiver) return 'gray';
      if (isSender) return 'red';
      return 'green';
    }
    
    if (tx.method === 'vault_withdraw') {
      if (isSender && isReceiver) return 'gray';
      if (isSender) return 'red';
      return 'green';
    }

    return isSender ? 'red' : 'green';
  };

  const getTransactionIcon = (tx: Transaction) => {
    const color = getTransactionColor(tx);
    const iconColor = {
      red: 'text-red-500',
      green: 'text-green-500',
      gray: 'text-gray-500'
    };
    
    if (tx.method.includes('vault')) {
      return <Vault className={iconColor[color]} size={20} />;
    }
    
    return color === 'red' ? 
      <ArrowUpRight className="text-red-500" size={20} /> :
      <ArrowDownRight className="text-green-500" size={20} />;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-6 w-6 bg-gray-200 rounded-full mb-2"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex" style={{ minHeight: '50vh' }}>
      <Background />
      {/* Vertical Sidebar */}
      <div className="hidden md:block w-64 border-r border-gray-200 p-6 z-10 bg-transparent">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <History className="text-indigo-500 mr-2" size={20} />
            Transaction History
          </h3>
          <ul className="space-y-2">
            <li 
              className={`px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                filter === 'all' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100'
              }`}
              onClick={() => setFilter('all')}
            >
              All Transactions
            </li>
            <li 
              className={`px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                filter === 'sent' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100'
              }`}
              onClick={() => setFilter('sent')}
            >
              Sent Payments
            </li>
            <li 
              className={`px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                filter === 'received' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100'
              }`}
              onClick={() => setFilter('received')}
            >
              Received Payments
            </li>
            <li 
              className={`px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                filter === 'vault' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100'
              }`}
              onClick={() => setFilter('vault')}
            >
              Vault Transactions
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto z-10 bg-transparent" style={{ maxHeight: '70vh' }}>
        <div className="max-w-3xl mx-auto">
          <div className="bg-transparent rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-6 md:hidden">
              <div className="flex items-center space-x-3">
                <History className="text-indigo-500" size={24} />
                <h2 className="text-xl font-semibold">Transaction History</h2>
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>
            </div>

            {/* Enhanced Filter Dropdown */}
            {showFilters && (
              <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">Filter by</label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as any)}
                      className="w-full border border-indigo-200 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    >
                      <option value="all">All Transactions</option>
                      <option value="sent">Sent</option>
                      <option value="received">Received</option>
                      <option value="vault">Vault</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">Sort by</label>
                    <div className="flex">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full border border-indigo-200 bg-white rounded-l-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      >
                        <option value="date">Date</option>
                        <option value="amount">Amount</option>
                      </select>
                      <button
                        onClick={toggleSortOrder}
                        className="bg-indigo-100 text-indigo-700 px-2 rounded-r-lg border-t border-r border-b border-indigo-200 flex items-center justify-center hover:bg-indigo-200 transition-colors"
                      >
                        {sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction List */}
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 bg-transparent rounded-full flex items-center justify-center mb-3 z-10">
                  <History className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-600">No transactions found</p>
                <p className="text-sm text-gray-500 mt-1">Try changing your filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((tx, index) => {
  const normalized = normalizeTxForComparison(tx);
  const txKey = JSON.stringify(normalized);
  console.log(`Rendering tx ${index}:`, txKey, tx);
  
  const color = getTransactionColor(tx);
  const colorClasses = {
    red: 'text-red-500',
    green: 'text-green-500',
    gray: 'text-gray-500'
  };
                  const transactionType = getTransactionType(tx);
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          {getTransactionIcon(tx)}
                          <div>
                            <p className="font-medium text-base">{transactionType}</p>
                            <p className="text-sm text-gray-500">{formatDate(tx.timestamp)}</p>
                          </div>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <p className={`font-medium text-base ${colorClasses[color]}`}>
                            {(color === 'red' ? '-' : '+')}{parseFloat(tx.amount).toFixed(4)} ETH
                          </p>
                          {color === 'red' && (
                            <p className="text-xs text-red-400">
                              -{parseFloat(tx.gasUsed).toFixed(6)} ETH gas
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="border-t pt-3 mt-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-gray-500 text-sm">From:</p>
                              <button 
                                onClick={() => copyToClipboard(tx.sender)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy address"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                            <p className="font-mono text-sm font-medium">
                              {truncateAddress(tx.sender)}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-gray-500 text-sm">To:</p>
                              <button 
                                onClick={() => copyToClipboard(tx.receiver)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy address"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                            <p className="font-mono text-sm font-medium">
                              {truncateAddress(tx.receiver)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;