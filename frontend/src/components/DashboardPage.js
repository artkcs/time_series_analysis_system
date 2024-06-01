import React, { Component } from "react";

const DashboardPage = () => {
    return(
        <div class="context-box">
            <h2 class="content-name">MyInteg</h2>
            <h2 class="content-name">Duomenų kaupimo ir analizės sistema</h2>
            <div class="dashboard">
                <a href="/add" class="choice-menu-button">NAUJA INTEGRACIJA</a>
                <a href="/integrations" class="choice-menu-button">INTEGRACIJŲ SĄRAŠAS</a>
            </div>
        </div>
        );
}

export default DashboardPage;