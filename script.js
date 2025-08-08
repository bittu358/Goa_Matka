// ===== Replace with your own published Google Sheet CSV lin

document.addEventListener("DOMContentLoaded", function () {
  const csvFile = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSWT5c0Ny9m7CSPhv5Y6gRpqL6l9GRul4KXKNELYRp0AK-GflTPbAMZ0_FqjrQdLsFudsoRE5mhP22d/pub?output=csv"; 

  fetch(csvFile)
    .then(res => res.text())
    .then(text => {
      const rows = parseCSV(text);

      // Apply rules and group by date
      const groupedData = rows.reduce((acc, row) => {
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
    })
    .catch(err => console.error("Error fetching CSV:", err));

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

        // Create a new date-section for each day
        const dateSection = document.createElement("div");
        dateSection.classList.add("date-section");

        const dateHeader = document.createElement("h3");
        dateHeader.classList.add("date-header");
        dateHeader.textContent = date; // You might need to add the day of the week here

        const table = document.createElement("table");
        table.classList.add("result-table");

        // Create table header (Time row)
        const timeRow = document.createElement("tr");
        timeRow.classList.add("timerow");
        dailyData.forEach(row => {
          const th = document.createElement("th");
          th.textContent = row.Time;
          timeRow.appendChild(th);
        });

        // Create table body (Number & Digit row)
        const numberRow = document.createElement("tr");
        numberRow.classList.add("number-row");
        dailyData.forEach(row => {
          const td = document.createElement("td");
          td.innerHTML = `${row.Number}<br>${row.Digit}`;
          numberRow.appendChild(td);
        });

        // Append rows to table and table to section
        const tbody = document.createElement("tbody");
        tbody.appendChild(timeRow);
        tbody.appendChild(numberRow);
        table.appendChild(tbody);

        dateSection.appendChild(dateHeader);
        dateSection.appendChild(table);

        container.appendChild(dateSection);
      }
    }
  }
});