import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store/index.js'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { NavigationProvider } from './context/NavigationContext'

import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <HashRouter>
        <AuthProvider>
          <ThemeProvider>
            <NavigationProvider>
              <App />
            </NavigationProvider>
          </ThemeProvider>
        </AuthProvider>
      </HashRouter>
    </Provider>
  </StrictMode>,
)

