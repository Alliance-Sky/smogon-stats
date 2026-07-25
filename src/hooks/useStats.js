import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMonths, getFormats, getStats, getDetails, getViability, getLeads, getMetagame, getTotalBattles } from '../utils/api';

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

  const { data: viabilityData = {}, isPending: isViabilityPending, error: viabilityError } = useQuery({
    queryKey: ['viability', period, format, rating],
    queryFn: () => getViability(period, format, rating),
    enabled: isValidCombo
  });

  const { data: leadsData = [], isPending: isLeadsPending, error: leadsError } = useQuery({
    queryKey: ['leads', period, format, rating],
    queryFn: () => getLeads(period, format, rating),
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

  const isAnyPending = isStatsPending || isViabilityPending || isLeadsPending || isMetagamePending || isTotalBattlesPending;
  const anyError = statsError || viabilityError || leadsError || metagameError || totalBattlesError;

  const { data: details, isFetching: loadingDetails, isError: detailsError, refetch: fetchDetails } = useQuery({
    queryKey: ['details', period, format, rating],
    queryFn: () => getDetails(period, format, rating),
    enabled: isValidCombo
  });

  const stats = useMemo(() => {
    if (!statsData) return null;
    const leadsMap = {};
    leadsData.forEach(lead => {
      leadsMap[lead.pokemon] = lead.leadPercent;
    });

    return statsData.map(stat => ({
      ...stat,
      viability: viabilityData[stat.pokemon] || null,
      leadPercent: leadsMap[stat.pokemon] || '0.000%'
    }));
  }, [statsData, viabilityData, leadsData]);

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
    }
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
    chunkingRef.current += 1;
    setExpanded(new Set());
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
