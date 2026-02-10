/**
 * Background UI component that renders animated gradient blobs and texture.
 * @returns JSX.Element
 */
function UI() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-gray-950">
      {/* 1. Subtle Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* 2. Floating Blobs */}
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-float opacity-50"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-float opacity-50"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[100px] animate-float opacity-30"
        style={{ animationDelay: "4s" }}
      />
      
      {/* 3. Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-transparent to-gray-950/80 pointer-events-none" />
    </div>
  );
}

export default UI;