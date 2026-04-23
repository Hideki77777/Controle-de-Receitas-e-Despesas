'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Algo deu errado!</h2>
          <button
            onClick={reset}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
