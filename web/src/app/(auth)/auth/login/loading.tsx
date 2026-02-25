export default function LoginLoading() {
  return (
    <div className="w-full max-w-md mx-auto mt-12 p-8 rounded-2xl shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 animate-pulse">
      <div className="h-8 bg-white/20 rounded w-48 mx-auto mb-8" />
      <div className="space-y-6">
        <div className="h-12 bg-white/20 rounded" />
        <div className="h-12 bg-white/20 rounded" />
        <div className="h-12 bg-white/20 rounded" />
      </div>
    </div>
  );
}
