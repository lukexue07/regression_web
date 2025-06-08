function addRow() {
    const tbody = document.querySelector('#data-table tbody');
    const header = document.getElementById('header-row');
    const newRow = tbody.insertRow();
    for (let i = 0; i < header.cells.length; i++) {
        const cell = newRow.insertCell();
        const input = document.createElement('input');
        input.type = 'number';
        cell.appendChild(input);
        if (i === header.cells.length - 1) {
        cell.classList.add('y-column');
        }
    }
    saveTableToLocalStorage();
}

function addColumn() {
    const table = document.getElementById('data-table');
    const header = document.getElementById('header-row');
    const newFeatureCount = header.cells.length - 1;

    const newHeader = document.createElement('th');
    newHeader.innerText = `X${newFeatureCount + 1}`;
    header.insertBefore(newHeader, header.lastElementChild);

    for (let row of table.tBodies[0].rows) {
        const newCell = row.insertCell(row.cells.length - 1);
        const input = document.createElement('input');
        input.type = 'number';
        newCell.appendChild(input);
    }
    saveTableToLocalStorage();
}

function clearTable() {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';
    const row = tbody.insertRow();
    const header = document.getElementById('header-row');
    for (let i = 0; i < header.cells.length; i++) {
        const cell = row.insertCell();
        const input = document.createElement('input');
        input.type = 'number';
        cell.appendChild(input);
        if (i === header.cells.length - 1) cell.classList.add('y-column');
    }
    localStorage.removeItem('tableData');
    document.getElementById('result').innerText = 'No coefficients yet.';
}

async function submitData() {
    const table = document.getElementById('data-table');
    const X = [], Y = [];

    for (let row of table.tBodies[0].rows) {
        const inputs = row.querySelectorAll('input');
        const values = Array.from(inputs).map(input => parseFloat(input.value));
        if (values.some(v => isNaN(v))) continue;

        X.push(values.slice(0, -1));
        Y.push(values[values.length - 1]);
    }

    try {
        const response = await fetch('/regress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ X, Y })
        });

        const result = await response.json();
        document.getElementById('result').innerText =
        'Coefficients: ' + result.coefficients.join(', ');
    } catch (error) {
        document.getElementById('result').innerText = 'Error: ' + error.message;
    }
}

function saveTableToLocalStorage() {
    const table = document.getElementById('data-table');
    const headers = Array.from(table.tHead.rows[0].cells).map(cell => cell.innerText);
    const rows = [];
    for (let row of table.tBodies[0].rows) {
        const inputs = row.querySelectorAll('input');
        const values = Array.from(inputs).map(input => input.value);
        rows.push(values);
    }
    localStorage.setItem('tableData', JSON.stringify({ headers, rows }));
}

function loadTableFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem('tableData'));
    if (!data) return;

    const headerRow = document.getElementById('header-row');
    headerRow.innerHTML = '';
    for (let i = 0; i < data.headers.length; i++) {
        const th = document.createElement('th');
        th.innerText = data.headers[i];
        headerRow.appendChild(th);
    }

    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';
    for (let rowData of data.rows) {
        const row = tbody.insertRow();
        for (let i = 0; i < rowData.length; i++) {
        const cell = row.insertCell();
        const input = document.createElement('input');
        input.type = 'number';
        input.value = rowData[i];
        cell.appendChild(input);
        if (i === rowData.length - 1) cell.classList.add('y-column');
        }
    }
}

window.addEventListener('load', loadTableFromLocalStorage);
window.addEventListener('beforeunload', saveTableToLocalStorage);
