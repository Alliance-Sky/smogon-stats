import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import '../utils/chartSetup';
import { Line } from 'react-chartjs-2';
import { getTrend, getFormats, getStats } from '../utils/api';
import { useStore } from '../store';
import SEO from './SEO';

const COLORS = [
  '#f43f5e', '#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#2dd4bf', '#f97316'
];

const POPULAR_FORMATS = Object.fromEntries(Object.entries({
  
  'gen9ou': ['0', '1500', '1695', '1825'], 'gen9ubers': ['0', '1500', '1630', '1760'], 'gen9uu': ['0', '1500', '1630', '1760'], 'gen9ru': ['0', '1500', '1630', '1760'], 'gen9nu': ['0', '1500', '1630', '1760'], 'gen9pu': ['0', '1500', '1630', '1760'], 'gen9lc': ['0', '1500', '1630', '1760'], 'gen9monotype': ['0', '1500', '1630', '1760'], 'gen9doublesou': ['0', '1500', '1630', '1760'], 'gen9doublesuu': ['0', '1500', '1630', '1760'], 'gen9doublesubers': ['0', '1500', '1630', '1760'], 'gen9randombattle': ['0', '1100', '1300', '1500'],
  'gen9battlestadiumsingles': ['0', '1500', '1630', '1760'], 'gen9battlestadiumdoubles': ['0', '1500', '1630', '1760'],
  'gen9bssregj': ['0', '1500', '1630', '1760'], 'gen9bssregi': ['0', '1500', '1630', '1760'], 'gen9bssregh': ['0', '1500', '1630', '1760'], 'gen9bssregg': ['0', '1500', '1630', '1760'], 'gen9bssregf': ['0', '1500', '1630', '1760'],
  'gen9vgc2026regi': ['0', '1500', '1630', '1760'], 'gen9vgc2026regibo3': ['0', '1500', '1630', '1760'], 'gen9vgc2026regf': ['0', '1500', '1630', '1760'], 'gen9vgc2026regfbo3': ['0', '1500', '1630', '1760'],
  'gen9vgc2025regj': ['0', '1500', '1630', '1760'], 'gen9vgc2025regh': ['0', '1500', '1630', '1760'], 'gen9vgc2025reghbo3': ['0', '1500', '1630', '1760'], 'gen9vgc2025regi': ['0', '1500', '1630', '1760'], 'gen9vgc2025regibo3': ['0', '1500', '1630', '1760'], 'gen9vgc2025regg': ['0', '1500', '1630', '1760'], 'gen9vgc2025reggbo3': ['0', '1500', '1630', '1760'],
  'gen9vgc2024regh': ['0', '1500', '1630', '1760'], 'gen9vgc2024reghbo3': ['0', '1500', '1630', '1760'], 'gen9vgc2024regg': ['0', '1500', '1630', '1760'], 'gen9vgc2024reggbo3': ['0', '1500', '1630', '1760'], 'gen9vgc2024regf': ['0', '1500', '1630', '1760'], 'gen9vgc2024regfbo3': ['0', '1500', '1630', '1760'],
  'gen9vgc2023regulatione': ['0', '1500', '1630', '1760'], 'gen9vgc2023regulationebo3': ['0', '1500', '1630', '1760'], 'gen9vgc2023regulationd': ['0', '1500', '1630', '1760'], 'gen9vgc2023regulationc': ['0', '1500', '1630', '1760'], 'gen9vgc2023series2': ['0', '1500', '1630', '1760'], 'gen9vgc2023series1': ['0', '1500', '1630', '1760'],

  'gen8ou': ['0', '1500', '1630', '1760'], 'gen8ubers': ['0', '1500', '1630', '1760'], 'gen8uu': ['0', '1500', '1630', '1760'], 'gen8ru': ['0', '1500', '1630', '1760'], 'gen8nu': ['0', '1500', '1630', '1760'], 'gen8pu': ['0', '1500', '1630', '1760'], 'gen8lc': ['0', '1500', '1630', '1760'], 'gen8doublesou': ['0', '1500', '1630', '1760'], 'gen8doublesuu': ['0', '1500', '1630', '1760'], 'gen8randombattle': ['0', '1100', '1300', '1500'],
  'gen8battlestadiumsingles': ['0', '1500', '1630', '1760'], 'gen8battlestadiumdoubles': ['0', '1500', '1630', '1760'],
  'gen8vgc2022': ['0', '1500', '1630', '1760'], 'gen8vgc2021': ['0', '1500', '1630', '1760'], 'gen8vgc2021series11': ['0', '1500', '1630', '1760'], 'gen8vgc2021series10': ['0', '1500', '1630', '1760'], 'gen8vgc2021series9': ['0', '1500', '1630', '1760'], 'gen8vgc2020': ['0', '1500', '1630', '1760'],

  'gen7ou': ['0', '1500', '1630', '1760'], 'gen7ubers': ['0', '1500', '1630', '1760'], 'gen7uu': ['0', '1500', '1630', '1760'], 'gen7ru': ['0', '1500', '1630', '1760'], 'gen7nu': ['0', '1500', '1630', '1760'], 'gen7pu': ['0', '1500', '1630', '1760'], 'gen7lc': ['0', '1500', '1630', '1760'], 'gen7doublesou': ['0', '1500', '1630', '1760'], 'gen7doublesuu': ['0', '1500', '1630', '1760'], 'gen7randombattle': ['0', '1100', '1300', '1500'],
  'gen7battlespotdoubles': ['0', '1500', '1630', '1760'],
  'gen7vgc2019': ['0', '1500', '1630', '1760'], 'gen7vgc2019ultraseries': ['0', '1500', '1630', '1760'], 'gen7vgc2019sunseries': ['0', '1500', '1630', '1760'], 'gen7vgc2019moonseries': ['0', '1500', '1630', '1760'], 'gen7vgc2018': ['0', '1500', '1630', '1760'], 'gen7vgc2017': ['0', '1500', '1630', '1760'],

  'gen6ou': ['0', '1500', '1630', '1760'], 'gen6ubers': ['0', '1500', '1630', '1760'], 'gen6uu': ['0', '1500', '1630', '1760'], 'gen6ru': ['0', '1500', '1630', '1760'], 'gen6nu': ['0', '1500', '1630', '1760'], 'gen6doublesou': ['0', '1500', '1630', '1760'], 'gen6doublesuu': ['0', '1500', '1630', '1760'], 'gen6randombattle': ['0', '1100', '1300', '1500'],
  'gen6battlespotdoubles': ['0', '1500', '1630', '1760'],
  'gen6vgc2016': ['0', '1500', '1630', '1760'], 'vgc2016': ['0', '1500', '1630', '1760'], 'vgc2015': ['0', '1500', '1630', '1760'], 'gen6vgc2014': ['0', '1500', '1630', '1760'],

  'gen5ou': ['0', '1500', '1630', '1760'], 'gen5ubers': ['0', '1500', '1630', '1760'], 'gen5uu': ['0', '1500', '1630', '1760'], 'gen5nu': ['0', '1500', '1630', '1760'], 'gen5doublesou': ['0', '1500', '1630', '1760'], 'gen5randombattle': ['0', '1100', '1300', '1500'],
  'gen5vgc2013': ['0', '1500', '1630', '1760'], 'gen5vgc2012': ['0', '1500', '1630', '1760'], 'gen5vgc2011': ['0', '1500', '1630', '1760'], 'gen5gbudoubles': ['0', '1500', '1630', '1760'],

  'gen4ou': ['0', '1500', '1630', '1760'], 'gen4ubers': ['0', '1500', '1630', '1760'], 'gen4uu': ['0', '1500', '1630', '1760'], 'gen4nu': ['0', '1500', '1630', '1760'], 'gen4doublesou': ['0', '1500', '1630', '1760'], 'gen4randombattle': ['0', '1100', '1300', '1500'],
  'gen4vgc2010': ['0', '1500', '1630', '1760'], 'gen4vgc2009': ['0', '1500', '1630', '1760'],

  'gen3ou': ['0', '1500', '1630', '1760'], 'gen3ubers': ['0', '1500', '1630', '1760'], 'gen3uu': ['0', '1500', '1630', '1760'], 'gen3nu': ['0', '1500', '1630', '1760'], 'gen3doublesou': ['0', '1500', '1630', '1760'], 'gen3randombattle': ['0', '1100', '1300', '1500'],

  'gen2ou': ['0', '1500', '1630', '1760'], 'gen2ubers': ['0', '1500', '1630', '1760'], 'gen2uu': ['0', '1500', '1630', '1760'], 'gen2randombattle': ['0', '1100', '1300', '1500'],

  'gen1ou': ['0', '1500', '1630', '1760'], 'gen1ubers': ['0', '1500', '1630', '1760'], 'gen1uu': ['0', '1500', '1630', '1760'], 'gen1randombattle': ['0', '1100', '1300', '1500']
}).map(([k, v]) => [k, v.slice(-2)]));

const formatName = (formatStr) => {
  if (!formatStr) return '';
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

export default function TrendTracker() {
  const { theme, format, rating, setFormat, setRating, period } = useStore();
  const [pokemonInput, setPokemonInput] = useState('');
  const [trackedPokemon, setTrackedPokemon] = useState([]);
    const [monthsLimit, setMonthsLimit] = useState(12);
  const [validPokemonList, setValidPokemonList] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const { data: formatsData } = useQuery({
    queryKey: ['formats', period],
    queryFn: () => getFormats(period),
    enabled: !!period
  });

  const formatsMap = useMemo(() => {
    if (!formatsData) return POPULAR_FORMATS;
    const merged = { ...POPULAR_FORMATS };
    for (const [fmt, ratings] of Object.entries(formatsData)) {
      if (!merged[fmt]) {
        merged[fmt] = ratings;
      }
    }
    return merged;
  }, [formatsData]);

  const { data: statsData } = useQuery({
    queryKey: ['stats', period, format, rating],
    queryFn: () => getStats(period, format, rating),
    enabled: !!(period && format && rating)
  });

  useEffect(() => {
    if (statsData && Array.isArray(statsData)) {
      setValidPokemonList(statsData.map(s => s.pokemon));
    }
  }, [statsData]);

  const availableFormats = Object.keys(formatsMap).sort((a, b) => {
    const matchA = a.match(/^gen(\d+)/);
    const matchB = b.match(/^gen(\d+)/);
    
    if (matchA && matchB) {
      const genA = parseInt(matchA[1], 10);
      const genB = parseInt(matchB[1], 10);
      if (genA !== genB) return genB - genA;
    } else if (matchA) {
      return -1;
    } else if (matchB) {
      return 1;
    }
    return a.localeCompare(b);
  });
  
  const availableRatings = formatsMap[format] || [];

  const onFormatChange = (e) => {
    const newFormat = e.target.value;
    const ratings = formatsMap[newFormat] || [];
    const newRating = ratings.includes(rating) ? rating : (ratings[0] || '0');
    setFormat(newFormat);
    setRating(newRating);
  };

  const onRatingChange = (e) => {
    setRating(e.target.value);
  };

  useEffect(() => {
    setTrackedPokemon([]);
    setPokemonInput('');
  }, [format]);

  const assignedColorsRef = React.useRef({});
  const getStableColor = (pokemon) => {
    if (!assignedColorsRef.current[pokemon]) {
      const usedColors = new Set(Object.values(assignedColorsRef.current));
      const availableColor = COLORS.find(c => !usedColors.has(c));
      
      assignedColorsRef.current[pokemon] = availableColor || COLORS[Object.keys(assignedColorsRef.current).length % COLORS.length];
    }
    return assignedColorsRef.current[pokemon];
  };

  const trendQuery = useQuery({
    queryKey: ['trend', format, rating, trackedPokemon.join(','), monthsLimit],
    queryFn: () => getTrend(format, rating, trackedPokemon, monthsLimit),
    enabled: trackedPokemon.length > 0,
    placeholderData: keepPreviousData
  });

  const isFetchingAny = trendQuery.isFetching;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (isFetchingAny) {
      timer = setTimeout(() => {
        setLoading(true);
      }, 300);
    } else {
      setLoading(false);
    }
    return () => clearTimeout(timer);
  }, [isFetchingAny]);

  const trendData = useMemo(() => {
    return trendQuery.data || {};
  }, [trendQuery.data]);

  const handleAddPokemon = (e) => {
    e.preventDefault();
    const pokemonName = pokemonInput.trim();
    if (!pokemonName) return;

    const lowerInput = pokemonName.toLowerCase();
    let matchedPokemon = null;

    if (validPokemonList.length > 0) {
      matchedPokemon = validPokemonList.find(p => p.toLowerCase() === lowerInput);
      if (!matchedPokemon) {
        showToast(`"${pokemonName}" not found in current format`);
        return;
      }
    } else {
      
      matchedPokemon = pokemonName.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }

    if (!trackedPokemon.includes(matchedPokemon)) {
      setTrackedPokemon([...trackedPokemon, matchedPokemon]);
    }
    setPokemonInput('');
  };

  const handleRemovePokemon = (pokemonToRemove) => {
    setTrackedPokemon(trackedPokemon.filter((p) => p !== pokemonToRemove));
  };

  const textColor = theme === 'violet' ? '#f4f4f5' : '#2d3748';
  const panelBg = theme === 'violet' ? '#18181b' : '#ffffff';
  const panelBorder = theme === 'violet' ? '#27272a' : '#f1f5f9';

  const chartData = useMemo(() => {
    if (Object.keys(trendData).length === 0) {
      return { labels: [], datasets: [] };
    }

    const allMonths = new Set();
    Object.values(trendData).forEach((dataArray) => {
      dataArray.forEach((point) => allMonths.add(point.month));
    });
    
    let labels = Array.from(allMonths).sort();
    
    if (labels.length > 0) {
      const latestMonth = labels[labels.length - 1];
      const generatedLabels = [];
      let [year, month] = latestMonth.split('-').map(Number);
      for (let i = 0; i < monthsLimit; i++) {
        const mm = month.toString().padStart(2, '0');
        generatedLabels.unshift(`${year}-${mm}`);
        month -= 1;
        if (month === 0) {
          month = 12;
          year -= 1;
        }
      }
      labels = generatedLabels;
    }

    const datasets = trackedPokemon.map((pokemon) => {
      const dataForPokemon = trendData[pokemon] || [];

      const dataPoints = labels.map((month) => {
        const found = dataForPokemon.find((d) => d.month === month);
        return found ? parseFloat(found.usagePercent) : 0;
      });

      const color = getStableColor(pokemon);

      return {
        label: pokemon,
        data: dataPoints,
        borderColor: color,
        backgroundColor: color,
        tension: 0.3, 
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true,
      };
    });

    return { labels, datasets };
  }, [trendData, trackedPokemon, monthsLimit]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    color: textColor,
    animation: { duration: 300 },
    normalized: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { family: 'Outfit' },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: panelBg,
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: panelBorder,
        borderWidth: 1,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += Number(context.parsed.y).toFixed(5) + '%';
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { family: 'Outfit' } },
        grid: { color: panelBorder },
      },
      y: {
        ticks: { 
          color: textColor, 
          font: { family: 'Outfit' },
          callback: function(value) {
            return Number.parseFloat(Number(value).toFixed(5)) + '%';
          }
        },
        grid: { color: panelBorder },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <div className="trend-tracker fade-in-data">
      <SEO 
        title={`Trend Tracker - ${formatName(format)}`} 
        description={`Track historical Pokemon Showdown usage trends for ${formatName(format)} over the past ${monthsLimit} months.`} 
        url={`/trend?format=${format}&rating=${rating}&months=${monthsLimit}`} 
      />
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        Smogon Trend Tracker for {formatName(format)}
      </h1>
      <div className="glass-panel controls-container">
        <div className="control-group">
          <label>Format</label>
          <select aria-label="Format" value={format || ''} onChange={onFormatChange} disabled={availableFormats.length === 0}>
            {availableFormats.length === 0 && <option>Loading...</option>}
            {availableFormats.map(f => <option key={f} value={f}>{formatName(f)}</option>)}
          </select>
        </div>

        <div className="control-group">
          <label>Rating Baseline</label>
          <select aria-label="Rating Baseline" value={rating || ''} onChange={onRatingChange} disabled={availableRatings.length === 0}>
            {availableRatings.length === 0 && <option>Loading...</option>}
            {availableRatings.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="control-group">
          <label>Timeframe</label>
          <select aria-label="Timeframe" value={monthsLimit} onChange={(e) => setMonthsLimit(Number(e.target.value))}>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
            <option value={24}>Last 24 Months</option>
          </select>
        </div>

        <form onSubmit={handleAddPokemon} className="control-group" style={{ flex: 1 }}>
          <label>Compare Pokémon</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              list="pokemon-options"
              value={pokemonInput}
              onChange={(e) => setPokemonInput(e.target.value)}
              placeholder="e.g. Great Tusk"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${panelBorder}`,
                background: (theme === 'violet' || theme === 'dark-red') ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                color: textColor,
                fontFamily: 'Outfit',
                fontSize: '0.9rem',
                minWidth: '0'
              }}
            />
            <datalist id="pokemon-options">
              {validPokemonList.map(p => <option key={p} value={p} />)}
            </datalist>
            <button type="submit" className="control-btn add-btn" style={{ whiteSpace: 'nowrap' }}>
              + Add
            </button>
          </div>
        </form>
      </div>

      {trackedPokemon.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {trackedPokemon.map((pokemon) => {
            const color = getStableColor(pokemon);
            return (
            <div 
              key={pokemon} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                padding: '4px 10px', 
                borderRadius: '16px',
                background: `${color}20`, 
                border: `1px solid ${color}50`,
                color: textColor,
                fontSize: '0.85rem',
                fontWeight: '500'
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></div>
              {pokemon}
              <button 
                onClick={() => handleRemovePokemon(pokemon)}
                style={{ 
                  background: 'none', border: 'none', color: textColor, opacity: 0.6, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', marginLeft: '4px'
                }}
                title="Remove"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            );
          })}
        </div>
      )}

      <div className="glass-panel chart-container" style={{ position: 'relative', height: '500px', padding: '2rem' }}>
        <h3 className="tools-header" style={{ marginBottom: '1rem' }}>
          Historical Usage Trend
          {loading && <span style={{ marginLeft: '10px', fontSize: '0.8rem', opacity: 0.7, fontWeight: 'normal' }} className="pulse-opacity">Loading...</span>}
        </h3>
        {trackedPokemon.length === 0 ? (
          <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Add Pokémon to track their usage trends</p>
          </div>
        ) : (
          <div style={{ flex: 1, position: 'relative', width: '100%', height: 'calc(100% - 2rem)' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}
    </div>
  );
}
