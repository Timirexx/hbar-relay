import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// IMPORTANT: Initialize Wallet Singletons at the absolute root to prevent popup blocking
import './config/appkit'
import './config/hashconnect'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
