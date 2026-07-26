import SmogonWorker from './worker.js?worker';

const BASE_URL = 'https://www.smogon.com/stats/';

// Cleanup old legacy caches to free up disk space for returning users
if (typeof caches !== 'undefined') {
  caches.keys().then(keys => {
    for (const key of keys) {
      if (key.startsWith('smogon-')) {
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

async function getText(targetUrl) {
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
      
      if (new URL(targetUrl).pathname.endsWith('.txt')) {
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
  
  return text;
}

let initDataCache = null;
let initDataPromise = null;

export async function getInit() {
  if (initDataCache) return initDataCache;
  if (!initDataPromise) {
    initDataPromise = fetchApi('/api/v3/init').then(json => {
      if (json) {
        if (json.stats && Array.isArray(json.stats)) {
          json.stats = json.stats.map(tuple => ({
            rank: tuple[0],
            pokemon: tuple[1],
            usagePercent: tuple[2],
            leadPercent: tuple[3],
            viability: tuple[4]
          }));
        }
        initDataCache = json;
        return json;
      }
      return null;
    });
  }
  return await initDataPromise;
}

export async function getMonths() {
  const init = await getInit();
  if (init && init.months) {
    return init.months;
  }
  const json = await fetchApi('/api/months');
  if (json && Array.isArray(json)) {
    return json;
  }
  return [];
}

export async function getFormats(month) {
  const init = await getInit();
  if (init && init.defaultMonth === month && init.formats) {
    const sortedObj = {};
    for (const item of init.formats) {
      sortedObj[item.format] = item.ratings;
    }
    return sortedObj;
  }
  const json = await fetchApi(`/api/v2/formats?month=${month}`);
  if (json && Array.isArray(json)) {
    const sortedObj = {};
    for (const item of json) {
      sortedObj[item.format] = item.ratings;
    }
    return sortedObj;
  }
  return {};
}

export async function getStats(month, format, rating) {
  const init = await getInit();
  if (init && init.defaultMonth === month && init.defaultFormat === format && init.defaultRating === rating && init.stats) {
    return init.stats;
  }
  const json = await fetchApi(`/api/v3/stats?month=${month}&format=${format}&rating=${rating}`);
  if (json && Array.isArray(json)) {
    return json.map(tuple => ({
      rank: tuple[0],
      pokemon: tuple[1],
      usagePercent: tuple[2],
      leadPercent: tuple[3],
      viability: tuple[4]
    }));
  }
  return [];
}

export async function getDetails(month, format, rating) {
  const fileName = `${format}-${rating}.txt`;
  const targetUrl = `${BASE_URL}${month}/moveset/${fileName}?v=2`;
  
  const text = await getText(targetUrl);
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
