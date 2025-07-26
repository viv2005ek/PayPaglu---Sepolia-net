import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { User, Phone } from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const { contract, fetchUser } = useWeb3();
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ username: '', phoneNumber: '' });

  const validateInputs = () => {
    const newErrors = { username: '', phoneNumber: '' };
    
    if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (phoneNumber.length < 5) {
      newErrors.phoneNumber = 'Phone number must be at least 5 characters';
    }
    
    setErrors(newErrors);
    return !newErrors.username && !newErrors.phoneNumber;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs() || !contract) return;
    
    try {
      setIsLoading(true);
      
      // Check availability
      const usernameAvailable = await contract.checkUsernameAvailability(username);
      const phoneAvailable = await contract.checkPhoneAvailability(phoneNumber);
      
      if (!usernameAvailable) {
        setErrors(prev => ({ ...prev, username: 'Username already taken' }));
        return;
      }
      
      if (!phoneAvailable) {
        setErrors(prev => ({ ...prev, phoneNumber: 'Phone number already registered' }));
        return;
      }
      
      const tx = await contract.registerUser(username, phoneNumber);
      await tx.wait();
      
      await fetchUser();
      onClose();
      setUsername('');
      setPhoneNumber('');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Complete Registration</h2>
          
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter username"
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
                disabled={isLoading}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>
       <div className="px-6 pb-6">
  <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg">
    <svg 
      className="animate-spin h-4 w-4 text-gray-700" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span className="text-sm text-gray-600">
      If already registered, please wait while we retrieve your information...
    </span>
  </div>
</div>
      </div>
    </div>
  );
};

export default RegistrationModal;