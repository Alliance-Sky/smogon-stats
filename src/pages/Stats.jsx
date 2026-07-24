import React from 'react';
import { useStats } from '../hooks/useStats';
import PokeballIcon from '../components/PokeballIcon';
import '../index.css';

const FormatTools = React.lazy(() => import('../components/FormatTools'));

function getSprite(name) {
  const hyphenatedBases = [
    'ho-oh', 'porygon-z', 'chi-yu', 'chien-pao', 'ting-lu', 'wo-chien',
    'jangmo-o', 'hakamo-o', 'kommo-o', 'nidoran-m', 'nidoran-f'
  ];
  
  let lowerName = name.toLowerCase()
    .replace(/♀/g, 'f')
    .replace(/♂/g, 'm')
    .replace(/é/g, 'e');
  let base = null;
  for (const hb of hyphenatedBases) {
    if (lowerName === hb || lowerName.startsWith(hb + '-')) {
      base = hb;
      break;
    }
  }
  
  if (base) {
    const form = lowerName.substring(base.length);
    const cleanBase = base.replace(/[^a-z0-9]/g, '');
    if (form) {
      const cleanForm = form.replace(/[^a-z0-9]/g, '');
      return `${cleanBase}-${cleanForm}`;
    }
    return cleanBase;
  }
  
  const firstHyphenIndex = lowerName.indexOf('-');
  if (firstHyphenIndex !== -1) {
    const basePart = lowerName.substring(0, firstHyphenIndex).replace(/[^a-z0-9]/g, '');
    const formPart = lowerName.substring(firstHyphenIndex).replace(/[^a-z0-9]/g, '');
    return `${basePart}-${formPart}`;
  }
  
  return lowerName.replace(/[^a-z0-9]/g, '');
}

const formatPercent = (percentStr, showDecimals = false) => {
  if (!percentStr) return '';
  const num = parseFloat(percentStr);
  if (isNaN(num)) return percentStr;
  if (showDecimals) {
    return `${parseFloat(percentStr)}%`;
  }
  return `${Math.round(num)}%`;
};

export default function Stats({ currentView, theme, period, format, rating, setPeriod, setFormat, setRating }) {
  const [sortBy, setSortBy] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sortBy') || 'usage';
  });

  React.useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('sortBy', sortBy);
    window.history.replaceState(null, '', url);
  }, [sortBy]);
  const [toast, setToast] = React.useState(null);
  const [visibleCount, setVisibleCount] = React.useState(200);
  
  const [showMeta, setShowMeta] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('meta') === 'true';
  });

  React.useEffect(() => {
    const url = new URL(window.location);
    if (showMeta) {
      url.searchParams.set('meta', 'true');
    } else {
      url.searchParams.delete('meta');
    }
    window.history.replaceState(null, '', url);
  }, [showMeta]);

  const [showBackToTop, setShowBackToTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight * 3);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const {
    months,
    formats,
    stats,
    metagame,
    totalBattles,
    loading,
    error,
    details,
    expanded,
    setExpanded,
    loadingDetails,
    detailsError,
    toggleDetails,
    expandAll,
    collapseAll
  } = useStats(period, format, rating, setFormat, setRating);

  const handleCollapseAll = React.useCallback(() => {
    const url = new URL(window.location);
    url.searchParams.delete('expand');
    window.history.replaceState(null, '', url);

    React.startTransition(() => {
      collapseAll();
    });
  }, [collapseAll]);

  const resetExpansion = () => {
    const url = new URL(window.location);
    url.searchParams.delete('expand');
    window.history.replaceState(null, '', url);
    React.startTransition(() => {
      setExpanded(new Set());
    });
  };

  const onPeriodChange = (e) => {
    setPeriod(e.target.value);
    resetExpansion();
  };
  const onFormatChange = (e) => {
    const newFormat = e.target.value;
    const ratings = formats[newFormat] || [];
    const newRating = ratings.includes(rating) ? rating : (ratings[0] || '0');
    setFormat(newFormat);
    setRating(newRating);
    resetExpansion();
  };
  const onRatingChange = (e) => {
    setRating(e.target.value);
  };

  const availableFormats = Object.keys(formats);
  const availableRatings = formats[format] || [];

  const formatName = (formatStr) => {
    const match = formatStr.match(/^gen(10|[1-9])(.*)$/);
    if (match) {
      let name = match[2].toUpperCase();
      name = name.replace('RANDOMBATTLE', 'RANDOM BATTLE')
                 .replace('NATIONALDEX', 'NATIONAL DEX')
                 .replace('DOUBLES', 'DOUBLES ')
                 .replace('VGC', 'VGC ');
      return `[GEN ${match[1]}] ${name.trim()}`;
    }
    return formatStr.toUpperCase();
  };

  const onRowClick = (pokemon) => {
    React.startTransition(() => {
      toggleDetails(pokemon);
    });
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const sortedStats = React.useMemo(() => {
    if (!stats) return [];
    if (sortBy === 'usage') return stats;
    if (sortBy === 'leads') {
      return [...stats].sort((a, b) => parseFloat(b.leadPercent) - parseFloat(a.leadPercent));
    }
    return [...stats].sort((a, b) => {
      const getV = (item, idx) => (item.viability && item.viability.length > idx ? item.viability[idx] : -1);
      const diff1 = getV(b, 1) - getV(a, 1);
      if (diff1 !== 0) return diff1;
      const diff2 = getV(b, 2) - getV(a, 2);
      if (diff2 !== 0) return diff2;
      const diff3 = getV(b, 3) - getV(a, 3);
      if (diff3 !== 0) return diff3;
      return getV(b, 0) - getV(a, 0);
    });
  }, [stats, sortBy]);

  React.useEffect(() => {
    setVisibleCount(200);
  }, [sortedStats]);

  const scrollToPokemon = React.useCallback((pokemonName) => {
    React.startTransition(() => {
      setExpanded(prev => {
        const next = new Set(prev);
        next.add(pokemonName);
        return next;
      });
      const targetIndex = sortedStats.findIndex(r => r.pokemon === pokemonName);
      if (targetIndex !== -1) {
        setVisibleCount(prev => Math.max(prev, targetIndex + 20));
      }
    });
    setTimeout(() => {
      const el = document.getElementById(`pokemon-row-${pokemonName}`);
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'center' });
      } else {
        showToast(`${pokemonName} is not in the current list.`);
      }
    }, 50);
  }, [setExpanded, sortedStats]);

  return (
    <>
      <div className="stats-page">
        {currentView === 'chart' ? (
          <React.Suspense fallback={<div className="empty-state" style={{ padding: '2rem' }}>Loading Chart...</div>}>
            <FormatTools theme={theme} period={period} months={months} formats={formats} formatName={formatName} />
          </React.Suspense>
        ) : (
          <>
            <div className="glass-panel controls-container">
              <div className="control-group">
                <label>Stats Period</label>
                <select value={period || ''} onChange={onPeriodChange} disabled={months.length === 0}>
                  {months.length === 0 && <option>Loading...</option>}
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="control-group">
                <label>Format</label>
                <select value={format || ''} onChange={onFormatChange} disabled={availableFormats.length === 0}>
                  {availableFormats.length === 0 && <option>Loading...</option>}
                  {availableFormats.map(f => <option key={f} value={f}>{formatName(f)}</option>)}
                </select>
              </div>

              <div className="control-group">
                <label>Rating Baseline</label>
                <select value={rating || ''} onChange={onRatingChange} disabled={availableRatings.length === 0}>
                  {availableRatings.length === 0 && <option>Loading...</option>}
                  {availableRatings.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="control-group">
                <label>Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="usage">Usage</option>
                  <option value="viability">Viability Ceiling</option>
                  <option value="leads">Lead %</option>
                </select>
              </div>
            </div>

            <div className="glass-panel">
              {loading || !stats ? (
                <>
                  <div className="list-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ marginRight: 'auto' }}>
                      <div className="skeleton-block" style={{ width: '80px', height: '34px', borderRadius: '12px' }}></div>
                    </div>
                    <div className="skeleton-block" style={{ width: '100px', height: '34px', borderRadius: '12px' }}></div>
                    <div className="skeleton-block" style={{ width: '110px', height: '34px', borderRadius: '12px' }}></div>
                  </div>
                  <div className="pokedex-list fade-in-data">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </div>
                </>
              ) : error ? (
                <div className="error-message">
                  <h3>Error Loading Data</h3>
                  <p>{error}</p>
                </div>
              ) : stats.length === 0 ? (
                <div className="empty-state">
                  <p>No data found for this selection.</p>
                </div>
              ) : (
                <>
                  <div className="list-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginRight: 'auto' }}>
                      <button 
                        className="control-btn" 
                        onClick={() => setShowMeta(!showMeta)} 
                      >
                        Meta
                      </button>
                    </div>
                    <button className="control-btn" onClick={() => { 
                      React.startTransition(() => {
                        expandAll(); 
                      });
                      const url = new URL(window.location);
                      url.searchParams.set('expand', 'all');
                      window.history.replaceState(null, '', url);
                    }}>Expand All</button>
                    <button className="control-btn" onClick={handleCollapseAll}>Collapse All</button>
                  </div>

                  {showMeta && (
                    <div className="pokedex-tile tool-tile fade-in-data" style={{ marginBottom: '1rem', width: '100%' }}>
                      <div className="tool-tile-content" style={{ width: '100%' }}>
                        <div className="tool-tile-info" style={{ width: '100%' }}>
                          {!metagame ? (
                            <MetagameSkeleton />
                          ) : Object.keys(metagame.playstyles).length === 0 ? (
                            <div className="empty-state" style={{ padding: '1rem' }}>No metagame data available for this format.</div>
                          ) : (
                            <div className="metagame-analysis">
                              <h5 className="meta-overview-title">Metagame Overview</h5>
                              
                              <div className="stalliness-bar-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>OFFENSE</span>
                                <div style={{ flex: 1, height: '8px', background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 50%, var(--text-muted) 100%)', borderRadius: '4px', position: 'relative' }}>
                                  <div style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    left: `${Math.max(0, Math.min(100, ((metagame.stalliness + 1) / 2) * 100))}%`,
                                    width: '16px', height: '16px', backgroundColor: 'var(--panel-bg)', border: '2px solid var(--primary)', borderRadius: '50%',
                                    transform: 'translateX(-50%)'
                                  }}></div>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>STALL</span>
                              </div>

                              <div className="playstyles-badges" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {Object.entries(metagame.playstyles)
                                  .sort(([,a], [,b]) => b - a)
                                  .slice(0, 8)
                                  .map(([style, pct]) => (
                                    <span key={style} style={{ fontSize: '0.85rem', background: 'var(--badge-bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                      {style.charAt(0).toUpperCase() + style.slice(1)}: <strong>{pct.toFixed(1)}%</strong>
                                    </span>
                                  ))
                                }
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="pokedex-list fade-in-data">
                    {sortedStats.slice(0, visibleCount).map((row, index) => (
                      <PokemonRow 
                        key={row.pokemon}
                        row={row}
                        index={index}
                        sortBy={sortBy}
                        isExpanded={expanded.has(row.pokemon)}
                        loadingDetails={loadingDetails}
                        detailsError={detailsError}
                        detailsData={details && details[row.pokemon]}
                        onRowClick={onRowClick}
                        setExpanded={setExpanded}
                        onPokemonClick={scrollToPokemon}
                      />
                    ))}
                  </div>
                  {visibleCount < sortedStats.length && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', paddingBottom: '2rem' }}>
                      <button 
                        className="load-more-btn"
                        onClick={() => {
                          React.startTransition(() => {
                            setVisibleCount(prev => prev + 200);
                          });
                        }}
                      >
                        Load More Pokémon
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
      {showBackToTop && (
        <button 
          className="back-to-top fade-in-data"
          onClick={() => {
            window.scrollTo({ 
              top: 0, 
              behavior: window.scrollY > 5000 ? 'auto' : 'smooth' 
            });
          }}
          title="Back to top"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      )}
      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}
    </>
  );
}

const PokemonRow = React.memo(({ row, index, sortBy, isExpanded, loadingDetails, detailsError, detailsData, onRowClick, setExpanded, onPokemonClick }) => {
  const spriteSlug = getSprite(row.pokemon);
  const spriteUrl = `https://play.pokemonshowdown.com/sprites/home-centered/${spriteSlug}.png`;
  const deferredExpanded = React.useDeferredValue(isExpanded);
  const displayRank = sortBy === 'usage' ? row.rank : (index + 1);
  const isTopRank = displayRank <= 3;
  const isLeadSort = sortBy === 'leads' || sortBy === 'lead';
  const isViabilitySort = sortBy === 'viability';
  
  return (
    <div id={`pokemon-row-${row.pokemon}`} className={`pokedex-tile ${isExpanded ? 'expanded' : ''}`}>
      <div className="tile-header" onClick={() => onRowClick(row.pokemon)}>
        <div className={`tile-rank ${isTopRank ? 'top-rank-gold' : ''}`}>#{displayRank}</div>
        <img 
          src={spriteUrl} 
          alt={row.pokemon} 
          className="tile-sprite" 
          onError={(e) => e.target.style.display='none'} 
        />
        <div className="tile-info">
          <div className="tile-name">{row.pokemon}</div>
          {isViabilitySort && row.viability ? (
            <div className="tile-usage badge-pill">
              <span className="badge-type">Viability</span>
              <span className="badge-value gold-value">[{row.viability.join(', ')}]</span>
            </div>
          ) : isLeadSort ? (
            <div className="tile-usage badge-pill">
              <span className="badge-type">Lead</span>
              <span className="badge-value gold-value">{formatPercent(row.leadPercent, true)}</span>
            </div>
          ) : (
            <div className="tile-usage badge-pill">
              <span className="badge-type">Usage</span>
              <span className="badge-value gold-value">{formatPercent(row.usagePercent, true)}</span>
            </div>
          )}
        </div>
        <div className="expand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      
      {deferredExpanded && (
        <div className="tile-details">
          {loadingDetails ? (
            <div className="skeleton-container fade-in">
              <div className="skeleton-header">
                <div className="skeleton-circle"></div>
                <div className="skeleton-title"></div>
              </div>
              <div className="skeleton-line" style={{ width: '80%' }}></div>
              <div className="skeleton-line" style={{ width: '60%' }}></div>
              <div className="skeleton-line" style={{ width: '90%' }}></div>
              <div className="skeleton-grid">
                <div className="skeleton-card"></div>
                <div className="skeleton-card"></div>
                <div className="skeleton-card"></div>
              </div>
            </div>
          ) : detailsError ? (
            <div className="details-error">Stats data not available</div>
          ) : detailsData ? (
            <DetailsView data={detailsData} onPokemonClick={onPokemonClick} />
          ) : (
            <div className="details-error">Stats data not available</div>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  if (!prevProps.isExpanded && !nextProps.isExpanded) {
    return prevProps.row === nextProps.row && prevProps.sortBy === nextProps.sortBy;
  }

  return prevProps.isExpanded === nextProps.isExpanded &&
         prevProps.loadingDetails === nextProps.loadingDetails &&
         prevProps.detailsError === nextProps.detailsError &&
         prevProps.detailsData === nextProps.detailsData &&
         prevProps.row === nextProps.row &&
         prevProps.sortBy === nextProps.sortBy;
});

function DetailsView({ data, onPokemonClick }) {
  if (!data) return null;

  const getTop = (arr, n = 5) => {
    if (!arr) return [];
    return arr.slice(0, n);
  };

  const moves = getTop(data.Moves, 6);
  const items = getTop(data.Items, 6);
  const abilities = getTop(data.Abilities, 4);
  const counters = getTop(data.Counters, 5);
  const teammates = getTop(data.Teammates, 5);
  const spreads = getTop(data.Spreads, 4).map(s => ({
    ...s,
    name: s.name.replace(':', ': ')
  }));

  return (
    <div className="pokemon-details-grid">
      <div className="detail-section">
        <h4>Top Moves</h4>
        <ul>
          {moves.map(m => <li key={m.name}><span>{m.name}</span> <strong>{formatPercent(m.percent)}</strong></li>)}
        </ul>
      </div>
      <div className="detail-section">
        <h4>Top Items</h4>
        <ul>
          {items.map(i => <li key={i.name}><span>{i.name}</span> <strong>{formatPercent(i.percent)}</strong></li>)}
        </ul>
      </div>
      <div className="detail-section">
        <h4>Top Spreads</h4>
        <ul>
          {spreads.map(s => <li key={s.name}><span>{s.name}</span> <strong>{formatPercent(s.percent)}</strong></li>)}
        </ul>
      </div>
      <div className="detail-section">
        <h4>Top Abilities</h4>
        <ul>
          {abilities.map(a => <li key={a.name}><span>{a.name}</span> <strong>{formatPercent(a.percent)}</strong></li>)}
        </ul>
      </div>
      <div className="detail-section">
        <h4>Common Counters</h4>
        <ul>
          {counters.map(c => (
            <li key={c.name} className="clickable-pokemon" onClick={() => onPokemonClick(c.name)}>
              <span>{c.name}</span> <strong>{formatPercent(c.percent)}</strong>
            </li>
          ))}
        </ul>
      </div>
      <div className="detail-section">
        <h4>Common Teammates</h4>
        <ul>
          {teammates.map(t => (
            <li key={t.name} className="clickable-pokemon" onClick={() => onPokemonClick(t.name)}>
              <span>{t.name}</span> <strong>{formatPercent(t.percent)}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const SkeletonRow = () => (
  <div className="pokedex-tile skeleton-tile">
    <div className="tile-header">
      <div className="tile-rank skeleton-block" style={{ width: '30px' }}></div>
      <div className="tile-sprite skeleton-block circle" style={{ width: '32px', height: '32px' }}></div>
      <div className="tile-info">
        <div className="tile-name skeleton-block" style={{ width: '120px' }}></div>
        <div className="tile-usage skeleton-block" style={{ width: '60px' }}></div>
      </div>
    </div>
  </div>
);

const MetagameSkeleton = () => (
  <div className="metagame-analysis pulse-opacity" style={{ padding: '0.25rem 0' }}>
    <div className="skeleton-block" style={{ width: '180px', height: '16px', borderRadius: '4px', marginBottom: '12px' }}></div>
    <div className="stalliness-bar-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      <div className="skeleton-block" style={{ width: '55px', height: '14px', borderRadius: '4px' }}></div>
      <div className="skeleton-block" style={{ flex: 1, height: '8px', borderRadius: '4px' }}></div>
      <div className="skeleton-block" style={{ width: '45px', height: '14px', borderRadius: '4px' }}></div>
    </div>
    <div className="playstyles-badges" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      <div className="skeleton-block" style={{ width: '110px', height: '28px', borderRadius: '6px' }}></div>
      <div className="skeleton-block" style={{ width: '120px', height: '28px', borderRadius: '6px' }}></div>
      <div className="skeleton-block" style={{ width: '95px', height: '28px', borderRadius: '6px' }}></div>
      <div className="skeleton-block" style={{ width: '105px', height: '28px', borderRadius: '6px' }}></div>
      <div className="skeleton-block" style={{ width: '115px', height: '28px', borderRadius: '6px' }}></div>
    </div>
  </div>
);
