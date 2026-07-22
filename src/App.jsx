import React, { useState, useEffect } from 'react';
import Stats from './pages/Stats';
import PokeballIcon from './components/PokeballIcon';

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
  const [period, setPeriod] = useState('2026-06');
  const [format, setFormat] = useState('gen9ou');
  const [rating, setRating] = useState('1760');

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
          <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Smogon Stats</h1>
          </a>
          <p className="header-desc">
            Data provided by <a href="https://smogon.com" target="_blank" rel="noreferrer">Smogon</a> & <a href="https://pokemonshowdown.com" target="_blank" rel="noreferrer">Pokemon Showdown</a>.
          </p>
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
        <Stats 
          theme={theme}
          period={period}
          setPeriod={setPeriod}
          format={format}
          setFormat={setFormat}
          rating={rating}
          setRating={setRating}
        />
      </main>

      <footer className="app-footer">
        <p>Data provided by <a href="https://smogon.com" target="_blank" rel="noreferrer">Smogon</a> & <a href="https://pokemonshowdown.com" target="_blank" rel="noreferrer">Pokemon Showdown</a>.</p>
        <p>Not affiliated with Smogon or Pokemon Showdown.</p>
        <p>&copy; 2026 Musaddik Temkar | Built with React & Vite.</p>
      </footer>
    </div>
  );
}

export default App;
