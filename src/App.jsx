import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Stats from './pages/Stats';
import PokeballIcon from './components/PokeballIcon';
import DefaultRedirect from './components/DefaultRedirect';

const getInitialTheme = () => {
  const match = document.cookie.match(/(^| )theme=([^;]+)/);
  if (match) return match[2];
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'violet';
  }
  return 'scarlet';
};

function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!document.cookie.match(/(^| )theme=([^;]+)/)) {
        setTheme(e.matches ? 'violet' : 'scarlet');
      }
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const favicon = document.getElementById('favicon');
    if (favicon) {
      favicon.href = `/favicon-${theme}.svg`;
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'scarlet' ? 'violet' : 'scarlet';
      document.cookie = `theme=${newTheme};path=/;max-age=31536000`;
      return newTheme;
    });
  };

  const nextTheme = theme === 'scarlet' ? 'violet' : 'scarlet';

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-title-container">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Smogon Stats</h1>
          </Link>
        </div>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          title={`Switch to Pokémon ${nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1)} theme`}
          aria-label="Toggle theme"
          style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <PokeballIcon variant={nextTheme} size={32} />
        </button>
      </header>
    
      <main className="app-main">
        <Routes>
          <Route path="/" element={<DefaultRedirect />} />
          <Route path="/stats/:period/:format/:rating" element={<Stats theme={theme} />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>Data provided by <a href="https://www.smogon.com/stats/" target="_blank" rel="noreferrer">Smogon</a>.</p>
        <p>Not affiliated with Smogon or Pokemon Showdown.</p>
        <p>&copy; 2026 Musaddik Temkar | Built with React & Vite.</p>
      </footer>
    </div>
  );
}

export default App;
