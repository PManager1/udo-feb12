export default function Toast({ message, type = 'success' }) {
  const bg = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-gray-900' : 'bg-gray-700';
  return (
    <div className="fixed bottom-4 right-4 z-[200] animate-[fadeIn_0.3s_ease-in]">
      <div className={`${bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
        {type === 'success' && (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {type === 'error' && (
          <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}