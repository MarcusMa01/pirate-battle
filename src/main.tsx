
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 10,
    },
  },
})

async function startApp() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')

    await worker.start()
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>,
  )
}

startApp().catch((error) => {
  console.error('Failed to start Pirate Battle:', error)
})
