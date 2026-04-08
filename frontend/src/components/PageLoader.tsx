export default function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg text-center">
        <span className="text-6xl block mb-4 animate-pulse">📚</span>
        <p className="text-xl font-bold text-gray-800 mb-2">Carregando caderneta...</p>
        <div className="flex items-center justify-center gap-2">
          <span className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
