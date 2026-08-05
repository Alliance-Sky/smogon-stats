import React, { useState, useEffect } from 'react';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import '../utils/chartSetup';
import { Bar } from 'react-chartjs-2';
import { getTotalBattles, getFormats, getMetagame } from '../utils/api';

export default function FormatTools({ theme, period, months, formats, formatName }) {
  const [selectedMonth, setSelectedMonth] = useState(period);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [comparedItems, setComparedItems] = useState([]);
  const [toast, setToast] = useState(null);
  const queryClient = useQueryClient();

  const { data: fetchedFormats, isFetching: fetchingFormats } = useQuery({
    queryKey: ['formats', selectedMonth],
    queryFn: () => getFormats(selectedMonth),
    enabled: selectedMonth !== period,
    staleTime: Infinity,
  });

  const localFormats = selectedMonth === period ? formats : (fetchedFormats || {});

  useEffect(() => {
    if (Object.keys(localFormats).length > 0) {
      setSelectedFormat(prev => {
        if (localFormats[prev]) {
          setSelectedRating(r => localFormats[prev].includes(r) ? r : localFormats[prev][0]);
          return prev;
        }
        const available = Object.keys(localFormats);
        if (available.length > 0) {
          setSelectedRating(localFormats[available[0]][0] || '0');
          return available[0];
        }
        return '';
      });
    }
  }, [localFormats]);

  const onFormatChange = (e) => {
    const newFormat = e.target.value;
    setSelectedFormat(newFormat);
    setSelectedRating(localFormats[newFormat][0] || '0');
  };

  const handleAdd = () => {
    if (!selectedFormat || !selectedRating) return;
    
    setComparedItems(prev => {
      if (prev.find(i => i.month === selectedMonth && i.format === selectedFormat && i.rating === selectedRating)) {
        return prev;
      }
      return [...prev, { month: selectedMonth, format: selectedFormat, rating: selectedRating }];
    });
  };

  const battleQueries = useQueries({
    queries: comparedItems.map(item => ({
      queryKey: ['totalBattles', item.month, item.format, item.rating],
      queryFn: () => getTotalBattles(item.month, item.format, item.rating),
      staleTime: Infinity,
    }))
  });

  useEffect(() => {
    const errorQuery = battleQueries.find(q => q.isError);
    if (errorQuery) {
      setToast('Failed to load some battle data. Please try another format.');
      setTimeout(() => setToast(null), 3000);
    }
  }, [battleQueries]);

  const isFetchingBattles = battleQueries.some(q => q.isFetching);
  const [isLoadingBattles, setIsLoadingBattles] = useState(false);

  useEffect(() => {
    let timer;
    if (isFetchingBattles) {
      timer = setTimeout(() => {
        setIsLoadingBattles(true);
      }, 300);
    } else {
      setIsLoadingBattles(false);
    }
    return () => clearTimeout(timer);
  }, [isFetchingBattles]);

  const handleRemove = (index) => {
    setComparedItems(comparedItems.filter((_, i) => i !== index));
  };

  const textColor = theme === 'violet' ? '#f4f4f5' : '#2d3748';
  const panelBg = theme === 'violet' ? '#18181b' : '#ffffff';
  const panelBorder = theme === 'violet' ? '#27272a' : '#f1f5f9';

  const truncate = (str, n) => (str.length > n) ? str.slice(0, n - 1) + '…' : str;

  const maxBattles = Math.max(1, ...comparedItems.map((_, idx) => battleQueries[idx]?.data || 0));
  const formatWaitTime = (battles) => {
    if (battles === 0) return 'Infinite';
    const bpm = battles / 43800; 
    
    if (bpm < 0.1) return '> 10 mins';
    if (bpm < 1) return '2-10 mins';
    if (bpm < 5) return '1-2 mins';
    if (bpm < 20) return '15-60s';
    if (bpm < 100) return '5-15s';
    return '< 5s';
  };

  const formatRate = (battles) => {
    if (battles === 0) return '0';
    const bpm = (battles / 43800).toFixed(1);
    if (bpm >= 1) return `${bpm} battles/min`;
    const bph = (battles / 730).toFixed(1);
    return `${bph} battles/hr`;
  };

  const chartData = {
    labels: comparedItems.map(i => `${i.month} ${formatName(i.format)}`),
    datasets: [
      {
        label: 'Total Battles',
        data: comparedItems.map((_, idx) => battleQueries[idx]?.data || 0),
        backgroundColor: [
          '#f43f5e', '#a855f7', '#2dd4bf', '#f59e0b', '#3b82f6', '#ec4899', '#10b981', '#f97316'
        ],
        borderRadius: 4,
        barThickness: 24,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    normalized: true,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: panelBg,
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: panelBorder,
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            return ` Total Battles: ${val.toLocaleString()}`;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      axis: 'y',
      intersect: false,
    },
    scales: {
      x: {
        grid: { color: panelBorder },
        ticks: { color: textColor, font: { family: 'Outfit' } },
        beginAtZero: true
      },
      y: {
        grid: { display: false },
        ticks: { display: false },
        border: { display: false }
      }
    }
  };

  const customLabelsPlugin = {
    id: 'customLabels',
    afterDraw: (chart) => {
      const { ctx, data } = chart;
      ctx.save();
      ctx.font = '13px Outfit, sans-serif';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      
      const meta = chart.getDatasetMeta(0);
      meta.data.forEach((bar, index) => {
        const label = data.labels[index];
        
        const yPos = bar.y - (bar.height / 2) - 4; 
        ctx.fillText(label, chart.chartArea.left, yPos);
      });
      ctx.restore();
    }
  };

  return (
    <div className="format-tools fade-in-data">
      <div className="glass-panel controls-container">
        <div className="control-group">
          <label>Compare Period</label>
          <select aria-label="Compare Period" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Compare Format</label>
          <select aria-label="Compare Format" value={selectedFormat} onChange={onFormatChange} disabled={fetchingFormats}>
            {fetchingFormats ? <option value={selectedFormat}>Loading...</option> : Object.keys(localFormats).map(f => (
              <option key={f} value={f}>{formatName(f)}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label style={{ visibility: 'hidden' }}>Action</label>
          <button className="control-btn add-btn" onClick={handleAdd} disabled={isLoadingBattles || fetchingFormats}>
            {isLoadingBattles ? 'Adding...' : '+ Add Format'}
          </button>
        </div>
      </div>

      <div className="tools-content-grid">
        <div className="glass-panel chart-container">
          <h3 className="tools-header">Comparison Chart</h3>
          {comparedItems.length > 0 ? (
            <div style={{ position: 'relative', height: Math.max(300, comparedItems.length * 60) + 'px', width: '100%' }}>
              <Bar data={chartData} options={chartOptions} plugins={[customLabelsPlugin]} />
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>Add formats to see comparison</div>
          )}
        </div>
        
        <div className="glass-panel list-container">
           <h3 className="tools-header">Format Stats</h3>
          {comparedItems.length > 0 ? comparedItems.map((item, idx) => {
            const query = battleQueries[idx];
            const isPending = query?.isPending;
            const battles = query?.data || 0;
            const hasError = query?.isError;
            
            return (
            <div key={idx} className="pokedex-tile tool-tile">
              <div className="tool-tile-content">
                <div className="tool-tile-info">
                  <h4 className="tool-format-name">
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>[{item.month}]</span> {formatName(item.format)}
                  </h4>
                  {isPending ? (
                    <div className="pulse-opacity" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                      <div style={{ width: '120px', height: '16px', background: 'rgba(128,128,128,0.2)', borderRadius: '4px' }}></div>
                      <div style={{ width: '80px', height: '16px', background: 'rgba(128,128,128,0.2)', borderRadius: '4px' }}></div>
                    </div>
                  ) : hasError ? (
                    <div className="tool-stats" style={{ color: '#f43f5e', marginTop: '8px' }}>Failed to load data</div>
                  ) : (
                    <>
                      <div className="tool-stats">
                        <span><strong>{battles.toLocaleString()}</strong> Total Battles</span>
                        <span className="dot-sep">•</span>
                        <span><strong>{formatRate(battles)}</strong></span>
                      </div>
                      <div className="tool-wait-time">
                        Est. Wait Time: <strong>{formatWaitTime(battles)}</strong>
                      </div>
                    </>
                  )}
                </div>
                <button className="remove-btn" onClick={() => handleRemove(idx)} aria-label="Remove">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            );
          }) : null}
          {!isLoadingBattles && comparedItems.length === 0 && (
            <div className="empty-state" style={{ padding: '2rem' }}>No formats added yet</div>
          )}
        </div>
      </div>
      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}
    </div>
  );
}
