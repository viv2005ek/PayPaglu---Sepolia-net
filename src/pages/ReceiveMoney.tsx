import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Copy, QrCode, Check } from 'lucide-react';
import QRCode from 'qrcode';
import Background from './Background';
import { Download } from 'lucide-react';

const ReceiveMoney: React.FC = () => {
  const { user, account } = useWeb3();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      if (user?.username) {
        try {
          const qrData = `${window.location.origin}/send?username=${user.username}`;
          const qrUrl = await QRCode.toDataURL(qrData);
          setQrCodeUrl(qrUrl);
        } catch (error) {
          console.error('QR Code generation error:', error);
        }
      }
    };

    generateQRCode();
  }, [user]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-gray-600">Please complete your registration to receive money.</p>
        </div>
      </div>
    );
  }

  return (
<div className="max-w-4xl mx-auto">
  <Background />
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 backdrop-blur-sm bg-white/30 border-white/20 flex flex-col md:flex-row gap-8">
    {/* Left side - User information */}
    <div className="flex-1 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <QrCode className="text-blue-600" size={24} />
        <h2 className="text-xl font-semibold">Receive Money</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <div className="flex items-center justify-between">
            <span className="font-medium">@{user.username}</span>
            <button
              onClick={() => copyToClipboard(user.username, 'username')}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {copiedField === 'username' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="flex items-center justify-between">
            <span className="font-medium">{user.phoneNumber}</span>
            <button
              onClick={() => copyToClipboard(user.phoneNumber, 'phone')}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {copiedField === 'phone' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wallet Address
          </label>
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{account?.slice(0, 10)}...{account?.slice(-8)}</span>
            <button
              onClick={() => copyToClipboard(account!, 'address')}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {copiedField === 'address' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Right side - QR Code */}
    {qrCodeUrl && (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-xl p-6 backdrop-blur-md bg-white/30 border border-white/20 w-full max-w-xs">
          <h3 className="text-lg font-semibold mb-4 text-center">QR Code</h3>
          <div className="flex justify-center mb-4">
            <img src={qrCodeUrl} alt="Payment QR Code" className="w-48 h-48" />
          </div>
          <button 
            onClick={() => {
              const link = document.createElement('a');
              link.href = qrCodeUrl;
              link.download = `payment-qr-${user.username}.png`;
              link.click();
            }}
          className="w-full flex items-center justify-center gap-2 text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white hover:border-transparent hover:shadow-md py-2 px-4 rounded-lg transition-all duration-300"

          >
            <Download size={16} />
            Download QR Code
          </button>
        </div>
        <p className="text-center text-gray-600 text-sm mt-4">
          Scan this QR code to send money directly to @{user.username}
        </p>
      </div>
    )}
  </div>
</div>
  );
};

export default ReceiveMoney;