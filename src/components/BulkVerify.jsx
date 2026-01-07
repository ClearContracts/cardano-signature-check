import { useState } from "react";
import DropZone from "./DropZone";
import blake from "blakejs";

export default function BulkVerify() {
  const [file, setFile] = useState(null);
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [contentHash, setContentHash] = useState(null);

  const parseVoteRecord = (json) => {
    const signatures = [];
    const votes = json.Votes || json.addresses || {};

    for (const [walletAddress, voteData] of Object.entries(votes)) {
      const submissions = voteData["Submissions Voted For"] || [];

      for (const submission of submissions) {
        for (const [option, sigData] of Object.entries(submission)) {
          if (sigData && sigData.message && sigData.key && sigData.signature) {
            let messageObj = {};
            try {
              let msgStr = sigData.message;
              if (msgStr.includes('\\"')) {
                msgStr = msgStr.replace(/\\"/g, '"');
              }
              messageObj = JSON.parse(msgStr);
            } catch {
              // ignore parse errors
            }

            signatures.push({
              stakeAddress: messageObj.wallet || walletAddress,
              message: sigData.message,
              key: sigData.key,
              signature: sigData.signature,
              option: option,
              snapshot:
                messageObj.snapshot ||
                json["Snapshot Name"] ||
                json["Bounty Name"] ||
                "",
            });
          }
        }
      }
    }

    return signatures;
  };

  const verifySignature = async (sig) => {
    const response = await fetch("/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stakeAddress: sig.stakeAddress,
        message: sig.message,
        signature: { key: sig.key, signature: sig.signature },
      }),
    });
    return response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    setError(null);

    let voteRecordJson = "";

    if (file) {
      try {
        voteRecordJson = await file.text();
      } catch (err) {
        setError(`Error reading file: ${err.message}`);
        setLoading(false);
        return;
      }
    } else if (jsonText.trim()) {
      voteRecordJson = jsonText.trim();
    } else {
      setError("Please upload a file or paste JSON");
      setLoading(false);
      return;
    }

    let voteRecord;
    try {
      voteRecord = JSON.parse(voteRecordJson);
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      setLoading(false);
      return;
    }

    const signatures = parseVoteRecord(voteRecord);

    const hash = blake.blake2bHex(voteRecordJson, undefined, 32);
    setContentHash(hash);

    if (signatures.length === 0) {
      setError("No signatures found in vote record");
      setLoading(false);
      return;
    }

    const verificationResults = [];
    for (const sig of signatures) {
      try {
        const result = await verifySignature(sig);
        verificationResults.push({ ...sig, ...result });
      } catch (err) {
        verificationResults.push({ ...sig, valid: false, error: err.message });
      }
    }

    setResults(verificationResults);
    setLoading(false);
  };

  const validCount = results?.filter((r) => r.valid).length || 0;
  const invalidCount = (results?.length || 0) - validCount;

  const inputClass =
    "w-full p-3 text-sm bg-black/30 border border-white/15 rounded-lg text-white font-mono placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all";
  const labelClass = "block text-sm font-medium text-gray-300 mb-2";

  return (
    <form onSubmit={handleSubmit}>
      <div className='mb-5'>
        <label className={labelClass}>Upload Vote Record JSON File</label>
        <DropZone onFileSelect={setFile} fileName={file?.name} />
      </div>

      <div className='mb-5'>
        <label className={labelClass}>Or Paste JSON</label>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder='Paste the full Clarity Vote Record JSON here...'
          rows={10}
          className={inputClass}
          data-wg-notranslate='true'
        />
      </div>

      <button
        type='submit'
        disabled={loading}
        className='w-full py-3.5 px-6 text-base font-semibold text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg cursor-pointer transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed'
      >
        {loading ? "Verifying..." : "Verify All Signatures"}
      </button>

      {error && (
        <div className='mt-6 p-5 rounded-lg flex items-center gap-4 border bg-red-500/15 border-red-500/40'>
          <div className='text-2xl font-bold text-red-500'>✗</div>
          <div className='text-red-300 font-medium'>{error}</div>
        </div>
      )}

      {results && (
        <div className='mt-6'>
          {contentHash && (
            <div className='mb-4 p-3 bg-white/5 rounded-lg border border-white/10'>
              <div className='text-xs text-gray-400 tracking-wide mb-1'>
                Content Hash (Blake2b-256)
              </div>
              <div className='font-mono text-xs text-white break-all'>
                {contentHash}
              </div>
            </div>
          )}
          <div className='flex gap-4 mb-4'>
            <div className='flex-1 text-center p-4 bg-white/5 rounded-lg border border-white/10'>
              <div className='text-2xl font-bold text-white'>
                {results.length}
              </div>
              <div className='text-xs text-gray-400 tracking-wide mt-1'>
                Total
              </div>
            </div>
            <div className='flex-1 text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30'>
              <div className='text-2xl font-bold text-green-500'>
                {validCount}
              </div>
              <div className='text-xs text-gray-400 tracking-wide mt-1'>
                Valid
              </div>
            </div>
            <div className='flex-1 text-center p-4 bg-red-500/10 rounded-lg border border-red-500/30'>
              <div className='text-2xl font-bold text-red-500'>
                {invalidCount}
              </div>
              <div className='text-xs text-gray-400 tracking-wide mt-1'>
                Invalid
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-2 max-h-96 overflow-y-auto'>
            {results.map((r, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg bg-white/[0.03] border border-white/10 ${
                  r.valid
                    ? "border-l-4 border-l-green-500"
                    : "border-l-4 border-l-red-500"
                }`}
              >
                <div className='flex items-center gap-2 mb-1'>
                  <span
                    className={`font-bold ${
                      r.valid ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {r.valid ? "✓" : "✗"}
                  </span>
                  <span className='font-semibold text-white'>{r.option}</span>
                  {r.signedHash && (
                    <span className='ml-auto text-[0.65rem] font-semibold px-2 py-0.5 bg-amber-400/20 text-amber-400 rounded'>
                      Signed Hash
                    </span>
                  )}
                </div>
                <div
                  className='font-mono text-xs text-gray-400 truncate'
                  title={r.stakeAddress}
                >
                  {r.stakeAddress.slice(0, 20)}...{r.stakeAddress.slice(-8)}
                </div>
                {r.error && (
                  <div className='text-xs text-red-300 mt-1'>{r.error}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
