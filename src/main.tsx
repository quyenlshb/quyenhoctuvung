import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './shadcn.css'
import App from './App'

const root = createRoot(document.getElementById('app')!)
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
