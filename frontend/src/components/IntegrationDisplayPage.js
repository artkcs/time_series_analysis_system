import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"
import DrawLineChart from "./Charts"
import { integrationSuccessfullyAddedMsg, commonErrorMsg } from "./UIMessages";

const IntegrationDisplayPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const params = useParams()
    const [values, setValues] = useState([]);
    const [fieldNames, setFieldNames] = useState([]);
    const [integType, setType] = useState(0);
    const [mqttBroker, setMqttBroker] = useState("");
    const [mqttPort, setMqttPort] = useState("");
    const [mqttTopic, setMqttTopic] = useState("");

    const [name, setName] = useState("");
    const [httpUrl, setHttpUrl] = useState("");
    const [periodicity, setPeriodicity] = useState(0);
    const [dateformat, setDateFormat] = useState("");

    const [dateToInput, setDateToInput] = useState();
    const [dateFromInput, setDateFromInput] = useState();
    const [dateTo, setDateTo] = useState();
    const [dateFrom, setDateFrom] = useState();

    const getIntegrationDetails = () => {
        fetch("/api/get-integration" + "?id=" + params.id)
            .then((response) => response.json())
            .then((data) => {
                setName(data.name);
                setHttpUrl(data.http_url);
                setPeriodicity(data.periodicity);
                setDateFormat(data.dateformat);
                setType(data.type);
                setMqttBroker(data.mqtt_broker);
                setMqttPort(data.mqtt_port);
                setMqttTopic(data.mqtt_topic);

                if (data.type != 1) {
                    let button = document.getElementById("update-button");
                    button.style.display = "none";

                    document.getElementById("common-info-tab-mqtt").style.display = "block";
                }
                else {
                    document.getElementById("common-info-tab-http").style.display = "block";
                }
            });
    }

    const getIntegrationInitialData = () => {
        fetch("/api/get-integ-initial-data" + "?id=" + params.id)
            .then((response) => response.json())
            .then((data) => {
                setValues(data.values);
                setFieldNames(data.field_names);
            })
    }

    const clearDates = () => {
        setDateToInput(undefined);
        setDateFromInput(undefined);
        document.getElementById("datefrom").value = "";
        document.getElementById("dateto").value = "";
    }

    const handleDateFromChange = (event) => {
        setDateFromInput(event.target.value);
    }

    const handleDateToChange = (event) => {
        setDateToInput(event.target.value);
    }

    const getIntegrationDataByDate = () => {
        if (dateFromInput == undefined && dateToInput == undefined) {
            alert("Bad date");
        }
        else {
            setDateFrom(dateFromInput);
            setDateTo(dateToInput);
            let formatDateFrom = "null";
            let formatDateTo = "null";
            if (dateFromInput) {
                formatDateFrom = dateFromInput.toString().replace("T", " ");
                formatDateFrom += ":00";
            }
            if (dateToInput) {
                formatDateTo = dateToInput.toString().replace("T", " ");
                formatDateTo += ":00";
            }
            fetch("/api/get-integration-data" + "?id=" + params.id + "&date_from=" + formatDateFrom.toString() + "&date_to=" + formatDateTo.toString())
            .then((response) => response.json())
            .then((data) => {
                setValues(data.values);
                setFieldNames(data.field_names);
            })
        }
    }

    const updateIntegData = () => {
        const requestOptions = {
            method: "POST",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({
                id: params.id
            })
        };
        fetch("/api/upd-integ-data-from-integ", requestOptions).then((response) => 
            response.json()
            )
            .then((data) => getIntegrationInitialData());
    }

    const deleteInteg = () => {
        const requestOptions = {
            method: "DELETE",
        };
        fetch("/api/delete-integ/" + params.id, requestOptions)
            .then((response) => {
                if (response.status === 200) {
                    navigate("/integrations")
                }
                else {
                    let msgBox = document.getElementById("info-message")
                    let msg = commonErrorMsg("Klaida šalinant integraciją")
                    
                    msgBox.innerHTML = ""
                    msgBox.appendChild(msg)
                }
            });      
    }

    // Function to handle tab click
    const handleTabClick = (tab) => {
        let commonInfoTab = document.getElementsByClassName("common-info");
        let tableTab = document.getElementById("table-tab");
        let chartsTab = document.getElementById("charts-tab");
        let filterBar = document.getElementById("filter-bar");

        if (tab === "table") {
            tableTab.style.display = "block";
            for (let item of commonInfoTab) {
                item.style.display = "none"
            }
            chartsTab.style.display = "none";
            filterBar.style.visibility = "visible";
        }
        else if (tab === "common-info") { 
            if (integType == 1) {
                document.getElementById("common-info-tab-http").style.display = "block";
            }
            else {
                document.getElementById("common-info-tab-mqtt").style.display = "block";
            }
            tableTab.style.display = "none";
            chartsTab.style.display = "none";
            filterBar.style.visibility = "hidden";
        }
        else {
            chartsTab.style.display = "block";
            for (let item of commonInfoTab) {
                item.style.display = "none"
            }
            tableTab.style.display = "none";
            filterBar.style.visibility = "visible";        
        }
    };

    //Export functions
    const exportJson = () => {
        let table = document.getElementById("integration-data-table");

        let data = [];
        let headers = [];
        for (let i = 0; i < table.rows[0].cells.length; i++) {
            headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi,"");
        }
        
        for (let i = 1; i < table.rows.length; i++) {
            let tableRow = table.rows[i];
            let rowData = {};

            for (let j = 0; j < tableRow.cells.length; j++) {
                rowData[ headers[j] ] = tableRow.cells[j].innerHTML;
            }

            data.push(rowData);
        }

        let stringData = JSON.stringify(data);
        
        //Create file and trigger download
        let JSONFile = new Blob([stringData], { type: "text/json" });

        let temp_link = document.createElement('a');
        
        // Download csv file
        let timestamp = new Date();
        temp_link.download = "data_" + timestamp.toLocaleString() + ".JSON";
        let url = window.URL.createObjectURL(JSONFile);
        temp_link.href = url;
        
        temp_link.style.display = "none";
        document.body.appendChild(temp_link);
        
        temp_link.click();
        document.body.removeChild(temp_link);
    }

    const exportCsv = () => {
        //Get data from table
        let table = document.getElementById("integration-data-table");
        let csv_data = [];

        let rows = table.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
    
            let cols = rows[i].querySelectorAll('td,th');
    
            let csvrow = [];
            for (let j = 0; j < cols.length; j++) {
                csvrow.push(cols[j].innerHTML);
            }
    
            csv_data.push(csvrow.join(","));
        }

        csv_data = csv_data.join('\n');

        //Create file and trigger download
        let CSVFile = new Blob([csv_data], { type: "text/csv" });
 
        let temp_link = document.createElement('a');
     
        // Download csv file
        let timestamp = new Date();
        temp_link.download = "data_" + timestamp.toLocaleString() + ".csv";
        let url = window.URL.createObjectURL(CSVFile);
        temp_link.href = url;
     
        temp_link.style.display = "none";
        document.body.appendChild(temp_link);
     
        temp_link.click();
        document.body.removeChild(temp_link);
    }

    useEffect(() => {
        if (isInitialLoad) {
            getIntegrationDetails()
            getIntegrationInitialData()
            setIsInitialLoad(false)
            newIntegMsg()
        }

        const intervalId = setInterval(() => {
            // This function will be called every 5 seconds
            if (!dateTo && !dateFrom) {
                getIntegrationInitialData()
            }
            else {
                getIntegrationDataByDate()
            }
          }, 5000) // 5000 milliseconds = 5 seconds
      
          return () => clearInterval(intervalId)

    }, [dateTo, dateFrom]);

    const newIntegMsg = () => {
        let messageBox = document.getElementById("info-message")
        if (location.state == undefined) {
            messageBox.innerHTML = ""
        }
        else if (location.state.new === "true") {
            let msg = integrationSuccessfullyAddedMsg()
            messageBox.innerHTML = ""
            messageBox.append(msg)
            setTimeout(function() {document.getElementById("msg").style.display = "none";}, 5000);
        }
    }

    return(
        <div class="context-box">
            <div id="info-message"></div>
            <h2 class="content-name">Integracija: {name}</h2>
            <div class="button-bar">
                
                <button class="button" onClick={updateIntegData} id="update-button">Atnaujinti duomenis</button>
                <button class="button" onClick={deleteInteg}>Šalinti integraciją</button>
            </div>
            <div class="tab-bar">
                <button onClick={() => handleTabClick('common-info')} class="button">Bendra informacija</button>
                <button onClick={() => handleTabClick('table')} class="button">Lentelė</button>
                <button onClick={() => handleTabClick('charts')} class="button">Grafikai</button>
            </div>
            <div class="common-info" id="common-info-tab-http">
                <h3 class="content-name">Bendra informacija</h3>
                <table class="params-table">
                    <tr class="params-table__row">
                        <th class="params-table__column params-table__column--heading column__params">Pavadinimas</th>
                        <td class="params-table__column column__description">{name}</td>
                    </tr>
                    <tr class="params-table__row">
                        <th class="params-table__column params-table__column--heading column__params">URL</th>
                        <td class="params-table__column column__description">{httpUrl}</td>
                    </tr>
                    <tr class="params-table__row">
                        <th class="params-table__column params-table__column--heading column__params">Periodiškumas (val.)</th>
                        <td class="params-table__column column__description">{periodicity}</td>
                    </tr>
                    <tr class="params-table__row">
                        <th class="params-table__column params-table__column--heading column__params">Datos formatas</th>
                        <td class="params-table__column column__description">{dateformat}</td>
                    </tr>
                </table>

            </div>
            <div class="common-info" id="common-info-tab-mqtt">
                <h3 class="content-name">Bendra informacija</h3>
                <table class="params-table">
                    <tr class="params-table__row">
                        <th class="params-table__column params-table__column--heading column__params">Pavadinimas</th>
                        <td class="params-table__column column__description">{name}</td>
                    </tr>
                    <tr class="params-table__row">
                        <th class="params-table__column params-table__column--heading column__params">MQTT Broker</th>
                        <td class="params-table__column column__description">{mqttBroker}</td>
                    </tr>
                    <tr class="params-table__row">
                        <th class="params-table__column params-table__column--heading column__params">MQTT Port (prievadas)</th>
                        <td class="params-table__column column__description">{mqttPort}</td>
                    </tr>
                    <tr class="params-table__row">
                        <th class="params-table__column params-table__column--heading column__params">MQTT topic</th>
                        <td class="params-table__column column__description">{mqttTopic}</td>
                    </tr>
                </table>
            </div>
            <div class="filter-bar" id="filter-bar">
                    <button class="button" onClick={clearDates}>Valyti</button>
                    <div class="inline-field-container">
                        <label class="label">Data nuo</label>
                        <input type="datetime-local" id="datefrom" class="field field__bar" onChange={handleDateFromChange} />
                    </div>
                    <div class="inline-field-container">
                        <label class="label">Data iki</label>
                        <input type="datetime-local" id="dateto" class="field field__bar"  onChange={handleDateToChange} />
                    </div>
                    <button class="button" onClick={getIntegrationDataByDate}>Taikyti</button>
            </div>
            <div class="data-table" id="table-tab">
                <div class="export-buttons">
                    <button class="button" onClick={exportJson}>Eksportuoti JSON</button>
                    <button class="button" onClick={exportCsv}>Eksportuoti CSV</button>
                </div>
                <div class="table-of-values-container">
                    <table class="params-table" id="integration-data-table">
                        <tr class="params-table__row">
                                <th class="params-table__column params-table__column--heading column__params">Data</th>
                            {fieldNames && fieldNames.map((fieldName) =>(
                                <th class="params-table__column params-table__column--heading column__params">{fieldName}</th>
                            ))}
                        </tr>
                        {values &&
                            values.map(({ date, fields }) => (
                                <tr class="params-table__row">
                                    <td class="params-table__column column__description">{date}</td>
                                    {fields && fields.map((field) => (
                                        <td class="params-table__column column__description">{field}</td>
                                    )
                                )}   
                                </tr>
                            )
                        )}
                    </table>
                </div>

            </div>
            <div id="charts-tab" class="charts-tab">
                    {fieldNames.map((fieldName, index) => {
                        let chartValues;
                        if (values) {
                            chartValues = structuredClone(values);
                            chartValues = chartValues.sort(function(a, b) {
                                return Date.parse(a.date) - Date.parse(b.date);
                            });
                        }
                        const chartData = chartValues.map(entry => ({
                            date: entry.date,
                            value: entry.fields[index]
                        }));
                        return (
                            <div class="chart-container">
                                <h3 class="chart-caption">Grafikas laukeliui: {fieldName}</h3>
                                <DrawLineChart data={chartData} />
                            </div>
                        );
                    })}
            </div>
        </div>
    )
} 

export default IntegrationDisplayPage