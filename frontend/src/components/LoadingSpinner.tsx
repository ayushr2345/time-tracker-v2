/**
 * UI Component that renders a polished loading spinner.
 * @returns JSX.Element
 */
function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <div className="relative w-16 h-16">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
        {/* Spinning Gradient Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-blue-500 animate-spin"></div>
        {/* Inner Glow */}
        <div className="absolute inset-2 rounded-full bg-indigo-500/20 blur-md animate-pulse"></div>
      </div>
      <p className="text-gray-400 text-sm font-medium animate-pulse">
        Loading data...
      </p>
    </div>
  );
}

export default LoadingSpinner;
