import { BusinessProvider } from '../../src/data/BusinessProvider';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BusinessProvider><App /></BusinessProvider>
  </StrictMode>,
)
