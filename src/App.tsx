import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import Header from './components/Header';
import Navigation from './components/Navigation';
import RegistrationModal from './components/RegistrationModal';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import ReceiveMoney from './pages/ReceiveMoney';
import FamilyVault from './pages/FamilyVault';
import TransactionHistory from './pages/TransactionHistory';
import Background from './pages/Background';

const AppContent: React.FC = () => {
  const { isConnected, user } = useWeb3();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);

  useEffect(() => {
    setHasMetaMask(typeof window.ethereum !== 'undefined');
  }, []);

  useEffect(() => {
    if (isConnected && (!user || !user.exists)) {
      setShowRegistrationModal(true);
    } else {
      setShowRegistrationModal(false);
    }
  }, [isConnected, user]);

  const handleCloseRegistration = () => {
    if (user && user.exists) {
      setShowRegistrationModal(false);
    }
  };
const handleMorphClick = () => {
  window.location.href = "https://pay-paglu.vercel.app/";
};


  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download.html', '_blank');
  };

  if (!isConnected) {
    return (
   <div className="relative z-10">
  <Header />
  <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
    {/* Container with connected panels */}
    <div className="flex flex-col md:flex-row items-center w-full max-w-5xl rounded-xl overflow-hidden shadow-lg">
      {/* Left side with logo */}
      <div className="w-full md:w-2/5 bg-transparent backdrop-blur-sm border-r border-gray-200/50 p-8 flex justify-center items-center group relative">
        {/* Floating animation elements using Tailwind */}
        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-blue-400/10 blur-md animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-purple-400/10 blur-md animate-[float_7s_ease-in-out_infinite]" />
        
        <img 
          src="/PayPagluApp.png" 
          alt="PayPaglu Logo"
          className="w-56 h-56 object-contain drop-shadow-lg transition-transform duration-700 scale-110 group-hover:scale-125" 
        />
      </div>
      
      {/* Right side with content */}
      <div className="w-full md:w-3/5 bg-transparent backdrop-blur-sm p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-[fadeIn_0.6s_ease-out]">
          Welcome to <span className="text-orange-500">PayPaglu</span>
        </h2>
        
        <div className="flex justify-center mb-6 animate-[fadeIn_0.6s_ease-out_100ms]">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-300/50 transition-all hover:scale-105">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse mr-3" />
            <span className="text-sm font-medium text-gray-700">
              Use Sapolia Testnet to connect
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6 font-medium text-center animate-[fadeIn_0.6s_ease-out_200ms]">
          Connect your wallet to start sending and receiving money with ease.
        </p>
        
        {!hasMetaMask && (
          <button
            onClick={handleInstallMetaMask}
            className="text-orange-600 border-2 border-orange-600 font-medium text-sm py-2 px-4 rounded-lg hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:border-transparent shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-[fadeIn_0.6s_ease-out_300ms] mx-auto block mb-4"
          >
            Install MetaMask
          </button>
        )}
        
        <div className="space-y-4 animate-[fadeIn_0.6s_ease-out_400ms]">
          {[
            { color: 'bg-blue-500', text: 'Send money via username or phone or address' },
            { color: 'bg-purple-500', text: 'Create family vaults for shared funds' },
            { color: 'bg-green-500', text: 'Track all your transactions' },
            { color: 'bg-yellow-500', text: 'Use QR codes to receive money instantly' },
            { color: 'bg-red-500', text: 'Low transaction fees with Sepolia network' },
            { color: 'bg-indigo-500', text: 'Secure end-to-end encrypted transfers' },
            { color: 'bg-pink-500', text: 'Multi-chain support coming soon' }
          ].map((item, index) => (
            <div 
              key={index}
              className="flex items-center space-x-3 text-left transition-all hover:translate-x-1"
            >
              <div className={`w-2.5 h-2.5 ${item.color} rounded-full flex-shrink-0`} />
              <span className="text-sm text-gray-700">{item.text}</span>
            </div>
          ))}
        </div>
      <div className="pt-4 text-sm text-center text-gray-700">
  Want to use on Morph Holesky?{' '}
  <button
    onClick={handleMorphClick}
    className="text-blue-600 underline hover:text-blue-800 transition-colors"
  >
    Click here
  </button>
</div>
      </div>
    </div>
  </div>
</div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen">
  {/* Fixed Header */}
  <header className="fixed top-0 left-0 right-0 z-20">
    <Header />
  </header>

  <div className="flex pt-16"> {/* Add padding-top equal to header height */}
    {/* Fixed Sidebar */}
    <aside className="fixed top-16 bottom-0 z-10 w-64 hidden md:block">
      <Navigation />
    </aside>

    {/* Scrollable Main Content */}
    <main className="flex-1 ml-0 md:ml-64 p-4 md:p-6 pb-20 md:pb-6 mt-0">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/send" element={<SendMoney />} />
          <Route path="/receive" element={<ReceiveMoney />} />
          <Route path="/vault" element={<FamilyVault />} />
          <Route path="/history" element={<TransactionHistory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </main>
  </div>
  
  <RegistrationModal
    isOpen={showRegistrationModal}
    onClose={handleCloseRegistration}
  />
</div>
  );
};

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen">
          <Background />
          <AppContent />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
