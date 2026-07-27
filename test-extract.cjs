const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');
const match = html.match(/window\.__REACT_QUERY_STATE__ = (\{.*\});/);
const state = JSON.parse(match[1]);

const queries = state.queries;
const statsQuery = queries.find(q => q.queryKey && q.queryKey[0] === 'stats');
if (statsQuery && statsQuery.queryKey.length >= 4) {
  console.log('Found:', {
    defaultMonth: statsQuery.queryKey[1],
    defaultFormat: statsQuery.queryKey[2],
    defaultRating: statsQuery.queryKey[3]
  });
} else {
  console.log('Not found');
}
