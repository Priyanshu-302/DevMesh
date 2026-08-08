import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider }  from './src/context/ThemeContext';
import { AuthProvider }   from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import App from './App';
import './src/styles/tailwind.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
