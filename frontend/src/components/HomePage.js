import React from "react";
import IntegrationDisplayPage from "./IntegrationDisplayPage";
import AddIntegrationPage from "./AddIntegrationPage";
import IntegrationsList from "./IntegrationsList";
import AddHttpIntegration from "./AddHttpIntegration";
import AddMqttIntegration from "./AddMqttIntegration";
import DashboardPage from "./DashboardPage";
import { BrowserRouter as Router, Routes,  Route} from "react-router-dom";


const HomePage = () => {
    const displayMobileNavbar = () => {
        var mobileNavContent = document.getElementById("navbar-mobile__content");
        var mobileNavContainer = document.getElementById("nav-mobile-linklist");
        var currentLinks = document.getElementsByClassName("navbar__link");
        mobileNavContent.style.display = "block";
        console.log(currentLinks.length)

        mobileNavContainer.innerHTML = ""

        for (let i = 0; i < currentLinks.length; i++) {
            let link = document.createElement("a");
            link.href = currentLinks[i].href;
            link.classList = "nav-mobile-linklist__link";
            link.innerText = currentLinks[i].innerText;
            mobileNavContainer.appendChild(link);
        }
    }

    const hideMobileNavbar = () => {
        var mobileNavContent = document.getElementById("navbar-mobile__content");
        mobileNavContent.style.display = "none";
    }

    return(
    <div>
        <div class="header-container">
            <header class="header">
                <nav class="header__navbar navbar">
                    <a href="/add" class="navbar__link">Pridėti integraciją</a>
                    <a href="/integrations" class="navbar__link">Integracijos</a>
                    <a href="/" class="navbar__link">Pagrindinis</a>
                </nav>
        
                <div class="navbar-mobile">
                    <img src='/frontend/static/images/mobile-menu-icon.svg' class="navbar-mobile__btn" id="navbar-mobile__btn" alt="Navbar" height="50" onClick={displayMobileNavbar} />
                    <div class="navbar-mobile__content" id="navbar-mobile__content">
                        <img src='/frontend/static/images/mobile-close-icon.svg' alt="Close" class="nav-mobile-close" id="nav-mobile-close" height="50" onClick={hideMobileNavbar} />
                        <div class="nav-mobile-linklist" id="nav-mobile-linklist"></div>
                    </div>
                </div>
            </header>
        </div>

        <Router>
            <Routes>
                <Route exact path="/" element={<DashboardPage />} />
                <Route path="/integration/:id" element={<IntegrationDisplayPage />} />
                <Route path="/integrations" exact element={<IntegrationsList />} />
                <Route path="/add" element={<AddIntegrationPage />} />
                <Route path="/add/http" element={<AddHttpIntegration />} />
                <Route path="/add/mqtt" element={<AddMqttIntegration />} />
            </Routes>
        </Router>  
    </div>
    )
}

export default HomePage;