import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { Toaster } from './components/ui/toaster'

const root = createRoot(document.getElementById('app')!)
root.render(
  <BrowserRouter>
    <App />
    <Toaster />
  </BrowserRouter>
)
