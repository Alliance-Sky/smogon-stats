import SmogonWorker from './worker.js?worker';

const BASE_URL = 'https://www.smogon.com/stats/';
const CACHE_NAME = 'smogon-immutable-v4';

// Cleanup old caches automatically
if (typeof caches !== 'undefined') {
  caches.keys().then(keys => {
    for (const key of keys) {
      if (key.startsWith('smogon-') && key !== CACHE_NAME) {
        caches.delete(key).catch(console.error);
      }
    }
  }).catch(console.error);
}

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
      
      let jsonPayload = null;
      try {
          jsonPayload = JSON.parse(fetchedText);
      } catch (e) {}
      
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
        if (!fetchedText.includes('|') && (!jsonPayload || Object.keys(jsonPayload).length === 0)) {
           throw new Error("Invalid moveset response format from proxy");
        }
        
        if (jsonPayload && !jsonPayload.error) {
            return jsonPayload;
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
  
  return text;
}

export async function getMonths() {
  const json = await fetchApi('/api/months');
  if (json && Array.isArray(json)) {
    return json;
  }
  return [];
}

const tierOrder = ['ou', 'ubers', 'uu', 'ru', 'nu', 'pu', 'lc', 'monotype', 'doublesou', 'randombattle'];

function getTierRank(formatStr) {
  const clean = formatStr.replace(/^gen\d+/i, '').toLowerCase();
  const idx = tierOrder.indexOf(clean);
  return idx !== -1 ? idx : 999;
}

function sortFormatsObject(formatsObj) {
  const getGenNum = (str) => {
    const match = str.match(/^gen(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  const keys = Object.keys(formatsObj).sort((a, b) => {
    const genA = getGenNum(a);
    const genB = getGenNum(b);
    if (genA !== genB) {
      return genB - genA;
    }
    const rankA = getTierRank(a);
    const rankB = getTierRank(b);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    return a.localeCompare(b);
  });

  const sortedObj = {};
  for (const k of keys) {
    sortedObj[k] = formatsObj[k];
  }
  return sortedObj;
}

export async function getFormats(month) {
  const json = await fetchApi(`/api/formats?month=${month}`);
  if (json && typeof json === 'object') {
    const sorted = sortFormatsObject(json);
    return sorted;
  }
  return {};
}

export async function getStats(month, format, rating) {
  const cacheKey = `usage-${month}-${format}-${rating}`;
  
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
        return JSON.parse(jsonText);
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
    return json;
  }
  return [];
}

export async function getDetails(month, format, rating) {
  const fileName = `${format}-${rating}.txt`;
  const targetUrl = `${BASE_URL}${month}/moveset/${fileName}?v=2`;
  
  const text = await getText(targetUrl, true);
  if (typeof text === 'object' && text !== null) {
      return text;
  }
  return await execWorker('parseMoveset', text);
}

export async function getViability(month, format, rating) {
  const json = await fetchApi(`/api/viability?month=${month}&format=${format}&rating=${rating}`);
  if (json) {
    return json;
  }
  return {};
}

export async function getTotalBattles(month, format, rating) {
  const json = await fetchApi(`/api/format-stats?month=${month}&format=${format}&rating=${rating}`);
  if (json) {
    return json.totalBattles || 0;
  }
  return 0;
}

export async function getLeads(month, format, rating) {
  const json = await fetchApi(`/api/leads?month=${month}&format=${format}&rating=${rating}`);
  if (json && Array.isArray(json)) {
    return json;
  }
  return [];
}

export async function getMetagame(month, format, rating) {
  const json = await fetchApi(`/api/metagame?month=${month}&format=${format}&rating=${rating}`);
  if (json) {
    return json;
  }
  return { stalliness: 0, playstyles: {} };
}

export async function getTrend(format, rating, pokemonList, months = 12) {
  const pokemonQuery = pokemonList.join(',');
  const json = await fetchApi(`/api/trend?format=${format}&rating=${rating}&pokemon=${encodeURIComponent(pokemonQuery)}&months=${months}`);
  if (json) {
    return json;
  }
  return {};
}
