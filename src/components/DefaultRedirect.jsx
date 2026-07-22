import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getMonths, getFormats, getStats, getDetails } from '../utils/api';

export default function DefaultRedirect() {
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    async function fetchLatest() {

      const latestMonth = '2026-06';
      const defaultFormat = 'gen9ou';
      const defaultRating = '1760';
      setRedirectUrl(`/stats/${latestMonth}/${defaultFormat}/${defaultRating}`);
    }
    fetchLatest();
    return () => { isCancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="error-message" style={{ margin: '2rem auto', maxWidth: '600px', textAlign: 'center' }}>
        <h3>Error Loading Data</h3>
        <p>Could not determine the latest available stats.</p>
      </div>
    );
  }

  if (!redirectUrl) {
    return (
      <div className="loader-container" style={{ marginTop: '4rem' }}>
        <div className="spinner"></div>
        <div className="loading-text">Finding latest stats...</div>
      </div>
    );
  }

  return <Navigate to={redirectUrl} replace />;
}
