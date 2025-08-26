// ===== Replace with your own published Google Sheet CSV lin

document.addEventListener("DOMContentLoaded", function () {
  const csvFile = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRagEtBc6K8tEBZgukYCTyFWUlip_8JYWGMm4XXblRk8HJgcDrGkA21N6uDVKzfwgnKTeLjUMfPRsK/pub?output=csv";


// ===== Replace with your own published Google Sheet CSV link



  let allRows = []; // Store the fetched data here
  const searchInput = document.getElementById("search-input");
  
  // Collapsible "How to Play" section
  const collapsible = document.querySelector(".collapsible-button");
  if (collapsible) {
    collapsible.addEventListener("click", function() {
      this.classList.toggle("active");
      const content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  }

  const resultTimes = [
    "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM",
    "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
  ];
  
  function getNextResultTime() {
    const now = new Date();
    const nowTime = now.getHours() * 60 + now.getMinutes();
    const today = now.getDate();

    for (const timeStr of resultTimes) {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
    
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        }
        if (period === 'AM' && hours === 12) {
          hours = 0;
        }
    
        const resultMinutes = hours * 60 + minutes;

        // Found a result time that is still in the future for today
        if (resultMinutes > nowTime) {
          return new Date(now.getFullYear(), now.getMonth(), today, hours, minutes);
        }
    }
    
    // No more results for today. Set time for tomorrow at 10 AM.
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10:00 AM
    return tomorrow;
  }

  function updateClock() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    const currentTimeElement = document.getElementById('current-time');
    if(currentTimeElement) {
      currentTimeElement.textContent = now.toLocaleDateString('en-US', options);
    }

    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
      const nextResult = getNextResultTime();
      
      // If the current date is different from the next result date, it means we're waiting for tomorrow
      if (now.getDate() !== nextResult.getDate()) {
        countdownElement.textContent = "Results closed for today. Resuming tomorrow at 10 AM.";
      } else {
        const timeRemainingMs = nextResult.getTime() - now.getTime();
        const hours = Math.floor(timeRemainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemainingMs % (1000 * 60)) / 1000);
        
        countdownElement.textContent = `Next Result in: ${hours}h ${minutes}m ${seconds}s`;
      }
    }
  }

  function fetchAndRenderData() {
    fetch(csvFile)
      .then(res => res.text())
      .then(text => {
        allRows = parseCSV(text);
        filterAndRender();
      })
      .catch(err => console.error("Error fetching CSV:", err));
  }

  function filterAndRender() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    let filteredRows = allRows;

    if (searchTerm) {
      filteredRows = allRows.filter(row => {
        const number = row.Number && row.Number.trim().toLowerCase();
        const digit = row.Digit && row.Digit.trim().toLowerCase();
        return (number && number.includes(searchTerm)) || (digit && digit.includes(searchTerm));
      });
    }

    const groupedData = filteredRows.reduce((acc, row) => {
      const date = row.Date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        Time: row.Time,
        Number: row.Number && row.Number.trim() !== "" ? row.Number : "***",
        Digit: row.Digit && row.Digit.trim() !== "" ? row.Digit : "*"
      });
      return acc;
    }, {});

    renderResults(groupedData);
  }

  // Simple CSV parser (expects first row as headers)
  function parseCSV(str) {
    const lines = str.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] ? values[i].trim() : "";
      });
      return obj;
    });
  }

  function renderResults(groupedData) {
    const container = document.getElementById("results");
    container.innerHTML = "";

    // Loop through each date group
    for (const date in groupedData) {
      if (groupedData.hasOwnProperty(date)) {
        const dailyData = groupedData[date];

        const dateSection = document.createElement("div");
        dateSection.classList.add("date-section");

        const dateHeader = document.createElement("h3");
        dateHeader.classList.add("date-header");
        dateHeader.textContent = date;

        const table = document.createElement("table");
        table.classList.add("result-table");

        const timeRow = document.createElement("tr");
        timeRow.classList.add("timerow");
        dailyData.forEach(row => {
          const th = document.createElement("th");
          th.textContent = row.Time;
          timeRow.appendChild(th);
        });

        const numberRow = document.createElement("tr");
        numberRow.classList.add("number-row");
        dailyData.forEach(row => {
          const td = document.createElement("td");
          td.innerHTML = `${row.Number}<br>${row.Digit}`;
          numberRow.appendChild(td);
        });

        const tbody = document.createElement("tbody");
        tbody.appendChild(timeRow);
        tbody.appendChild(numberRow);
        table.appendChild(tbody);

        dateSection.appendChild(dateHeader);
        dateSection.appendChild(table);
        container.appendChild(dateSection);
      }
    }
    
    // Find the last row of the last table and apply the new class for highlighting
    const allTables = container.querySelectorAll('.result-table');
    if (allTables.length > 0) {
      const lastTable = allTables[allTables.length - 1];
      const lastResultCell = lastTable.querySelector('tbody tr:last-child td:last-child');
      if (lastResultCell) {
        lastResultCell.classList.add('new-result');
      }
    }
  }

  // Event listener for the search input
  if (searchInput) {
    searchInput.addEventListener('input', filterAndRender);
  }

  // Initial call to fetch data on page load
  fetchAndRenderData();

  // Set up the interval to fetch and render data every 30 seconds
  setInterval(fetchAndRenderData, 30000);

  // Initial call to update clock
  updateClock();
  
  // Update the clock every second
  setInterval(updateClock, 1000);
});
