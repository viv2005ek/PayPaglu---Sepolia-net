import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useSearchParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { Send, User, Wallet } from 'lucide-react';
import Background from './Background';

const SendMoney: React.FC = () => {
  const { contract, provider } = useWeb3();
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gasEstimate, setGasEstimate] = useState('0');
  const [identifierType, setIdentifierType] = useState<'username' | 'phone' | 'address'>('username');

  useEffect(() => {
    // Handle QR code scanning redirect (send/{username})
    const username = searchParams.get('username');
    if (username) {
      setIdentifier(username);
      setIdentifierType('username');
    }
  }, [searchParams]);

  useEffect(() => {
    const estimateGas = async () => {
      if (contract && amount && (identifier || address)) {
        try {
          const amountWei = ethers.parseEther(amount);
          const gasEstimate = await contract.sendFunds.estimateGas(
            identifier,
            address || ethers.ZeroAddress,
            amountWei,
            0,
            { value: amountWei }
          );
          
          if (provider) {
            const gasPrice = await provider.getFeeData();
            const totalGas = gasEstimate * (gasPrice.gasPrice || 0n);
            setGasEstimate(ethers.formatEther(totalGas));
          }
        } catch (error) {
          console.error('Gas estimation error:', error);
          setGasEstimate('0');
        }
      }
    };

    estimateGas();
  }, [contract, provider, identifier, address, amount]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract || !amount) return;
    
    try {
      setIsLoading(true);
      const amountWei = ethers.parseEther(amount);
      const gasUsed = ethers.parseUnits(gasEstimate, 'ether');
      
      const tx = await contract.sendFunds(
        identifier,
        address || ethers.ZeroAddress,
        amountWei,
        gasUsed,
        { value: amountWei }
      );
      
      await tx.wait();
      
      alert('Transaction successful!');
      setIdentifier('');
      setAddress('');
      setAmount('');
    } catch (error) {
      console.error('Send error:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const detectIdentifierType = (value: string) => {
    if (value.startsWith('0x') && value.length === 42) {
      setIdentifierType('address');
      setAddress(value);
      setIdentifier('');
    } else if (value.includes('@') || value.length >= 10) {
      setIdentifierType('phone');
    } else {
      setIdentifierType('username');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Background />
      <div className="backdrop-blur-md bg-white/30 rounded-xl shadow-xl border border-white/20 p-6 border-t-4 border-green-500">

        <div className="flex items-center space-x-3 mb-6">
          <Send className="text-green-500" size={24} />
          <h2 className="text-xl font-semibold">Send Money</h2>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send To
            </label>
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={identifierType === 'address' ? '' : identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    detectIdentifierType(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Username or Phone Number"
                  disabled={identifierType === 'address'}
                />
              </div>
              
              <div className="text-center text-gray-500 text-sm">OR</div>
              
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={identifierType === 'address' ? identifier : address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (e.target.value.startsWith('0x')) {
                      setIdentifierType('address');
                      setIdentifier(e.target.value);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Wallet Address (0x...)"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (ETH)
            </label>
            <input
              type="number"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.0000"
              required
            />
          </div>

          {gasEstimate !== '0' && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                Estimated Gas Fee: <span className="font-medium">{parseFloat(gasEstimate).toFixed(6)} ETH</span>
              </p>
              <p className="text-sm text-gray-600">
                Total: <span className="font-medium">{(parseFloat(amount || '0') + parseFloat(gasEstimate)).toFixed(6)} ETH</span>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !amount || (!identifier && !address)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Money'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendMoney;