import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMonths, getFormats, getStats, getDetails, getMetagame, getTotalBattles } from '../utils/api';

export function useStats(period, format, rating, setFormat, setRating) {
  const { data: months = [] } = useQuery({
    queryKey: ['months'],
    queryFn: getMonths
  });

  const { data: formats = {} } = useQuery({
    queryKey: ['formats', period],
    queryFn: () => getFormats(period),
    enabled: !!period
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

  const { data: statsData, isPending: isStatsPending, error: statsError } = useQuery({
    queryKey: ['stats', period, format, rating],
    queryFn: () => getStats(period, format, rating),
    enabled: isValidCombo
  });



  const { data: metagame = null, isPending: isMetagamePending, error: metagameError } = useQuery({
    queryKey: ['metagame', period, format, rating],
    queryFn: () => getMetagame(period, format, rating),
    enabled: isValidCombo
  });

  const { data: totalBattles = 0, isPending: isTotalBattlesPending, error: totalBattlesError } = useQuery({
    queryKey: ['totalBattles', period, format, rating],
    queryFn: () => getTotalBattles(period, format, rating),
    enabled: isValidCombo
  });

  const isAnyPending = isStatsPending || isMetagamePending || isTotalBattlesPending;
  const anyError = statsError || metagameError || totalBattlesError;

  const { data: details, isFetching: loadingDetails, isError: detailsError, refetch: fetchDetails } = useQuery({
    queryKey: ['details', period, format, rating],
    queryFn: () => getDetails(period, format, rating),
    enabled: false
  });

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
        if (!details && !loadingDetails) {
          fetchDetails();
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  const fetchDetailsIfNeeded = () => {
    if (!details && !loadingDetails) {
      fetchDetails();
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
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (isAnyPending) {
      timer = setTimeout(() => {
        setLoading(true);
      }, 300);
    } else {
      setLoading(false);
    }
    return () => clearTimeout(timer);
  }, [isAnyPending]);

  const error = anyError ? anyError.message : null;

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
