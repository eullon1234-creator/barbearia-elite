import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BarberProvider } from './context/BarberContext'
import { LicenseProvider } from './context/LicenseContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LicenseProvider>
      <BarberProvider>
        <App />
      </BarberProvider>
    </LicenseProvider>
  </StrictMode>,
)
