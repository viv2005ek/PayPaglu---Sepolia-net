import { FaWallet } from "react-icons/fa";
import { ethers } from "ethers";

export default function ConnectWallet({ onConnect }) {
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        onConnect(accounts[0], provider);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask to use this app!");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
      <div className="p-8">
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">
          Welcome to
        </div>
        <h1 className="block mt-1 text-3xl font-bold text-gray-900">
          PayPaglu
        </h1>
        <p className="mt-4 text-gray-500">
          A Web3 remittance app for sending money via usernames, phone numbers,
          or addresses.
        </p>
        <button
          onClick={connectWallet}
          className="mt-8 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 flex items-center justify-center mx-auto"
        >
          <FaWallet className="mr-2" />
          Connect Wallet
        </button>
      </div>
    </div>
  );
}
