import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { Wallet, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Background from './Background';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Copy } from 'lucide-react';


const Dashboard: React.FC = () => {
  const { account, provider, user } = useWeb3();
  const [balance, setBalance] = useState('0');
const navigate = useNavigate();

  useEffect(() => {
    const fetchBalance = async () => {
      if (provider && account) {
        try {
          const balance = await provider.getBalance(account);
          setBalance(ethers.formatEther(balance));
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };

    fetchBalance();
  }, [provider, account]);

  return (
    <div className="space-y-6">
      <Background />
      
      {/* Header */}
      {/* Hero Card */}
<div className="backdrop-blur-md bg-white/40 rounded-xl p-6 border border-gray-200/50 shadow-sm hover:bg-white/60 hover:border-blue-300/60 hover:shadow-lg transition-all duration-300">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
    {/* User Details Section */}
    <div className="flex-1">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
          {user && (
            <div className="flex items-center mt-1 group">
              <p className="text-blue-600 font-medium">@{user.username}</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(user.username);
                  toast.success('Username copied!');
                }}
                className="ml-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Copy username"
              >
                <Copy size={16} />
              </button>
            </div>
          )}
        </div>
       
      </div>

      {user && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 group">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-600">Phone Number</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(user.phoneNumber);
                  toast.success('Phone number copied!');
                }}
                className="text-blue-300 hover:text-blue-500 transition-colors"
                title="Copy phone number"
              >
                <Copy size={14} />
              </button>
            </div>
            <p className="font-medium text-gray-800 mt-1">{user.phoneNumber}</p>
          </div>
          
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 group">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-600">Wallet Address</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(user.walletAddress);
                  toast.success('Address copied!');
                }}
                className="text-blue-300 hover:text-blue-500 transition-colors"
                title="Copy address"
              >
                <Copy size={14} />
              </button>
            </div>
            <p className="font-mono text-sm text-gray-700 mt-1">
              {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
            </p>
          </div>
        </div>
      )}
    </div>

    {/* Wallet Balance Section */}
    <div className="backdrop-blur-lg bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-lg p-4 border border-blue-300/30 min-w-[240px]">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-blue-700 text-sm font-medium">Wallet Balance</p>
          <p className="text-2xl font-bold text-gray-800">{parseFloat(balance).toFixed(4)} ETH</p>
        </div>
         <Wallet size={32} className="text-blue-500" />
      </div>
    </div>
  </div>
</div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Send Money Card */}
        <div className="backdrop-blur-md bg-white/40 rounded-xl p-6 border border-gray-200/50 shadow-sm hover:bg-green-50/60 hover:border-green-300/60 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100/60 rounded-lg group-hover:bg-green-200/70 transition-colors duration-300">
              <ArrowUpRight className="text-green-600 group-hover:text-green-700" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Quick Send</h3>
          </div>
          <p className="text-gray-600 mb-4">Send money to friends and family instantly</p>
          <button
            onClick={() => navigate('/send')}
          className="w-full text-green-600 border-2 border-green-600 hover:bg-green-600 hover:text-white hover:border-transparent hover:shadow-lg py-2.5 rounded-lg transition-all duration-300"


          >
            Send Money
          </button>
        </div>

        {/* Receive Money Card */}
        <div className="backdrop-blur-md bg-white/40 rounded-xl p-6 border border-gray-200/50 shadow-sm hover:bg-blue-50/60 hover:border-blue-300/60 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100/60 rounded-lg group-hover:bg-blue-200/70 transition-colors duration-300">
              <ArrowDownRight className="text-blue-600 group-hover:text-blue-700" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Receive Funds</h3>
          </div>
          <p className="text-gray-600 mb-4">Share your details or QR code to receive payments</p>
          <button
            onClick={() => navigate('/receive')}
            className="w-full text-blue-600 border-2 border-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-transparent hover:shadow-md py-2.5 rounded-lg transition-all duration-300"

          >
            Receive Money
          </button>
        </div>

        {/* Family Vault Card */}
        <div className="backdrop-blur-md bg-white/40 rounded-xl p-6 border border-gray-200/50 shadow-sm hover:bg-purple-50/60 hover:border-purple-300/60 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100/60 rounded-lg group-hover:bg-purple-200/70 transition-colors duration-300">
              <Users className="text-purple-600 group-hover:text-purple-700" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Family Vault</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage shared family funds securely</p>
          <button
            onClick={() => navigate('/vault')}
            className="w-full text-purple-600 border-2 border-purple-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-700 hover:text-white hover:border-transparent hover:shadow-md py-2.5 rounded-lg transition-all duration-300"

          >
            Manage Vault
          </button>
        </div>

        {/* Transaction History Card */}
        <div className="backdrop-blur-md bg-white/40 rounded-xl p-6 border border-gray-200/50 shadow-sm hover:bg-orange-50/60 hover:border-orange-300/60 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100/60 rounded-lg group-hover:bg-orange-200/70 transition-colors duration-300">
              <div className="w-4 h-4 bg-orange-500 group-hover:bg-orange-600 rounded transition-colors duration-300"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
          </div>
          <p className="text-gray-600 mb-4">View all your transaction records</p>
          <button
            onClick={() => navigate('/history')}
          className="w-full text-orange-600 border-2 border-orange-600 hover:bg-gradient-to-r hover:from-orange-600 hover:to-orange-700 hover:text-white hover:border-transparent hover:shadow-md py-2.5 rounded-lg transition-all duration-300"

          >
            View History
          </button>
        </div>
      </div>

      {/* User Details Card */}
      {user && (
        <div className="backdrop-blur-md bg-white/40 rounded-xl p-6 border border-gray-200/50 shadow-sm hover:bg-white/60 hover:border-cyan-300/60 hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Your Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium text-gray-800">@{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium text-gray-800">{user.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Wallet Address</p>
              <p className="font-medium text-sm text-gray-700">
                {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;