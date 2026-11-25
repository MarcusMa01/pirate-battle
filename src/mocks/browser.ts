import { setupWorker } from 'msw/browser'
import { http, passthrough } from 'msw'
import { handlers } from './handlers'

export const worker = setupWorker(
  ...handlers,

  http.all('*', ({ request }) => {
    const url = new URL(request.url)

    if (!url.pathname.startsWith('/api/')) {
      return passthrough()
    }

    return undefined
  }),
)