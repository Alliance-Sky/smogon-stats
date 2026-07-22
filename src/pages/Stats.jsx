import React from 'react';
import { useStats } from '../hooks/useStats';
import PokeballIcon from '../components/PokeballIcon';
import '../index.css';


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

export default function Stats({ theme, period, format, rating, setPeriod, setFormat, setRating }) {
  
  const [showSplash, setShowSplash] = React.useState(() => !sessionStorage.getItem('hasVisited'));
  const [isFadingOut, setIsFadingOut] = React.useState(false);

  const {
    months,
    formats,
    stats,
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


  const onPeriodChange = (e) => setPeriod(e.target.value);
  const onFormatChange = (e) => {
    const newFormat = e.target.value;
    const ratings = formats[newFormat] || [];
    const newRating = ratings.includes(rating) ? rating : (ratings[0] || '0');
    setFormat(newFormat);
    setRating(newRating);
  };
  const onRatingChange = (e) => setRating(e.target.value);

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
    toggleDetails(pokemon);
  };

  const isStillInitializing = loading || months.length === 0 || availableFormats.length === 0 || stats.length === 0;

  React.useEffect(() => {
    if (showSplash && !isStillInitializing && !error) {
      const startFade = setTimeout(() => {
        setIsFadingOut(true);
      }, 500);
      const removeSplash = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('hasVisited', 'true');
      }, 1300);
      
      return () => {
        clearTimeout(startFade);
        clearTimeout(removeSplash);
      };
    }
  }, [isStillInitializing, error, showSplash]);

  return (
    <>
      {showSplash && (
        <div className={`splash-screen ${isFadingOut ? 'fade-out' : ''}`}>
          <div className="splash-content">
            <PokeballIcon variant={theme || 'scarlet'} size={80} className="splash-logo" />
            <div className="progress-bar-container splash-progress">
              <div className="progress-bar-fill"></div>
            </div>
          </div>
        </div>
      )}
      <div className="stats-page">
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
      </div>

      <div className="glass-panel">
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <div className="loading-text">Parsing data from Smogon...</div>
          </div>
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
              <button className="control-btn" onClick={expandAll}>Expand All</button>
              <button className="control-btn" onClick={collapseAll}>Collapse All</button>
            </div>
            <div className="pokedex-list">
              {stats.map(row => (
                <PokemonRow 
                  key={row.rank}
                  row={row}
                  isExpanded={expanded.has(row.pokemon)}
                  loadingDetails={loadingDetails}
                  detailsError={detailsError}
                  detailsData={details && details[row.pokemon]}
                  onRowClick={onRowClick}
                  setExpanded={setExpanded}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}

const PokemonRow = React.memo(({ row, isExpanded, loadingDetails, detailsError, detailsData, onRowClick, setExpanded }) => {
  const spriteSlug = getSprite(row.pokemon);
  const spriteUrl = `https://play.pokemonshowdown.com/sprites/home-centered/${spriteSlug}.png`;
  
  return (
    <div className={`pokedex-tile ${isExpanded ? 'expanded' : ''}`}>
      <div className="tile-header" onClick={() => onRowClick(row.pokemon)}>
        <div className="tile-rank">#{row.rank}</div>
        <img 
          src={spriteUrl} 
          alt={row.pokemon} 
          className="tile-sprite" 
          onError={(e) => e.target.style.display='none'} 
        />
        <div className="tile-info">
          <div className="tile-name">{row.pokemon}</div>
          <div className="tile-usage">{formatPercent(row.usagePercent, true)}</div>
        </div>
        <div className="expand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      
      {isExpanded && (
        <div className="tile-details">
          {loadingDetails ? (
            <div className="details-loader">Fetching Stats Data...</div>
          ) : detailsError ? (
            <div className="details-error">Stats data not available</div>
          ) : detailsData ? (
            <DetailsView data={detailsData} />
          ) : (
            <div className="details-error">Stats data not available</div>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {

  if (!prevProps.isExpanded && !nextProps.isExpanded) {
    return prevProps.row === nextProps.row;
  }


  return prevProps.isExpanded === nextProps.isExpanded &&
         prevProps.loadingDetails === nextProps.loadingDetails &&
         prevProps.detailsError === nextProps.detailsError &&
         prevProps.detailsData === nextProps.detailsData &&
         prevProps.row === nextProps.row;
});

function DetailsView({ data }) {
  if (!data) return null;


  const getTop = (arr, n = 5) => {
    if (!arr) return [];
    return arr.slice(0, n);
  };

  const moves = getTop(data.Moves, 6);
  const items = getTop(data.Items, 4);
  const abilities = getTop(data.Abilities, 4);
  const spreads = getTop(data.Spreads, 6).map(s => ({
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
        <h4>Top Spreads</h4>
        <ul>
          {spreads.map(s => <li key={s.name}><span>{s.name}</span> <strong>{formatPercent(s.percent)}</strong></li>)}
        </ul>
      </div>
      <div className="detail-section">
        <h4>Top Items</h4>
        <ul>
          {items.map(i => <li key={i.name}><span>{i.name}</span> <strong>{formatPercent(i.percent)}</strong></li>)}
        </ul>
      </div>
      <div className="detail-section">
        <h4>Top Abilities</h4>
        <ul>
          {abilities.map(a => <li key={a.name}><span>{a.name}</span> <strong>{formatPercent(a.percent)}</strong></li>)}
        </ul>
      </div>
    </div>
  );
}
