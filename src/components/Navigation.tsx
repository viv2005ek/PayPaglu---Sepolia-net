import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Send, Download, Vault, History } from 'lucide-react';


const Navigation: React.FC = () => {
  return (
    <nav className="bg-transparent shadow-sm border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40 md:relative md:border-t-0 md:border-r md:w-64 md:h-full">
      <div className="flex md:flex-col md:py-6">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex-1 flex items-center justify-center md:justify-start space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'text-white bg-gradient-to-br from-blue-600 to-purple-600 border-b-2 border-purple-600 md:border-b-0 md:border-r-2'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`
          }
        >
          <Home size={20} />
          <span className="hidden md:block">Dashboard</span>
        </NavLink>
        
        <NavLink
          to="/send"
          className={({ isActive }) =>
            `flex-1 flex items-center justify-center md:justify-start space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'text-white bg-gradient-to-br from-blue-600 to-purple-600 border-b-2 border-purple-600 md:border-b-0 md:border-r-2'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`
          }
        >
          <Send size={20} />
          <span className="hidden md:block">Send Money</span>
        </NavLink>
        
        <NavLink
          to="/receive"
          className={({ isActive }) =>
            `flex-1 flex items-center justify-center md:justify-start space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'text-white bg-gradient-to-br from-blue-600 to-purple-600 border-b-2 border-purple-600 md:border-b-0 md:border-r-2'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`
          }
        >
          <Download size={20} />
          <span className="hidden md:block">Receive Money</span>
        </NavLink>
        
        <NavLink
          to="/vault"
          className={({ isActive }) =>
            `flex-1 flex items-center justify-center md:justify-start space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'text-white bg-gradient-to-br from-blue-600 to-purple-600 border-b-2 border-purple-600 md:border-b-0 md:border-r-2'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`
          }
        >
          <Vault size={20} />
          <span className="hidden md:block">Family Vault</span>
        </NavLink>
        
        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex-1 flex items-center justify-center md:justify-start space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'text-white bg-gradient-to-br from-blue-600 to-purple-600 border-b-2 border-purple-600 md:border-b-0 md:border-r-2'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`
          }
        >
          <History size={20} />
          <span className="hidden md:block">History</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;