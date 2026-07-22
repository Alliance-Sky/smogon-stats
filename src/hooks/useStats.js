import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMonths, getFormats, getStats, getDetails } from '../utils/api';

export function useStats(period, format, rating) {
  const navigate = useNavigate();


  const [months, setMonths] = useState([]);
  const [formats, setFormats] = useState({});
  

  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  const [details, setDetails] = useState(null);
  const [expanded, setExpanded] = useState(null);
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
          navigate(`/stats/${period}/${firstFormat}/${firstRating}`, { replace: true });
        }
      });
    }
    return () => { isCancelled = true; };
  }, [period, navigate, format]);


  useEffect(() => {
    let isCancelled = false;


    setDetails(null);
    setExpanded(null);
    setDetailsError(false);
    
    if (period && format && rating && formats[format] && formats[format].includes(rating)) {
      setLoading(true);
      setError(null);
      getStats(period, format, rating)
        .then(data => {
          if (isCancelled) return;
          setStats(data);
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

      navigate(`/stats/${period}/${format}/${formats[format][0]}`, { replace: true });
    }

    return () => {
      isCancelled = true;
    };
  }, [period, format, rating, formats, navigate]);

  const toggleDetails = (pokemon) => {
    if (expanded === pokemon) {
      setExpanded(null);
      return;
    }
    
    setExpanded(pokemon);
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
    toggleDetails
  };
}
