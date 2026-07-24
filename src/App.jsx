import React, { useState, useEffect } from 'react';
import Stats from './pages/Stats';
import Guide from './pages/Guide';
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
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || 'stats';
  });
  const [period, setPeriod] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('period') || '2026-06';
  });
  const [format, setFormat] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('format') || 'gen9ou';
  });
  const [rating, setRating] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('rating') || '1760';
  });

  useEffect(() => {
    const url = new URL(window.location);
    if (currentView === 'stats') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', currentView);
    }
    url.searchParams.set('period', period);
    url.searchParams.set('format', format);
    url.searchParams.set('rating', rating);
    window.history.replaceState(null, '', url);
  }, [currentView, period, format, rating]);

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


  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-title-container">
          <h1>Smogon Stats</h1>
          <p className="header-desc" style={{ marginBottom: '8px' }}>
            Data provided by <a href="https://smogon.com" target="_blank" rel="noreferrer">Smogon</a> & <a href="https://pokemonshowdown.com" target="_blank" rel="noreferrer">Pokemon Showdown</a>.
          </p>
          <nav style={{ display: 'flex', gap: '20px', marginTop: 'auto' }}>
            <button 
              onClick={() => setCurrentView('stats')} 
              style={{ background: 'none', border: 'none', color: currentView === 'stats' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', borderBottom: currentView === 'stats' ? '2px solid var(--primary)' : '2px solid transparent', padding: '0 0 4px 0', transition: 'all 0.2s ease' }}
            >
              Stats
            </button>
            <button 
              onClick={() => setCurrentView('chart')} 
              style={{ background: 'none', border: 'none', color: currentView === 'chart' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', borderBottom: currentView === 'chart' ? '2px solid var(--primary)' : '2px solid transparent', padding: '0 0 4px 0', transition: 'all 0.2s ease' }}
            >
              Format Chart
            </button>
            <button 
              onClick={() => setCurrentView('guide')} 
              style={{ background: 'none', border: 'none', color: currentView === 'guide' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', borderBottom: currentView === 'guide' ? '2px solid var(--primary)' : '2px solid transparent', padding: '0 0 4px 0', transition: 'all 0.2s ease' }}
            >
              Guide
            </button>
          </nav>
        </div>
      </header>
    
      <main className="app-main">
        {currentView === 'guide' ? (
          <Guide />
        ) : (
          <Stats 
            currentView={currentView}
            theme={theme}
            period={period}
            setPeriod={setPeriod}
            format={format}
            setFormat={setFormat}
            rating={rating}
            setRating={setRating}
          />
        )}
      </main>

      <footer className="app-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div>
            <p>Data provided by <a href="https://smogon.com" target="_blank" rel="noreferrer">Smogon</a> & <a href="https://pokemonshowdown.com" target="_blank" rel="noreferrer">Pokemon Showdown</a>.</p>
            <p>Not affiliated with Smogon or Pokemon Showdown.</p>
            <p>&copy; 2026 Musaddik Temkar | Built with React & Vite.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Theme:</span>
            <button 
              onClick={() => {
                setTheme('scarlet');
                document.cookie = `theme=scarlet;path=/;max-age=31536000`;
              }}
              style={{
                background: 'none',
                border: 'none',
                color: theme === 'scarlet' ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                padding: '0',
                outline: 'none',
              }}
            >
              Light
            </button>
            <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>|</span>
            <button 
              onClick={() => {
                setTheme('violet');
                document.cookie = `theme=violet;path=/;max-age=31536000`;
              }}
              style={{
                background: 'none',
                border: 'none',
                color: theme === 'violet' ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                padding: '0',
                outline: 'none',
              }}
            >
              Dark
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
