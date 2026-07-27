import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getMonths, getFormats, getStats, getDetails, getMetagame, getTotalBattles } from '../utils/api';

export function useStats(period, format, rating, setFormat, setRating) {
  const { data: months = [] } = useQuery({
    queryKey: ['months'],
    queryFn: getMonths
  });

  const { data: formats = {} } = useQuery({
    queryKey: ['formats', period],
    queryFn: () => getFormats(period),
    enabled: !!period,
    placeholderData: keepPreviousData
  });

  useEffect(() => {
    if (period && formats && Object.keys(formats).length > 0) {
      if (!formats[format]) {
        const firstFormat = Object.keys(formats)[0];
        const firstRating = formats[firstFormat][0];
        setFormat(firstFormat);
        setRating(firstRating);
      } else if (!formats[format].includes(rating)) {
        setRating(formats[format][0]);
      }
    }
  }, [period, format, rating, formats, setFormat, setRating]);

  const isValidCombo = !!(period && format && rating && formats[format]?.includes(rating));

  const { data: statsData, isPending: isStatsPending, isFetching: isStatsFetching, error: statsError } = useQuery({
    queryKey: ['stats', period, format, rating],
    queryFn: () => getStats(period, format, rating),
    enabled: isValidCombo,
    placeholderData: keepPreviousData
  });

  const { data: metagame = null, isPending: isMetagamePending, isFetching: isMetagameFetching, error: metagameError } = useQuery({
    queryKey: ['metagame', period, format, rating],
    queryFn: () => getMetagame(period, format, rating),
    enabled: isValidCombo,
    placeholderData: keepPreviousData
  });

  const { data: totalBattles = 0, isPending: isTotalBattlesPending, isFetching: isTotalBattlesFetching, error: totalBattlesError } = useQuery({
    queryKey: ['totalBattles', period, format, rating],
    queryFn: () => getTotalBattles(period, format, rating),
    enabled: isValidCombo,
    placeholderData: keepPreviousData
  });

  const isAnyPending = isStatsPending || isMetagamePending || isTotalBattlesPending;
  const isAnyFetching = isStatsFetching || isMetagameFetching || isTotalBattlesFetching;
  const anyError = statsError || metagameError || totalBattlesError;

  const [details, setDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [detailsError, setDetailsError] = useState({});
  const [loadingAllDetails, setLoadingAllDetails] = useState(false);

  useEffect(() => {
    setDetails({});
    setLoadingDetails({});
    setDetailsError({});
    setLoadingAllDetails(false);
  }, [period, format, rating]);

  const fetchDetailsIfNeeded = (pokemon) => {
    if (pokemon) {
      if (!details[pokemon] && !loadingDetails[pokemon] && !loadingAllDetails) {
        setLoadingDetails(prev => ({ ...prev, [pokemon]: true }));
        getDetails(period, format, rating, pokemon)
          .then(data => setDetails(prev => ({ ...prev, [pokemon]: data })))
          .catch(() => setDetailsError(prev => ({ ...prev, [pokemon]: true })))
          .finally(() => setLoadingDetails(prev => ({ ...prev, [pokemon]: false })));
      }
    } else {
      if (!loadingAllDetails) {
        setLoadingAllDetails(true);
        console.log("Fetching bulk details...");
        getDetails(period, format, rating)
          .then(data => {
            console.log("Bulk details fetched. Keys count:", data ? Object.keys(data).length : "null/undefined");
            if (data) setDetails(prev => ({ ...prev, ...data }));
          })
          .catch(err => console.error("Bulk details fetch error:", err))
          .finally(() => {
            setLoadingAllDetails(false);
            console.log("Bulk details fetch finished.");
          });
      }
    }
  };

  const stats = useMemo(() => {
    return statsData || null;
  }, [statsData]);

  const [expanded, setExpanded] = useState(new Set());
  const chunkingRef = useRef(0);

  useEffect(() => {
    setExpanded(new Set());
    chunkingRef.current += 1;
  }, [period, format, rating]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('expand') === 'all' && stats) {
        setExpanded(new Set(stats.map(s => s.pokemon)));
        if (Object.keys(details).length < stats.length) {
          fetchDetailsIfNeeded();
        }
    }
  
  }, [stats]);

  const toggleDetails = (pokemon) => {
    setExpanded(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(pokemon)) {
        newExpanded.delete(pokemon);
      } else {
        newExpanded.add(pokemon);
        fetchDetailsIfNeeded(pokemon);
      }
      return newExpanded;
    });
  };

  const expandAll = useCallback(() => {
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
      if (Object.keys(details).length < stats.length) {
        // use fetchDetailsIfNeeded from scope
        fetchDetailsIfNeeded();
      }
    }
  }, [stats, details]);

  const collapseAll = useCallback(() => {
    if (stats && expanded.size > 0) {
      chunkingRef.current += 1;
      const currentChunkId = chunkingRef.current;
      
      const expandedArray = Array.from(expanded);
      let currentIndex = 0;
      const chunkSize = 30;
      
      const processChunk = () => {
        if (chunkingRef.current !== currentChunkId) return;
        
        const chunk = expandedArray.slice(currentIndex, currentIndex + chunkSize);
        if (chunk.length === 0) {
          setExpanded(new Set());
          return;
        }
        
        setExpanded(prev => {
          const next = new Set(prev);
          chunk.forEach(p => next.delete(p));
          return next;
        });
        
        currentIndex += chunkSize;
        if (currentIndex < expandedArray.length) {
          setTimeout(processChunk, 16);
        } else {
          setExpanded(new Set());
        }
      };
      
      processChunk();
    } else {
      chunkingRef.current += 1;
      setExpanded(new Set());
    }
  }, [stats, expanded]);

  const [loading, setLoading] = useState(false);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (!isAnyFetching) {
        return;
      }
    }

    if (isAnyFetching) {
      setLoading(true);
    } else {
      
      const timer = setTimeout(() => {
        setLoading(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isAnyFetching]);

  const error = anyError ? anyError.message : null;

  return {
    months,
    formats,
    stats,
    metagame,
    totalBattles,
    loading,
    isFetching: isAnyFetching,
    error,
    details,
    expanded,
    setExpanded,
    loadingDetails,
    loadingAllDetails,
    detailsError,
    toggleDetails,
    expandAll,
    collapseAll
  };
}
