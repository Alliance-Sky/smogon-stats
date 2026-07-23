import { useState, useEffect } from 'react';

import { getMonths, getFormats, getStats, getDetails, getViability } from '../utils/api';

export function useStats(period, format, rating, setFormat, setRating) {

  const [months, setMonths] = useState([]);
  const [formats, setFormats] = useState({});
  

  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  const [details, setDetails] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(false);


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
    setDetailsError(false);
    
    if (period && format && rating && formats[format] && formats[format].includes(rating)) {
      setLoading(true);
      setError(null);
      Promise.all([getStats(period, format, rating), getViability(period, format, rating)])
        .then(([statsData, viabilityData]) => {
          if (isCancelled) return;
          
          const mergedStats = statsData.map(stat => ({
            ...stat,
            viability: viabilityData[stat.pokemon] || null
          }));
          
          setStats(mergedStats);
          setLoading(false);
          

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
    setExpanded(new Set(stats.map(s => s.pokemon)));
    fetchDetailsIfNeeded();
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  return {
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
  };
}
