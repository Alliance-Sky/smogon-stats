import React, { useState, useEffect, Suspense, lazy } from 'react';
import Stats from './pages/Stats';
import HeaderLogo from './components/HeaderLogo';
import PokeballIcon from './components/PokeballIcon';

import { Route, Switch, useLocation } from "wouter";
import { useStore } from './store';
import { fetchApi } from './utils/api';

const Guide = lazy(() => import('./pages/Guide'));
const Changelog = lazy(() => import('./pages/Changelog'));
const Charts = lazy(() => import('./pages/Charts'));
const TrendTracker = lazy(() => import('./components/TrendTracker'));

function App() {
  const { theme, setTheme, period, format, rating, setNewAvailableMonth } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const url = new URL(window.location);
    url.searchParams.set('period', period);
    url.searchParams.set('format', format);
    url.searchParams.set('rating', rating);
    window.history.replaceState(null, '', url);
  }, [period, format, rating, location]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const match = document.cookie.match(/(^| )theme=([^;]+)/);
    let actualTheme = 'scarlet';
    if (match) {
      actualTheme = match[2];
    } else if (mediaQuery.matches) {
      actualTheme = 'violet';
    }
    
    if (theme !== actualTheme) {
      useStore.setState({ theme: actualTheme });
    }

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
    const checkNewMonth = async () => {
      try {
        const data = await fetchApi('/api/v3/init');
        if (data && data.defaultMonth) {
          const lastSeen = localStorage.getItem('lastSeenMonth') || '2026-06';
          if (data.defaultMonth > lastSeen) {
            setNewAvailableMonth(data.defaultMonth);
          }
        }
      } catch (e) {}
    };

    checkNewMonth(); // Check immediately on load
    const interval = setInterval(checkNewMonth, 60000);
    return () => clearInterval(interval);
  }, [period, setNewAvailableMonth]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const bg = theme === 'violet' ? '#090d16' : '#fafaf9';
    const color = theme === 'violet' ? '#f8fafc' : '#0f172a';
    document.documentElement.style.backgroundColor = bg;
    document.documentElement.style.color = color;

    const initStyle = document.getElementById('theme-init-style');
    if (initStyle) {
      initStyle.remove();
    }

    const favicon = document.getElementById('favicon');
    if (favicon) {
      favicon.href = `/favicon-${theme}.svg`;
    }
  }, [theme]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-top-row">
          <HeaderLogo onClick={() => setLocation('/')} />
          
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
          <button onClick={() => setLocation('/')} className={`nav-btn ${location === '/' ? 'active' : ''}`}>Stats</button>
          <button onClick={() => setLocation('/charts')} className={`nav-btn ${(location === '/charts' || location === '/chart' || location === '/trend') ? 'active' : ''}`}>Charts</button>
          <button onClick={() => setLocation('/guide')} className={`nav-btn ${location === '/guide' ? 'active' : ''}`}>Guide</button>
          <button onClick={() => setLocation('/changelog')} className={`nav-btn ${location === '/changelog' ? 'active' : ''}`}>Changelog</button>
        </nav>

        {isMobileMenuOpen && (
          <nav className="mobile-nav">
            <button onClick={() => { setLocation('/'); setIsMobileMenuOpen(false); }} className={`mobile-nav-btn ${location === '/' ? 'active' : ''}`}>Stats</button>
            <button onClick={() => { setLocation('/charts'); setIsMobileMenuOpen(false); }} className={`mobile-nav-btn ${(location === '/charts' || location === '/chart' || location === '/trend') ? 'active' : ''}`}>Charts</button>
            <button onClick={() => { setLocation('/guide'); setIsMobileMenuOpen(false); }} className={`mobile-nav-btn ${location === '/guide' ? 'active' : ''}`}>Guide</button>
            <button onClick={() => { setLocation('/changelog'); setIsMobileMenuOpen(false); }} className={`mobile-nav-btn ${location === '/changelog' ? 'active' : ''}`}>Changelog</button>
          </nav>
        )}
      </header>
    
      <main className="app-main">
        <Suspense fallback={<div className="loading-fallback" style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="skeleton-circle" style={{ width: '40px', height: '40px' }}></div></div>}>
          <Switch>
            <Route path="/charts" component={Charts} />
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
        </Suspense>
      </main>

      <footer className="app-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div>
            <p>Data provided by <a href="https://smogon.com" target="_blank" rel="noreferrer">Smogon</a> &amp; <a href="https://pokemonshowdown.com" target="_blank" rel="noreferrer">Pokemon Showdown</a>.</p>
            <p>Not affiliated with Smogon or Pokemon Showdown.</p>
            <p style={{ marginBottom: 0 }}>&copy; 2026 Musaddik Temkar | Built with Preact &amp; Vite.</p>
          </div>
          
          <div className="theme-switch-pill">
            <button 
              onClick={() => {
                setTheme('scarlet');
                document.cookie = `theme=scarlet;path=/;max-age=31536000`;
              }}
              className={`theme-switch-btn ${theme === 'scarlet' ? 'active' : ''}`}
            >
              Light
            </button>
            <button 
              onClick={() => {
                setTheme('violet');
                document.cookie = `theme=violet;path=/;max-age=31536000`;
              }}
              className={`theme-switch-btn ${theme === 'violet' ? 'active' : ''}`}
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
