import React from "react";


function AddIntegrationPage() {
    const onHttpSelect = () => {

    }
  
    return (
        <div class="context-box">
            <h2 class="content-name">Pasirinkite integracijos tipą</h2>
            <div class="choice-menu">
                <a class="choice-menu-button" id="integ-http" href="/add/http">HTTP/HTTPS</a>
                <a class="choice-menu-button" id="integ-mqtt" href="/add/mqtt">MQTT</a>
            </div>
        </div>
    );
}

export default AddIntegrationPage;