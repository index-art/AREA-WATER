const button = document.getElementById("actionButton");
const sound = document.getElementById("areaSound");
const exitButton = document.getElementById("exitButton");

const API_KEY = "d4996a58d1d24c11a0e369dc43f2354c";

let positionAllowed = false;
let userPosition = null;
let searching = false;


// BOUTON PRINCIPAL

button.addEventListener("click", () => {

    switch(button.innerText) {

        case "ACTIVATE":
            activatePosition();
            break;

        case "SEARCH WATER":
            enterFullscreen();
            searchWater();
            break;

        case "UNMUTE":
            startSound();
            break;

        case "MUTE":
            stopSound();
            break;
    }

});


// GPS

function activatePosition() {

    navigator.geolocation.getCurrentPosition(

        (position) => {

            positionAllowed = true;

            userPosition = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };

            console.log("Position :", userPosition);

            button.innerText = "SEARCH WATER";

        },

        (error) => {

            console.error(error);

            button.innerText = "POSITION DENIED";

            setTimeout(() => {
                button.innerText = "ACTIVATE";
            }, 3000);

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );

}


// DETECTION EAU

async function searchWater() {

    if(searching || !userPosition) {
        return;
    }

    searching = true;

    const lat = userPosition.lat;
    const lon = userPosition.lon;

    const radius = 15;

    const url = new URL(
        "https://api.geoapify.com/v2/places"
    );

    url.searchParams.append(
        "categories",
        "natural.water,natural.water.sea,natural.water.river_system,natural.wetland"
    );

    url.searchParams.append(
        "filter",
        `circle:${lon},${lat},${radius}`
    );

    url.searchParams.append(
        "limit",
        "10"
    );

    url.searchParams.append(
        "apiKey",
        API_KEY
    );


    try {

        const response = await fetch(url);

        if(!response.ok) {
            throw new Error(
                "HTTP " + response.status
            );
        }

        const data = await response.json();

        console.log("Résultat eau :", data);

        if(data.features && data.features.length > 0) {

            button.innerText = "UNMUTE";

        } else {

            button.innerText = "NO WATER";

            setTimeout(() => {
                button.innerText = "SEARCH WATER";
            }, 3000);

        }

    } catch(error) {

        console.error(
            "Erreur API :",
            error
        );

        button.innerText = "ERROR";

        setTimeout(() => {
            button.innerText = "SEARCH WATER";
        }, 3000);

    }

    searching = false;

}


// AUDIO

function startSound() {

    sound.currentTime = 0;

    sound.play()

    .then(() => {

        button.innerText = "MUTE";

    })

    .catch(error => {

        console.error(error);

    });

}


function stopSound() {

    sound.pause();

    button.innerText = "UNMUTE";

}


// FULLSCREEN

function enterFullscreen() {

    const element = document.documentElement;

    if(element.requestFullscreen) {

        element.requestFullscreen()
        .catch(() => {});

    } else if(element.webkitRequestFullscreen) {

        element.webkitRequestFullscreen();

    }

    exitButton.style.display = "block";

}


function exitFullscreen() {

    if(document.exitFullscreen) {

        document.exitFullscreen();

    } else if(document.webkitExitFullscreen) {

        document.webkitExitFullscreen();

    }

    exitButton.style.display = "none";

}


exitButton.addEventListener("click", () => {

    exitFullscreen();

});
