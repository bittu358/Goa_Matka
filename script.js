// Replace with your own published Google Sheet CSV link:
const SHEET_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSWT5c0Ny9m7CSPhv5Y6gRpqL6l9GRul4KXKNELYRp0AK-GflTPbAMZ0_FqjrQdLsFudsoRE5mhP22d/pub?output=csv';

function fetchSheetCSV(url) {
  return fetch(url)
    .then(r => {
      if (!r.ok) throw new Error('Failed to fetch: ' + r.status);
      return r.text();
    })
    .then(text => {
      const rows = text.trim().split('\n');
      return rows.map(row =>
        row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
            .map(cell => cell.replace(/^"|"$/g, '').trim())
      );
    });
}

function groupBy(arr, key) {
  let map = {};
  arr.forEach(item => {
    if (!map[item[key]]) map[item[key]] = [];
    map[item[key]].push(item);
  });
  return map;
}

function renderTables(data) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  const grouped = groupBy(data, 'Date');
  const dates = Object.keys(grouped).sort((a, b) => {
    const parse = d => d.split(/[\/-]/).reverse().join('-');
    return new Date(parse(b)) - new Date(parse(a));
  });

  // Match the format of your data exactly
  const times = [
    "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00",
    "17:00", "18:00", "19:00"
  ];

  dates.forEach(date => {
    const rows = grouped[date];
    const thead = '<tr class="timerow">' + times.map(t => `<th>${t}</th>`).join('') + '</tr>';
    
    const numberRow = '<tr class="number-row">' + times.map(time => {
      const found = rows.find(r => r.Time === time);
      return `<td>${found ? found.Number : ''}</td>`;
    }).join('') + '</tr>';

    const digitRow = '<tr class="digit-row">' + times.map(time => {
      const found = rows.find(r => r.Time === time);
      return `<td>${found ? found.Digit : ''}</td>`;
    }).join('') + '</tr>';

    const section = `
      <div class="date-section">
        <div class="date-header">${date}</div>
        <table class="result-table">
          <thead>${thead}</thead>
          <tbody>
            ${numberRow}
            ${digitRow}
          </tbody>
        </table>
      </div>
    `;
    resultsDiv.innerHTML += section;
  });
}

// Main execution
fetchSheetCSV(SHEET_CSV)
  .then(rows => {
    const headers = rows.shift();
    const data = rows.map(r => {
      let obj = {};
      headers.forEach((h, i) => obj[h.trim()] = r[i]);
      return obj;
    });
    renderTables(data);
  })
  .catch(err => {
    console.error('Error loading data:', err);
    document.getElementById('results').textContent = 'Failed to load data.';
  });
