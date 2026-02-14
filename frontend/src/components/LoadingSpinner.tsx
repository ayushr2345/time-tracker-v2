import type { JSX } from "react";

/**
 * A polished loading indicator component.
 * @remarks
 * Centers a customized spinner in a fixed-height container.
 * The spinner consists of three layers:
 * 1. A static transparent track (Outer Ring).
 * 2. An animated gradient border (Spinning Ring).
 * 3. A pulsing background glow (Inner Glow).
 *
 * @returns The rendered loading spinner with a text label.
 */
function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <div className="relative w-16 h-16">
        {/* Outer Ring (Static Track) */}
        <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>

        {/* Spinning Gradient Ring (Active Indicator) */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-blue-500 animate-spin"></div>

        {/* Inner Glow (Ambient Pulse) */}
        <div className="absolute inset-2 rounded-full bg-indigo-500/20 blur-md animate-pulse"></div>
      </div>
      <p className="text-gray-400 text-sm font-medium animate-pulse">
        Loading data...
      </p>
    </div>
  );
}

export default LoadingSpinner;
