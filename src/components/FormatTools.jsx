import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getTotalBattles, getFormats } from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function FormatTools({ theme, period, months, formats, formatName }) {
  const [selectedMonth, setSelectedMonth] = useState(period);
  const [localFormats, setLocalFormats] = useState(formats);
  const [fetchingFormats, setFetchingFormats] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [comparedItems, setComparedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    
    if (selectedMonth === period) {
      setLocalFormats(formats);
      setSelectedFormat(prev => {
        if (formats[prev]) {
          setSelectedRating(r => formats[prev].includes(r) ? r : formats[prev][0]);
          return prev;
        }
        const available = Object.keys(formats);
        if (available.length > 0) {
          setSelectedRating(formats[available[0]][0] || '0');
          return available[0];
        }
        return '';
      });
    } else {
      setFetchingFormats(true);
      getFormats(selectedMonth).then(data => {
        if (isCancelled) return;
        setLocalFormats(data);
        setSelectedFormat(prev => {
          if (data[prev]) {
            setSelectedRating(r => data[prev].includes(r) ? r : data[prev][0]);
            return prev;
          }
          const available = Object.keys(data);
          if (available.length > 0) {
            setSelectedRating(data[available[0]][0] || '0');
            return available[0];
          }
          return '';
        });
        setFetchingFormats(false);
      });
    }
    
    return () => { isCancelled = true; };
  }, [selectedMonth, period, formats]);

  const onFormatChange = (e) => {
    const newFormat = e.target.value;
    setSelectedFormat(newFormat);
    setSelectedRating(localFormats[newFormat][0] || '0');
  };

  const handleAdd = async () => {
    if (!selectedFormat || !selectedRating) return;
    
    setLoading(true);
    const battles = await getTotalBattles(selectedMonth, selectedFormat, selectedRating);
    
    setComparedItems(prev => {
      if (prev.find(i => i.month === selectedMonth && i.format === selectedFormat && i.rating === selectedRating)) {
        return prev;
      }
      return [...prev, { month: selectedMonth, format: selectedFormat, rating: selectedRating, battles }];
    });
    setLoading(false);
  };

  const handleRemove = (index) => {
    setComparedItems(comparedItems.filter((_, i) => i !== index));
  };

  const textColor = theme === 'violet' ? '#f4f4f5' : '#2d3748';
  const panelBg = theme === 'violet' ? '#18181b' : '#ffffff';
  const panelBorder = theme === 'violet' ? '#27272a' : '#f1f5f9';

  const truncate = (str, n) => (str.length > n) ? str.slice(0, n - 1) + '…' : str;

  const chartData = {
    labels: comparedItems.map(item => `[${item.month}] ${truncate(formatName(item.format), 16)} (${item.rating})`),
    datasets: [
      {
        label: 'Total Battles',
        data: comparedItems.map(item => item.battles),
        backgroundColor: [
          '#f43f5e', '#a855f7', '#2dd4bf', '#f59e0b', '#3b82f6', '#ec4899', '#10b981', '#f97316'
        ],
        borderWidth: 1,
        borderColor: panelBorder,
        borderRadius: 4
      },
    ],
  };
  
  const chartOptions = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    color: textColor,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: panelBg,
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: panelBorder,
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const val = context.parsed.y;
            return ` Battles: ${val.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { family: 'Outfit' } },
        grid: { color: panelBorder },
        beginAtZero: true
      },
      y: {
        ticks: { color: textColor, font: { family: 'Outfit' } },
        grid: { display: false }
      }
    }
  };

  const formatWaitTime = (battles) => {
    if (battles === 0) return 'N/A';
    const secondsWait = Math.round(2628000 / battles);
    if (secondsWait < 60) return `~${secondsWait}s`;
    const mins = Math.floor(secondsWait / 60);
    const secs = secondsWait % 60;
    return `~${mins}m ${secs}s`;
  };

  const formatRate = (battles) => {
    if (battles === 0) return '0';
    const bpm = (battles / 43800).toFixed(1);
    if (bpm >= 1) return `${bpm} battles/min`;
    const bph = (battles / 730).toFixed(1);
    return `${bph} battles/hr`;
  };

  return (
    <div className="format-tools fade-in-data">
      <div className="glass-panel controls-container" style={{ marginBottom: 0 }}>
        <div className="control-group">
          <label>Add Format to Compare</label>
          <div className="tools-inputs">
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ flex: 1 }}>
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select value={selectedFormat} onChange={onFormatChange} style={{ flex: 2 }} disabled={fetchingFormats}>
              {fetchingFormats ? <option>Loading...</option> : Object.keys(localFormats).map(f => (
                <option key={f} value={f}>{formatName(f)}</option>
              ))}
            </select>
            <select value={selectedRating} onChange={e => setSelectedRating(e.target.value)} style={{ flex: 1 }} disabled={fetchingFormats}>
              {fetchingFormats ? <option>...</option> : (localFormats[selectedFormat] || []).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button className="control-btn add-btn" onClick={handleAdd} disabled={loading || fetchingFormats}>
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </div>

      <div className="tools-content-grid">
        <div className="glass-panel chart-container">
          <h3 className="tools-header">Comparison Chart</h3>
          {comparedItems.length > 0 ? (
            <div style={{ height: '300px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>Add formats to see comparison</div>
          )}
        </div>
        
        <div className="glass-panel list-container">
           <h3 className="tools-header">Format Stats</h3>
          {comparedItems.length > 0 ? comparedItems.map((item, idx) => (
            <div key={idx} className="pokedex-tile tool-tile">
              <div className="tool-tile-content">
                <div className="tool-tile-info">
                  <h4 className="tool-format-name">
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>[{item.month}]</span> {formatName(item.format)} <span className="tool-rating-badge">{item.rating}</span>
                  </h4>
                  <div className="tool-stats">
                    <span><strong>{item.battles.toLocaleString()}</strong> Total Battles</span>
                    <span className="dot-sep">•</span>
                    <span><strong>{formatRate(item.battles)}</strong></span>
                  </div>
                  <div className="tool-wait-time">
                    Est. Wait Time: <strong>{formatWaitTime(item.battles)}</strong>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => handleRemove(idx)} aria-label="Remove">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          )) : (
            <div className="empty-state" style={{ padding: '2rem' }}>No formats added yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
