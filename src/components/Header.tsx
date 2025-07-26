import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Wallet, LogOut } from 'lucide-react';
import { useState } from 'react'; 

const Header: React.FC = () => {
  const { account, isConnected, connectWallet, disconnect, isLoading } = useWeb3();
const [copied, setCopied] = useState(false);
const handleCopy = () => {
  if (account) {
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
};
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <div className="flex items-center">
        {/* Added logo container with proper sizing and spacing */}
        <div className="flex items-center space-x-3">
          <img 
            src="/PayPaglu.png" 
            alt="PayPaglu Logo"
            className="h-8 w-8 object-contain"  // Adjust size as needed
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PayPaglu
          </h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {isConnected ? (
          <div className="flex items-center space-x-3">
         <div
  onClick={handleCopy}
  className="bg-gray-100 px-3 py-2 rounded-lg border-2 border-gray-400 cursor-pointer hover:border-gray-900 transition-colors duration-300"
>
  <span className="text-sm font-medium text-gray-800">
    {copied ? 'Copied!' : formatAddress(account!)}
  </span>
</div>


           <button
  onClick={disconnect}
  className="flex items-center space-x-2 text-red-500 border-2 border-red-500 hover:bg-red-500 hover:text-white hover:border-transparent hover:shadow-md px-4 py-2 rounded-lg transition-all duration-300"
>
  <LogOut size={16} />
  <span>Disconnect</span>
</button>

          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            <Wallet size={16} />
            <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        )}
      </div>
    </div>
  </div>
</header>
  );
};

export default Header;