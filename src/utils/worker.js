function parseStats(text) {
  const lines = text.split('\n');
  const data = [];
  
  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(' + ')) continue;
    if (lines[i].includes('Rank') && lines[i].includes('Pokemon')) continue;
    if (lines[i].trim().startsWith('|')) {
      startIndex = i;
      break;
    }
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('+') || line === '') continue; 
    
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 5) {
      const usagePercent = parts[3];
      if (parseFloat(usagePercent) > 0) {
        data.push({
          rank: parseInt(parts[1], 10),
          pokemon: parts[2],
          usagePercent
        });
      }
    }
  }
  
  return data;
}

function parseMoveset(text) {
  text = text.replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  const data = {};
  
  let currentPokemon = null;
  let currentSection = null;
  let pokemonData = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    

    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('+----------------------------------------+')) {
      if (i + 3 < lines.length && 
          lines[i+2].trim().startsWith('+----------------------------------------+') && 
          lines[i+3].trim().startsWith('| Raw count:')) {
         
         const nameLine = lines[i+1].trim();
         currentPokemon = nameLine.substring(1, nameLine.indexOf('|', 1)).trim();
         pokemonData = { Abilities: [], Items: [], Spreads: [], Moves: [], Counters: [], Teammates: [] };
         data[currentPokemon] = pokemonData;
         currentSection = null;
         i += 3; 
         continue;
      }
    }
    
    if (!currentPokemon) continue;
    
    if (trimmedLine.startsWith('+----------------------------------------+')) {
      currentSection = null;
      continue;
    }
    
    if (trimmedLine.startsWith('| Abilities')) { currentSection = 'Abilities'; continue; }
    if (trimmedLine.startsWith('| Items')) { currentSection = 'Items'; continue; }
    if (trimmedLine.startsWith('| Spreads')) { currentSection = 'Spreads'; continue; }
    if (trimmedLine.startsWith('| Moves')) { currentSection = 'Moves'; continue; }
    if (trimmedLine.startsWith('| Teammates')) { currentSection = 'Teammates'; continue; }
    if (trimmedLine.startsWith('| Checks and Counters')) { currentSection = 'Counters'; continue; }
    
    if (currentSection && pokemonData[currentSection]) {
      if (trimmedLine.startsWith('| ')) {
        const content = trimmedLine.substring(1).replace(/\|\s*$/, '').trim();
        if (currentSection === 'Counters') {
          if (content.startsWith('(')) continue;
          const match = content.match(/^(.+?)\s+([0-9.]+)\s*\(/);
          if (match) {
            const name = match[1].trim();
            const percent = match[2].trim();
            if (name !== 'Other' && name !== 'Empty' && parseFloat(percent) > 0) {
              pokemonData[currentSection].push({ name, percent });
            }
          }
        } else {
          const lastSpace = content.lastIndexOf(' ');
          if (lastSpace !== -1) {
            const name = content.substring(0, lastSpace).trim();
            const percent = content.substring(lastSpace + 1).trim();
            if (name !== 'Other' && name !== 'Empty' && parseFloat(percent) > 0) {
              pokemonData[currentSection].push({ name, percent });
            }
          }
        }
      }
    }
  }
  return data;
}

self.onmessage = function(e) {
  const { type, payload, id } = e.data;
  try {
    let result;
    if (type === 'parseStats') {
      result = parseStats(payload);
    } else if (type === 'parseMoveset') {
      result = parseMoveset(payload);
    }
    self.postMessage({ id, result });
  } catch (err) {
    self.postMessage({ id, error: err.message });
  }
};
