// src/App.tsx
import React from 'react';
import './App.css';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './components/common/Toast';
import { ThemeProvider } from './context/theme/ThemeProvider'; // ✅ Add this import

function App() {
  return (
    <ThemeProvider> {/* ✅ Wrap everything with ThemeProvider */}
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;