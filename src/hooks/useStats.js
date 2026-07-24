import { useState, useEffect, useRef } from 'react';

import { getMonths, getFormats, getStats, getDetails, getViability, getLeads, getMetagame, getTotalBattles } from '../utils/api';

export function useStats(period, format, rating, setFormat, setRating) {

  const [months, setMonths] = useState([]);
  const [formats, setFormats] = useState({});
  

  const [stats, setStats] = useState(null);
  const [metagame, setMetagame] = useState(null);
  const [totalBattles, setTotalBattles] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  const [details, setDetails] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(false);
  const chunkingRef = useRef(0);


  useEffect(() => {
    let isCancelled = false;
    getMonths().then(data => {
      if (!isCancelled) setMonths(data);
    });
    return () => { isCancelled = true; };
  }, []);


  useEffect(() => {
    let isCancelled = false;
    if (period) {
      setFormats({});
      getFormats(period).then(data => {
        if (isCancelled) return;
        setFormats(data);
        

        const availableFormats = Object.keys(data);
        if (availableFormats.length > 0 && !data[format]) {
          const firstFormat = availableFormats[0];
          const firstRating = data[firstFormat][0];
          setFormat(firstFormat);
          setRating(firstRating);
        }
      });
    }
    return () => { isCancelled = true; };
  }, [period, format, setFormat, setRating]);


  useEffect(() => {
    let isCancelled = false;


    setDetails(null);
    setExpanded(new Set());
    chunkingRef.current += 1;
    setDetailsError(false);
    setMetagame(null);
    
    if (period && format && rating && formats[format] && formats[format].includes(rating)) {
      setLoading(true);
      setError(null);
      const fetchStartTime = Date.now();

      Promise.all([getStats(period, format, rating), getViability(period, format, rating), getLeads(period, format, rating), getMetagame(period, format, rating), getTotalBattles(period, format, rating)])
        .then(([statsData, viabilityData, leadsData, metagameData, battlesCount]) => {
          if (isCancelled) return;
          
          setMetagame(metagameData);
          setTotalBattles(battlesCount || 0);
          
          const leadsMap = {};
          leadsData.forEach(lead => {
            leadsMap[lead.pokemon] = lead.leadPercent;
          });

          const mergedStats = statsData.map(stat => ({
            ...stat,
            viability: viabilityData[stat.pokemon] || null,
            leadPercent: leadsMap[stat.pokemon] || '0.000%'
          }));
          
          setStats(mergedStats);
          
          const params = new URLSearchParams(window.location.search);
          if (params.get('expand') === 'all') {
            setExpanded(new Set(mergedStats.map(s => s.pokemon)));
          }
          
          const elapsed = Date.now() - fetchStartTime;
          const minSkeletonTime = 300; // 300ms sweet spot to ensure silky smooth transitions on cache hits
          const delay = Math.max(0, minSkeletonTime - elapsed);

          setTimeout(() => {
            if (!isCancelled) setLoading(false);
          }, delay);
          

          setLoadingDetails(true);
          getDetails(period, format, rating)
            .then(detailsData => {
              if (isCancelled) return;
              setDetails(detailsData);
              setLoadingDetails(false);
            })
            .catch(err => {
              if (isCancelled) return;
              console.error("Failed to prefetch details", err);
              setDetailsError(true);
              setLoadingDetails(false);
            });
        })
        .catch(err => {
          if (isCancelled) return;
          setError(err.message);
          setLoading(false);
        });
    } else if (formats[format] && !formats[format].includes(rating)) {

      setRating(formats[format][0]);
    }

    return () => {
      isCancelled = true;
    };
  }, [period, format, rating, formats, setRating]);

  const fetchDetailsIfNeeded = () => {
    if (!details && !loadingDetails) {
      setLoadingDetails(true);
      setDetailsError(false);
      getDetails(period, format, rating)
        .then(data => {
          setDetails(data);
          setLoadingDetails(false);
        })
        .catch(err => {
          console.error("Failed to fetch detailed stats", err);
          setDetailsError(true);
          setLoadingDetails(false);
        });
    }
  };

  const toggleDetails = (pokemon) => {
    setExpanded(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(pokemon)) {
        newExpanded.delete(pokemon);
      } else {
        newExpanded.add(pokemon);
      }
      return newExpanded;
    });
    fetchDetailsIfNeeded();
  };

  const expandAll = () => {
    if (stats) {
      chunkingRef.current += 1;
      const currentChunkId = chunkingRef.current;
      
      const allPokemons = stats.map(s => s.pokemon);
      let currentIndex = 0;
      const chunkSize = 30;
      
      const processChunk = () => {
        if (chunkingRef.current !== currentChunkId) return;
        
        const chunk = allPokemons.slice(currentIndex, currentIndex + chunkSize);
        if (chunk.length === 0) return;
        
        setExpanded(prev => {
          const next = new Set(prev);
          chunk.forEach(p => next.add(p));
          return next;
        });
        
        currentIndex += chunkSize;
        if (currentIndex < allPokemons.length) {
          setTimeout(processChunk, 16);
        }
      };
      
      processChunk();
      fetchDetailsIfNeeded();
    }
  };

  const collapseAll = () => {
    chunkingRef.current += 1;
    setExpanded(new Set());
  };

  return {
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
  };
}
