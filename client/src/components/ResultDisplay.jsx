export default function ResultDisplay({ result, className = "" }) {
  if (!result) return null;

  const isValid = result.valid;
  const bgColor = isValid ? "bg-green-500/15" : "bg-red-500/15";
  const borderColor = isValid ? "border-green-500/40" : "border-red-500/40";
  const iconColor = isValid ? "text-green-500" : "text-red-500";
  const textColor = isValid ? "text-green-300" : "text-red-300";

  return (
    <div
      className={`mt-6 p-5 rounded-lg flex items-start gap-4 border ${bgColor} ${borderColor} animate-fade-in ${className}`}
    >
      <div className={`text-2xl font-bold ${iconColor}`}>
        {isValid ? "✓" : "✗"}
      </div>
      <div className='flex-1'>
        <div className={`font-medium ${textColor}`}>
          {result.error || result.message}
        </div>
        {result.signedHash && (
          <div className='text-sm text-amber-400 mt-2'>
            Verified against blake2b-224 hash of message
          </div>
        )}
      </div>
    </div>
  );
}
