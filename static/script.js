function addRow() 
{
    const table = document.getElementById('data-table'); //to declare a variable you would use let or const
    const newRow = table.insertRow();
    for (let i = 0; i < table.rows[0].cells.length; i++) 
    { //may need to change this cuz 3 cells per add row???
        const cell = newRow.insertCell(); //returns a reference to the newly created cell
        const input = document.createElement('input');
        input.type = 'number';
        if (i == table.rows[0].cells.length - 1)
            cell.classList.add("y-column");
        cell.appendChild(input);
    }

    updateTableSize();
}

function removeRow()
{
    const table = document.getElementById('data-table'); //to declare a variable you would use let or const
    if (table.rows.length > 1)
        table.deleteRow(-1);

    updateTableSize();
}

function addColumn() 
{
    const table = document.getElementById('data-table');
    for (let row of table.rows) 
    {//for each loop
        const newCell = row.insertCell(row.cells.length-1); //before the cell in that index, aka before the Y
        const input = document.createElement('input');
        input.type = 'number';
        newCell.appendChild(input);
    }

    const powers = document.getElementById('power-table');
    const n2 = powers.rows[0].insertCell(powers.rows[0].cells.length);
    const inp = document.createElement('input');
    inp.type = 'number';
    n2.appendChild(inp);

    updateTableSize();
}

function removeColumn()
{
    const table = document.getElementById('data-table');
    if (table.rows[0].cells.length > 2)
    {
        for (let row of table.rows) 
        {
            row.deleteCell(row.length-2);
        }
    }

    const powers = document.getElementById('power-table');
    if (powers.rows[0].cells.length > 1)
        powers.rows[0].deleteCell(powers.rows[0].cells.length-1);

    updateTableSize();
}

function generateGrid()
{
    const table = document.getElementById('data-table');
    table.innerHTML = '';
    const rowCount = document.getElementById("rows").value;
    const columnCount = document.getElementById("columns").value;

    for (let i = 0; i < rowCount; ++i)
    {
        let row = table.insertRow();
        for (let j = 0; j < columnCount; ++j)
        {
            const cell = row.insertCell();
            const input = document.createElement("input");
            input.type = "number";
            if (j == columnCount-1)
                cell.classList.add("y-column"); 
            cell.appendChild(input);
        }
    }

    updateTableSize();
}

function updateTableSize()
{
    const table = document.getElementById('data-table');
    const rows = table.rows.length;
    const cols = rows > 0 ? table.rows[0].cells.length : 0;
    document.getElementById("table-size").innerText = `${rows} x ${cols}`;
}

function clearTable() 
{
    let table = document.getElementById("data-table");
    let pwrs = document.getElementById("power-table");
    let elements = table.getElementsByTagName("input");
    for (let i = 0; i < elements.length; ++i) 
    {
        elements[i].value = "";
    }
    elements = pwrs.getElementsByTagName("input");
    for (let i = 0; i < elements.length; ++i) 
    {
        elements[i].value = "";
    }
}


async function submitData() 
{
    const table = document.getElementById('data-table');
    const X = [], Y = [];
    let pwr = [];
    const powers = document.getElementById('power-table');
    const r2 = document.getElementById('r2');
    const lindep = document.getElementById('lindep');
    r2.innerHTML = '';
    lindep.innerHTML = '';

    for (let row of table.rows) 
    {
        const inputs = row.querySelectorAll('input');
        const rowData = Array.from(inputs).map(inp => parseFloat(inp.value));
        //goes through each input, gets its value using inp.value, and then turns it into a float
        const x = rowData.slice(0,-1);
        const y = rowData.slice(-1)[0];
        let valid = true;
        let empty = true;
        const first = x[0];
        if (!Number.isNaN(first))
            empty = false;
        for (let i = 1; i < x.length; ++i)
        {
            if ((!Number.isNaN(x[i]) && empty) || (Number.isNaN(x[i]) && !empty))
            {
                valid = false;
                break;
            }
        }
        if (valid && !empty)
            X.push(x); //takes away all values except last, note it returns a shallow copy from start to end
        if (!Number.isNaN(y))
            Y.push(y); //only gets the last element and retrieves the value not the array
    }

    const inputs = powers.rows[0].querySelectorAll('input');
    pwr = Array.from(inputs).map(inp => parseFloat(inp.value));

    try 
    {
        const response = await fetch('/regress', 
        {//fetch retrieves info from apis, make https requests on servers, in this case sends data to /regress endpt
            method: 'POST', //POST specifies we are sending data
            headers: {'Content-Type': 'application/json'}, //we are sending json data
            body: JSON.stringify({pwr, X, Y}) //converts X and Y into json string, the body is the message
        });

        const result = await response.json(); //awaits the response from the backend
        const resultTable = document.getElementById('result-table');
        resultTable.innerHTML = '';
        const row = resultTable.insertRow();
        if (result.error == "Singular matrix")
        {
            resultTable.insertAdjacentText('beforeend', "There exists no or infinite solutions to this system");
        }
        else if (result.error == "Invalid data")
        {
            resultTable.insertAdjacentText('beforeend', "Invalid data");
        }
        else
        {
            const coeffs = result.coeffs;
            const r2 = result.r2;
            for (let i = 0; i < coeffs.length; ++i)
            {
                const newCell = row.insertCell();
                const output = document.createElement('input');
                output.type = 'number';
                output.readOnly = true;
                const coefficient = coeffs[i][0];
                output.value = coefficient.toFixed(4);
                newCell.appendChild(output);
            }
            const r2Box = document.getElementById("r2");
            r2Box.innerText = "R^2: "+r2.toFixed(3);
            if (result.lindep != 0)
            {
                const lindepBox = document.getElementById("lindep");
                lindepBox.innerText = `Remove ${result.lindep} columns and they would be linearly independent`;
            }
        }
    }
    catch (error)
    {
        //document.getElementById('result').innerText = 'Error: ' + error.message;
        console.log(error.message); //console.log messages only appear if u run from html file, not from app.py
    }
}

function saveTableToLocalStorage() 
{
    const table = document.getElementById('data-table');
    const rows = [];
    for (let row of table.rows) 
    {
        const inputs = row.querySelectorAll('input');
        const values = Array.from(inputs).map(input => input.value);
        rows.push(values);
    }
    localStorage.setItem('tableData', JSON.stringify(rows)); //stored in a dictionary with key headers and value rows i think
    const powers = document.getElementById('power-table');
    const row2 = [];
    const inp = powers.rows[0].querySelectorAll('input');
    row2.push(Array.from(inp).map(inp => inp.value));
    localStorage.setItem('powerData', JSON.stringify(row2));
}

function readCSV()
{
    const fileInput = document.getElementById('csvFileInput');
    const result = document.getElementById('result-table');
    const table = document.getElementById('data-table');
    const r2 = document.getElementById('r2');
    const lindep = document.getElementById('lindep');
    r2.innerHTML = '';
    lindep.innerHTML = '';
    if (!fileInput.files.length) //or file is empty
    {
        result.insertAdjacentText('beforeend', "No data entered");
        return;
    }

    const file = fileInput.files[0];
    let reader = new FileReader();

    reader.onload = function(event) { //when the file is fully loaded, FileReader triggers its onload event which we define to be this function
        const csvText = event.target.result; //contains full content of the file as a string
        let rows = csvText.split("\n"); //let rows = csvText.trim().split("\n").filter(row => row.length);????
        let data = rows.map(row => row.split(",")); //data is a 2d array containing all individual elements
        const rowNum = data.length;
        if (rowNum == 0)
        {
            result.insertAdjacentText('beforeend', "No data entered");
            return;
        }
        const cols = data[0].length;
        table.innerHTML = '';
        for (let i = 0; i < rowNum; ++i)
        {
            const row = table.insertRow();
            for (let j = 0; j < cols; ++j)
            {
                const cell = row.insertCell();
                const input = document.createElement('input');
                input.type = 'number';
                try
                {
                    input.value = parseFloat(data[i][j].trim()); //trim removes unwanted space
                }
                catch (error)
                {
                    table.innerHTML = ''
                    result.insertAdjacentText('beforeend', `Invalid csv data entered at index ${i}, ${j}`);
                }
                cell.appendChild(input);
                if (j == cols - 1) 
                    cell.classList.add('y-column');
            }
        }
    };

    reader.readAsText(file); //reader will start reading the file as text, and then once its done loading it will trigger onload function
    updateTableSize();
}

function loadTableFromLocalStorage() 
{
    const data = JSON.parse(localStorage.getItem('tableData'));
    if (!data && data.rows.length == 0) 
        return;

    const exponent = JSON.parse(localStorage.getItem('powerData'));

    if (!exponent && exponent.rows.length == 0)
        return;

    const table = document.getElementById('data-table');
    const powers = document.getElementById('power-table');
    powers.innerHTML = '';
    table.innerHTML = '';
    for (let rowData of data) 
    {
        const row = table.insertRow();
        for (let i = 0; i < rowData.length; i++) 
        {
            const cell = row.insertCell();
            const input = document.createElement('input');
            input.type = 'number';
            input.value = rowData[i];
            cell.appendChild(input);
            if (i == rowData.length - 1) 
                cell.classList.add('y-column');
        }
    }

    const row = powers.insertRow();
    for (let i = 0; i < exponent[0].length; ++i)
    {
        const cell = row.insertCell();
        const input = document.createElement('input');
        input.type = 'number';
        input.value = exponent[0][i];
        cell.appendChild(input);
    }

    updateTableSize();
}

window.addEventListener('load', loadTableFromLocalStorage);
window.addEventListener('beforeunload', saveTableToLocalStorage);



//asynchronous functions are when one function has to wait for another like waiting for a file to load
//a callback is a function passed as an argument to another function like a functor, u specify which function
//is being passed when u call the function that has the callback 
//setTimeout(function, time) calls function after time milliseconds, is an example of asynchronous funct
//setInterval calls function every time after time milliseconds
//but using callbacks is generally not used cuz it means things arent necessarily executed sequentially so we use promises
//itll also get rly convoluted and hard to debug too
//the first callback corresponds to fulfilled and the second callback in the promise initialization is the rejected
//as in if the first callback function is called then it's fulfilled and if second is called then rejected
//i think resolve and reject are two callback functions that are used if u just need to confirm whether or not the promise is good
//use function() {} to declare and initialize a function in one line, kinda like lambda
//if you add async in front of a function, it forces the function to return a promise with the value of the promise as the thing being returned
//await can only be used in an async function, forces function to pause and wait for promise to be resolved before continuing
//note a promise is just a placeholder for some value that will be the eventual result of an async function