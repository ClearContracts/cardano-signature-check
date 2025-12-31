import { useState } from "react";
import SingleVerify from "./components/SingleVerify";
import BulkVerify from "./components/BulkVerify";

function App() {
  const [activeTab, setActiveTab] = useState("single");

  const tabClass = (tab) =>
    `flex-1 py-3 px-4 text-sm font-medium rounded-lg cursor-pointer transition-all ${
      activeTab === tab
        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
        : "bg-black/20 text-gray-400 border border-white/10 hover:bg-white/5 hover:text-gray-300"
    }`;

  return (
    <div className='min-h-screen p-8 text-gray-200'>
      <div className='max-w-xl mx-auto bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-white/10 shadow-2xl'>
        <header className='text-center mb-8'>
          <h1 className='text-2xl font-semibold text-white mb-2'>
            Cardano Signature Verifier
          </h1>
          <p className='text-gray-400 text-sm'>
            Verify CIP-8 wallet signatures collected from Cardano wallets
          </p>
        </header>

        <div className='flex gap-2 mb-6'>
          <button
            className={tabClass("single")}
            onClick={() => setActiveTab("single")}
          >
            Single Signature
          </button>
          <button
            className={tabClass("bulk")}
            onClick={() => setActiveTab("bulk")}
          >
            Clarity Vote Record
          </button>
        </div>

        {activeTab === "single" ? <SingleVerify /> : <BulkVerify />}
      </div>
    </div>
  );
}

export default App;
