import SmogonWorker from './worker.js?worker';

const BASE_URL = 'https://www.smogon.com/stats/';
const CACHE_NAME = 'smogon-immutable-v3';

const worker = new SmogonWorker();
let nextId = 1;
const workerCallbacks = new Map();

worker.onmessage = (e) => {
  const { id, result, error } = e.data;
  const cb = workerCallbacks.get(id);
  if (cb) {
    if (error) cb.reject(new Error(error));
    else cb.resolve(result);
    workerCallbacks.delete(id);
  }
};

function execWorker(type, payload) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    workerCallbacks.set(id, { resolve, reject });
    worker.postMessage({ id, type, payload });
  });
}

const PRIMARY_API = 'https://api.smogonstats.eu.cc';
const LOCAL_API = (typeof window !== 'undefined' && window.location.hostname !== 'smogonstats.eu.cc')
  ? `http://${window.location.hostname}:9000`
  : 'https://api.smogonstats.eu.cc';

const PUBLIC_PROXIES = [
  `${PRIMARY_API}/?url=`
];

const memoryCache = new Map();
const inflightRequests = new Map();

async function fetchApi(endpoint) {
  try {
    const res = await fetch(`${PRIMARY_API}${endpoint}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn(`Primary API fetch failed for ${endpoint}, trying local fallback...`, e);
  }
  if (LOCAL_API !== PRIMARY_API) {
    try {
      const res = await fetch(`${LOCAL_API}${endpoint}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error(`Local API fallback fetch failed for ${endpoint}:`, e);
    }
  }
  return null;
}

async function getText(targetUrl, isImmutable = false) {
  if (memoryCache.has(targetUrl)) {
    return memoryCache.get(targetUrl);
  }

  if (inflightRequests.has(targetUrl)) {
    return inflightRequests.get(targetUrl);
  }

  const fetchPromise = (async () => {
    if (isImmutable && 'caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(targetUrl);
        if (cachedResponse) {
          let text;
          if (cachedResponse.headers.get('Content-Type') === 'application/gzip') {
            const decompressedStream = cachedResponse.body.pipeThrough(new DecompressionStream('gzip'));
            text = await new Response(decompressedStream).text();
          } else {
            text = await cachedResponse.text();
          }
          memoryCache.set(targetUrl, text);
          return text;
        }
      } catch (e) {
        console.warn('Cache API error:', e);
      }
    }

    let text = null;

    const runProxyFetch = async (proxy, timeoutMs) => {
      const fetchUrl = `${proxy}${encodeURIComponent(targetUrl)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
        const response = await fetch(fetchUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const fetchedText = await response.text();
        
        if (fetchedText.includes('"error":')) {
           try {
             const jsonError = JSON.parse(fetchedText);
             if (jsonError.error) throw new Error(jsonError.error);
           } catch(e) {}
        }
        
        if (targetUrl.endsWith('.txt')) {
          if (fetchedText.trim().startsWith('<')) {
            throw new Error("Proxy returned HTML instead of text data");
          }
          if (fetchedText.trim().length === 0) {
            throw new Error("Proxy returned an empty payload");
          }
          if (!fetchedText.includes('|')) {
            throw new Error("Proxy returned invalid Smogon text data");
          }
        }
        
        return fetchedText;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    };

    try {
      const publicPromises = PUBLIC_PROXIES.map(proxy => runProxyFetch(proxy, 5000));
      text = await Promise.any(publicPromises);
    } catch (publicError) {
      throw new Error(`Failed to fetch data from Smogon using public proxies.`);
    }
    
    if (isImmutable && 'caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        let cacheResponse;
        
        if ('CompressionStream' in window) {
          const compressedStream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
          cacheResponse = new Response(compressedStream, {
            headers: { 'Content-Type': 'application/gzip' }
          });
        } else {
          cacheResponse = new Response(text, {
            headers: { 'Content-Type': 'text/plain' }
          });
        }
        
        await cache.put(targetUrl, cacheResponse);
      } catch (e) {
        console.warn('Cache API put error:', e);
      }
    }
    
    memoryCache.set(targetUrl, text);
    return text;
  })();
  
  inflightRequests.set(targetUrl, fetchPromise);
  try {
    const result = await fetchPromise;
    return result;
  } finally {
    inflightRequests.delete(targetUrl);
  }
}

export async function getDir(path = '', isImmutable = false) {
  try {
    const targetUrl = BASE_URL + path;
    const html = await getText(targetUrl, isImmutable);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = Array.from(doc.querySelectorAll('a'))
      .map(a => a.getAttribute('href'))
      .filter(href => href !== '../' && href !== '/');
      
    return links.map(link => link.replace(/\/$/, ''));
  } catch (error) {
    console.error('Error fetching directory:', error);
    return [];
  }
}

export async function getMonths() {
  const cacheKey = 'months';
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);
  if (inflightRequests.has(cacheKey)) return inflightRequests.get(cacheKey);
  
  const fetchPromise = (async () => {
    const json = await fetchApi('/api/months');
    if (json && Array.isArray(json)) {
      memoryCache.set(cacheKey, json);
      return json;
    }
    return [];
  })();
  
  inflightRequests.set(cacheKey, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    inflightRequests.delete(cacheKey);
  }
}

export async function getFormats(month) {
  const cacheKey = `formats-${month}`;
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);
  if (inflightRequests.has(cacheKey)) return inflightRequests.get(cacheKey);
  
  const fetchPromise = (async () => {
    const json = await fetchApi(`/api/formats?month=${month}`);
    if (json && typeof json === 'object') {
      memoryCache.set(cacheKey, json);
      return json;
    }
    return {};
  })();

  inflightRequests.set(cacheKey, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    inflightRequests.delete(cacheKey);
  }
}

const parsedStatsCache = new Map();

export async function getStats(month, format, rating) {
  const cacheKey = `usage-${month}-${format}-${rating}`;
  
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  if (inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey);
  }

  const fetchPromise = (async () => {
    if ('caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(cacheKey);
        if (cachedResponse) {
          let jsonText;
          if (cachedResponse.headers.get('Content-Type') === 'application/gzip') {
            const decompressedStream = cachedResponse.body.pipeThrough(new DecompressionStream('gzip'));
            jsonText = await new Response(decompressedStream).text();
          } else {
            jsonText = await cachedResponse.text();
          }
          const json = JSON.parse(jsonText);
          memoryCache.set(cacheKey, json);
          return json;
        }
      } catch (e) {
        console.warn('Cache API error:', e);
      }
    }
    
    const json = await fetchApi(`/api/usage?month=${month}&format=${format}&rating=${rating}`);
    if (json) {
      if ('caches' in window) {
        try {
          const cache = await caches.open(CACHE_NAME);
          const jsonString = JSON.stringify(json);
          
          try {
            const compressedStream = new Blob([jsonString]).stream().pipeThrough(new CompressionStream('gzip'));
            const cacheResponse = new Response(compressedStream, {
              headers: { 'Content-Type': 'application/gzip' }
            });
            await cache.put(cacheKey, cacheResponse);
          } catch (e) {
            const uncompressedResponse = new Response(jsonString, {
              headers: { 'Content-Type': 'application/json' }
            });
            await cache.put(cacheKey, uncompressedResponse);
          }
        } catch (e) {
          console.warn('Cache API put error:', e);
        }
      }
      
      memoryCache.set(cacheKey, json);
      return json;
    }
    return [];
  })();

  inflightRequests.set(cacheKey, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    inflightRequests.delete(cacheKey);
  }
}

export function getDetails(month, format, rating) {
  const cacheKey = `moveset-${month}/${format}-${rating}`;
  if (parsedStatsCache.has(cacheKey)) {
    return parsedStatsCache.get(cacheKey);
  }

  const promise = (async () => {
    try {
      const fileName = `${format}-${rating}.txt`;
      const targetUrl = `${BASE_URL}${month}/moveset/${fileName}`;
      
      const text = await getText(targetUrl, true);
      return await execWorker('parseMoveset', text);
    } catch (error) {
      parsedStatsCache.delete(cacheKey);
      console.error('Error fetching detailed stats:', error);
      throw error;
    }
  })();
  
  parsedStatsCache.set(cacheKey, promise);
  return promise;
}

export async function getViability(month, format, rating) {
  const cacheKey = `viability-${month}-${format}-${rating}`;
  
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);
  if (inflightRequests.has(cacheKey)) return inflightRequests.get(cacheKey);

  const fetchPromise = (async () => {
    const json = await fetchApi(`/api/viability?month=${month}&format=${format}&rating=${rating}`);
    if (json) {
      memoryCache.set(cacheKey, json);
      return json;
    }
    return {};
  })();

  inflightRequests.set(cacheKey, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    inflightRequests.delete(cacheKey);
  }
}

export async function getTotalBattles(month, format, rating) {
  const cacheKey = `format-stats-${month}-${format}-${rating}`;
  
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey).totalBattles || 0;
  if (inflightRequests.has(cacheKey)) {
    const res = await inflightRequests.get(cacheKey);
    return (res && res.totalBattles) || 0;
  }

  const fetchPromise = (async () => {
    const json = await fetchApi(`/api/format-stats?month=${month}&format=${format}&rating=${rating}`);
    if (json) {
      memoryCache.set(cacheKey, json);
      return json.totalBattles || 0;
    }
    return 0;
  })();

  inflightRequests.set(cacheKey, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    inflightRequests.delete(cacheKey);
  }
}

export async function getLeads(month, format, rating) {
  const cacheKey = `leads-${month}-${format}-${rating}`;
  
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);
  if (inflightRequests.has(cacheKey)) return inflightRequests.get(cacheKey);

  const fetchPromise = (async () => {
    const json = await fetchApi(`/api/leads?month=${month}&format=${format}&rating=${rating}`);
    if (json && Array.isArray(json)) {
      memoryCache.set(cacheKey, json);
      return json;
    }
    return [];
  })();

  inflightRequests.set(cacheKey, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    inflightRequests.delete(cacheKey);
  }
}

export async function getMetagame(month, format, rating) {
  const cacheKey = `metagame-${month}-${format}-${rating}`;
  
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);
  if (inflightRequests.has(cacheKey)) return inflightRequests.get(cacheKey);

  const fetchPromise = (async () => {
    const json = await fetchApi(`/api/metagame?month=${month}&format=${format}&rating=${rating}`);
    if (json) {
      memoryCache.set(cacheKey, json);
      return json;
    }
    return { stalliness: 0, playstyles: {} };
  })();

  inflightRequests.set(cacheKey, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    inflightRequests.delete(cacheKey);
  }
}
