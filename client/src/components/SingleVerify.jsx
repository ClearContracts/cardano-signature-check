import { useState } from "react";
import ResultDisplay from "./ResultDisplay";

export default function SingleVerify() {
  const [stakeAddress, setStakeAddress] = useState("");
  const [message, setMessage] = useState("");
  const [key, setKey] = useState("");
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stakeAddress: stakeAddress.trim(),
          message: message.trim(),
          signature: { key: key.trim(), signature: signature.trim() },
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ valid: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 text-sm bg-black/30 border border-white/15 rounded-lg text-white font-mono placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all";
  const labelClass = "block text-sm font-medium text-gray-300 mb-2";

  return (
    <form onSubmit={handleSubmit}>
      <div className='mb-5'>
        <label className={labelClass}>Stake Address / Public Key</label>
        <input
          type='text'
          value={stakeAddress}
          onChange={(e) => setStakeAddress(e.target.value)}
          placeholder='addr1... or stake1...'
          required
          className={inputClass}
        />
      </div>

      <div className='mb-5'>
        <label className={labelClass}>Original Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='The exact message that was signed'
          required
          rows={3}
          className={inputClass}
        />
      </div>

      <div className='mb-5'>
        <label className={labelClass}>
          Key (COSE_Key hex from wallet.signData)
        </label>
        <textarea
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder='a4010103272006215820...'
          required
          rows={2}
          className={inputClass}
        />
      </div>

      <div className='mb-5'>
        <label className={labelClass}>
          Signature (COSE_Sign1 hex from wallet.signData)
        </label>
        <textarea
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder='845846a201276761...'
          required
          rows={3}
          className={inputClass}
        />
      </div>

      <button
        type='submit'
        disabled={loading}
        className='w-full py-3.5 px-6 text-base font-semibold text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg cursor-pointer transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed'
      >
        {loading ? "Verifying..." : "Verify Signature"}
      </button>

      <ResultDisplay result={result} />
    </form>
  );
}
