import React, { useState, useEffect } from 'react';
import Stats from './pages/Stats';
import Guide from './pages/Guide';
import Changelog from './pages/Changelog';
import TrendTracker from './components/TrendTracker';
import HeaderLogo from './components/HeaderLogo';
import PokeballIcon from './components/PokeballIcon';

import { Route, Switch, useLocation } from "wouter";
import { useStore } from './store';

function App() {
  const { theme, setTheme, period, format, rating } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('period', period);
    url.searchParams.set('format', format);
    url.searchParams.set('rating', rating);
    window.history.replaceState(null, '', url);
  }, [period, format, rating, location]);

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
        <div className="header-top-row">
          <HeaderLogo theme={theme} onClick={() => setLocation('/')} />
          
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        <nav className="desktop-nav">
          <button onClick={() => setLocation('/')} className={`nav-btn ${location === '/' ? 'active' : ''}`} style={{ color: location === '/' ? 'var(--primary)' : 'var(--text-muted)' }}>Stats</button>
          <span className="nav-separator">|</span>
          <button onClick={() => setLocation('/chart')} className={`nav-btn ${location === '/chart' ? 'active' : ''}`} style={{ color: location === '/chart' ? 'var(--primary)' : 'var(--text-muted)' }}>Format Chart</button>
          <span className="nav-separator">|</span>
          <button onClick={() => setLocation('/trend')} className={`nav-btn ${location === '/trend' ? 'active' : ''}`} style={{ color: location === '/trend' ? 'var(--primary)' : 'var(--text-muted)' }}>Trend Tracker</button>
          <span className="nav-separator">|</span>
          <button onClick={() => setLocation('/guide')} className={`nav-btn ${location === '/guide' ? 'active' : ''}`} style={{ color: location === '/guide' ? 'var(--primary)' : 'var(--text-muted)' }}>Guide</button>
          <span className="nav-separator">|</span>
          <button onClick={() => setLocation('/changelog')} className={`nav-btn ${location === '/changelog' ? 'active' : ''}`} style={{ color: location === '/changelog' ? 'var(--primary)' : 'var(--text-muted)' }}>Changelog</button>
        </nav>

        {isMobileMenuOpen && (
          <nav className="mobile-nav">
            <button onClick={() => { setLocation('/'); setIsMobileMenuOpen(false); }} className={`mobile-nav-btn ${location === '/' ? 'active' : ''}`}>Stats</button>
            <button onClick={() => { setLocation('/chart'); setIsMobileMenuOpen(false); }} className={`mobile-nav-btn ${location === '/chart' ? 'active' : ''}`}>Format Chart</button>
            <button onClick={() => { setLocation('/trend'); setIsMobileMenuOpen(false); }} className={`mobile-nav-btn ${location === '/trend' ? 'active' : ''}`}>Trend Tracker</button>
            <button onClick={() => { setLocation('/guide'); setIsMobileMenuOpen(false); }} className={`mobile-nav-btn ${location === '/guide' ? 'active' : ''}`}>Guide</button>
            <button onClick={() => { setLocation('/changelog'); setIsMobileMenuOpen(false); }} className={`mobile-nav-btn ${location === '/changelog' ? 'active' : ''}`}>Changelog</button>
          </nav>
        )}
      </header>
    
      <main className="app-main">
        <Switch>
          <Route path="/guide" component={Guide} />
          <Route path="/trend" component={TrendTracker} />
          <Route path="/changelog" component={Changelog} />
          <Route path="/chart">
            <Stats currentView="chart" />
          </Route>
          <Route path="/">
            <Stats currentView="stats" />
          </Route>
        </Switch>
      </main>

      <footer className="app-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div>
            <p>Data provided by <a href="https://smogon.com" target="_blank" rel="noreferrer">Smogon</a> & <a href="https://pokemonshowdown.com" target="_blank" rel="noreferrer">Pokemon Showdown</a>.</p>
            <p>Not affiliated with Smogon or Pokemon Showdown.</p>
            <p style={{ marginBottom: 0 }}>&copy; 2026 Musaddik Temkar | Built with React & Vite.</p>
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
