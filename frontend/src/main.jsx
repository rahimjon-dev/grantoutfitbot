import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { TelegramProvider } from './context/TelegramContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <TelegramProvider>
        <LanguageProvider>
          <FavoritesProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </FavoritesProvider>
        </LanguageProvider>
      </TelegramProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
