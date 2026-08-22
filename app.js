/* =========================================================
   A CASA DI FRANCESCA - IL SEGRETO DI VIRGILIO
   ========================================================= */

const DATA_URL = "monumenti_lecce.json";

let monuments = [];
let currentLanguage = "it";
let currentMonument = null;

let speechUtterance = null;
let selectedVoice = null;

let map;

let routeCursor;
let routeIndex = 0;
let routeAnimation = null;
let routePlaying = false;


/* =========================================================
   TRADUZIONI
   ========================================================= */

const translations = {

    it: {
        secret: "Il Segreto di Virgilio",
        more: "Scopri di più",
        moreHint: "Clicca per leggere tutto",
        audio: "Ascolta",
        audioDescription: "Premi ▶ per ascoltare il testo.",
        video: "▶ Guarda il video"
    },

    en: {
        secret: "Virgil's Secret",
        more: "Find out more",
        moreHint: "Click to read the full text",
        audio: "Listen",
        audioDescription: "Press ▶ to listen to the text.",
        video: "▶ Watch the video"
    },

    es: {
        secret: "El secreto de Virgilio",
        more: "Descubre más",
        moreHint: "Haz clic para leer el texto completo",
        audio: "Escuchar",
        audioDescription: "Pulsa ▶ para escuchar el texto.",
        video: "▶ Ver el vídeo"
    }

};


/* =========================================================
   MAPPA
   ========================================================= */

function initializeMap() {

    map = L.map("map", {

        zoomControl: false,

        attributionControl: true

    }).setView(
        [
            40.356820,
            18.171628
        ],
        16
    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 20,

            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    /*
     * ZOOM
     * Posizione gestita anche dal CSS.
     */
    L.control.zoom({
        position: "bottomright"
    }).addTo(map);

}


/* =========================================================
   ICONA MARKER
   ========================================================= */

function createMarkerIcon(isFrancesca) {

    const color =
        isFrancesca
            ? "#d71920"
            : "#1565c0";


    return L.divIcon({

        className: "custom-marker",

        html: `

            <div style="
                width: 24px;
                height: 24px;

                background: ${color};

                border: 3px solid white;

                border-radius:
                    50% 50% 50% 0;

                transform:
                    rotate(-45deg);

                box-shadow:
                    0 2px 6px
                    rgba(0,0,0,0.35);

                position: relative;
            ">

                <div style="
                    width: 8px;
                    height: 8px;

                    background: white;

                    border-radius: 50%;

                    position: absolute;

                    top: 5px;
                    left: 5px;
                "></div>

            </div>

        `,

        iconSize: [24, 24],

        iconAnchor: [12, 24],

        popupAnchor: [0, -24]

    });

}


/* =========================================================
   CARICAMENTO JSON
   ========================================================= */

async function loadMonuments() {

    try {

        const response =
            await fetch(DATA_URL);


        if (!response.ok) {

            throw new Error(
                "Errore nel caricamento del file JSON."
            );

        }


        monuments =
            await response.json();


        if (!Array.isArray(monuments)) {

            throw new Error(
                "Il JSON non contiene un elenco valido."
            );

        }


        addMonumentsToMap();


    } catch (error) {

        console.error(error);

        alert(
            "Non è stato possibile caricare " +
            "monumenti_lecce.json.\n\n" +
            "Assicurati che il file si trovi " +
            "nella stessa cartella di index.html."
        );

    }

}


/* =========================================================
   AGGIUNTA MONUMENTI
   ========================================================= */

function addMonumentsToMap() {

    monuments.forEach(
        (monument) => {

            const name =
                monument["Nome Luogo"];


            const lat =
                parseFloat(
                    monument["Lat"]
                );


            const lng =
                parseFloat(
                    monument["Long"]
                );


            if (
                !name ||
                Number.isNaN(lat) ||
                Number.isNaN(lng)
            ) {

                console.warn(
                    "Monumento con dati non validi:",
                    monument
                );

                return;

            }


            const isFrancesca =
                name
                    .trim()
                    .toLowerCase() ===
                "a casa di francesca";


            const marker =
                L.marker(
                    [lat, lng],
                    {
                        icon:
                            createMarkerIcon(
                                isFrancesca
                            )
                    }
                ).addTo(map);


            marker.bindTooltip(
                name,
                {
                    direction: "top",
                    offset: [0, -20]
                }
            );


            marker.on(
                "click",
                function () {

                    openMonument(
                        monument,
                        marker
                    );

                }
            );

        }
    );

}


/* =========================================================
   CAMPI JSON
   ========================================================= */

function getFieldsForLanguage() {

    if (currentLanguage === "en") {

        return {

            secret:
                "The Secret of Virgil (Legend/Curiosity)",

            more:
                "Find out more"

        };

    }


    if (currentLanguage === "es") {

        return {

            secret:
                "El secreto de Virgilio (Leyenda/Curiosidad)",

            more:
                "Descubra más"

        };

    }


    return {

        secret:
            "Il Segreto di Virgilio (Leggenda/Curiosità)",

        more:
            "Scopri di più"

    };

}


/* =========================================================
   TESTO COMPLETO
   ========================================================= */

function getMoreText() {

    if (!currentMonument) {
        return "";
    }


    const fields =
        getFieldsForLanguage();


    return (
        currentMonument[
            fields.more
        ] || ""
    );

}


/* =========================================================
   ANTEPRIMA
   ========================================================= */

function createPreview(text) {

    if (!text) {
        return "";
    }


    const maxLength = 300;


    if (text.length <= maxLength) {
        return text;
    }


    let preview =
        text.substring(
            0,
            maxLength
        );


    const lastSpace =
        preview.lastIndexOf(" ");


    if (lastSpace > 0) {

        preview =
            preview.substring(
                0,
                lastSpace
            );

    }


    return preview + "...";

}


/* =========================================================
   APERTURA POPUP
   ========================================================= */

function openMonument(
    monument,
    marker
) {

    currentMonument =
        monument;


    const fields =
        getFieldsForLanguage();


    const labels =
        translations[
            currentLanguage
        ];


    /* NOME */

    document
        .getElementById("place-name")
        .textContent =
            monument[
                "Nome Luogo"
            ] || "";


    /* SEGRETO */

    document
        .getElementById("secret-title")
        .textContent =
            labels.secret;


    document
        .getElementById("place-secret")
        .textContent =
            monument[
                fields.secret
            ] || "";


    /* SCOPRI DI PIÙ */

    const moreText =
        monument[
            fields.more
        ] || "";


    document
        .getElementById("more-title")
        .textContent =
            labels.more;


    document
        .getElementById("place-more")
        .textContent =
            createPreview(
                moreText
            );


    document
        .getElementById("place-more")
        .classList.add("collapsed");


    document
        .getElementById("more-section")
        .classList.remove("expanded");


    /*
     * IMPORTANTE:
     * "Clicca per leggere tutto"
     * rimane SEMPRE visibile.
     */

    document
        .getElementById("more-hint")
        .textContent =
            labels.moreHint;


    /* AUDIO */

    document
        .getElementById("audio-title")
        .textContent =
            labels.audio;


    document
        .getElementById("audio-description")
        .textContent =
            labels.audioDescription;


    /* VIDEO */

    setupVideo(
        monument["Video"],
        labels
    );


    /* APRI */

    document
        .getElementById("place-modal")
        .classList.remove("hidden");


    stopSpeech();

}


/* =========================================================
   SCOPRI DI PIÙ
   ========================================================= */

function toggleMoreText() {

    if (!currentMonument) {
        return;
    }


    const fullText =
        getMoreText();


    const textElement =
        document.getElementById(
            "place-more"
        );


    const section =
        document.getElementById(
            "more-section"
        );


    const hint =
        document.getElementById(
            "more-hint"
        );


    const isExpanded =
        section.classList.contains(
            "expanded"
        );


    if (isExpanded) {

        textElement.textContent =
            createPreview(
                fullText
            );

        textElement.classList.add(
            "collapsed"
        );

        section.classList.remove(
            "expanded"
        );

    } else {

        /*
         * QUI VIENE INSERITO
         * IL TESTO COMPLETO,
         * NON L'ANTEPRIMA.
         */

        textElement.textContent =
            fullText;

        textElement.classList.remove(
            "collapsed"
        );

        section.classList.add(
            "expanded"
        );

    }


    /*
     * Rimane sempre visibile.
     */

    hint.textContent =
        translations[
            currentLanguage
        ].moreHint;

}


/*
 * Il click è assegnato direttamente
 * alla sezione.
 */

document
    .getElementById("more-section")
    .addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            toggleMoreText();

        }
    );


/* =========================================================
   SINTESI VOCALE
   ========================================================= */

function getSpeechLanguage() {

    if (currentLanguage === "en") {
        return "en-US";
    }


    if (currentLanguage === "es") {
        return "es-ES";
    }


    return "it-IT";

}


/* =========================================================
   CARICAMENTO VOCI
   ========================================================= */

function loadSpeechVoices() {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    const voices =
        window.speechSynthesis.getVoices();


    if (voices.length) {

        selectedVoice =
            getBestVoice(
                getSpeechLanguage()
            );

    }

}


/*
 * Alcuni browser caricano
 * le voci in modo asincrono.
 */

if (
    "speechSynthesis" in window
) {

    window.speechSynthesis
        .addEventListener(
            "voiceschanged",
            loadSpeechVoices
        );

}


/* =========================================================
   TROVA VOCE
   ========================================================= */

function getBestVoice(language) {

    const voices =
        window.speechSynthesis
            .getVoices();


    if (!voices.length) {
        return null;
    }


    const exact =
        voices.find(
            voice =>
                voice.lang &&
                voice.lang.toLowerCase() ===
                language.toLowerCase()
        );


    if (exact) {
        return exact;
    }


    const prefix =
        language
            .substring(0, 2)
            .toLowerCase();


    const sameLanguage =
        voices.find(
            voice =>
                voice.lang &&
                voice.lang
                    .substring(0, 2)
                    .toLowerCase() ===
                prefix
        );


    return sameLanguage || null;

}


/* =========================================================
   LEGGI TESTO COMPLETO
   ========================================================= */

function speakMoreText() {

    if (
        !("speechSynthesis" in window)
    ) {

        alert(
            "Il tuo dispositivo/browser " +
            "non supporta la sintesi vocale."
        );

        return;

    }


    if (!currentMonument) {
        return;
    }


    /*
     * Prendiamo direttamente
     * il testo COMPLETO dal JSON.
     */

    const text =
        getMoreText();


    if (
        typeof text !== "string" ||
        !text.trim()
    ) {

        alert(
            "Non è disponibile un testo " +
            "da leggere per questo monumento."
        );

        return;

    }


    stopSpeech();


    const language =
        getSpeechLanguage();


    speechUtterance =
        new SpeechSynthesisUtterance(
            text.trim()
        );


    speechUtterance.lang =
        language;


    speechUtterance.rate =
        0.95;


    speechUtterance.pitch =
        1;


    speechUtterance.volume =
        1;


    /*
     * Cerchiamo la voce ogni volta,
     * perché su alcuni browser
     * le voci vengono caricate
     * dopo l'apertura della pagina.
     */

    const voice =
        getBestVoice(
            language
        );


    if (voice) {

        speechUtterance.voice =
            voice;

    }


    speechUtterance.onend =
        function() {

            speechUtterance =
                null;

        };


    speechUtterance.onerror =
        function(error) {

            console.error(
                "Errore sintesi vocale:",
                error
            );

            speechUtterance =
                null;

        };


    /*
     * Piccolo ritardo:
     * evita il problema di alcuni browser
     * che non eseguono speak() immediatamente
     * dopo cancel().
     */

    setTimeout(
        function() {

            window.speechSynthesis
                .speak(
                    speechUtterance
                );

        },
        80
    );

}


/* =========================================================
   PAUSA
   ========================================================= */

function pauseSpeech() {

    if (
        "speechSynthesis" in window &&
        window.speechSynthesis.speaking
    ) {

        window.speechSynthesis.pause();

    }

}


/* =========================================================
   RIPRENDI
   ========================================================= */

function resumeSpeech() {

    if (
        "speechSynthesis" in window &&
        window.speechSynthesis.paused
    ) {

        window.speechSynthesis.resume();

    }

}


/* =========================================================
   STOP
   ========================================================= */

function stopSpeech() {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }

}


/* =========================================================
   RIPETI
   ========================================================= */

function repeatSpeech() {

    if (!currentMonument) {
        return;
    }


    speakMoreText();

}


/* =========================================================
   PLAY
   ========================================================= */

document
    .getElementById("audio-play")
    .addEventListener(
        "click",
        function() {

            if (
                window.speechSynthesis.paused
            ) {

                resumeSpeech();

            } else {

                speakMoreText();

            }

        }
    );


/* =========================================================
   PAUSA
   ========================================================= */

document
    .getElementById("audio-pause")
    .addEventListener(
        "click",
        function() {

            pauseSpeech();

        }
    );


/* =========================================================
   RIPETI
   ========================================================= */

document
    .getElementById("audio-repeat")
    .addEventListener(
        "click",
        function() {

            repeatSpeech();

        }
    );


/* =========================================================
   VIDEO
   ========================================================= */

function setupVideo(
    videoUrl,
    labels
) {

    const section =
        document.getElementById(
            "video-section"
        );


    const button =
        document.getElementById(
            "video-btn"
        );


    if (
        typeof videoUrl !== "string" ||
        videoUrl.trim() === ""
    ) {

        section.classList.add(
            "hidden"
        );

        return;

    }


    section.classList.remove(
        "hidden"
    );


    button.textContent =
        labels.video;


    button.onclick =
        function() {

            window.open(
                videoUrl.trim(),
                "_blank",
                "noopener,noreferrer"
            );

        };

}


/* =========================================================
   CHIUDI POPUP
   ========================================================= */

function closeMonument() {

    stopSpeech();


    currentMonument =
        null;


    document
        .getElementById("place-modal")
        .classList.add("hidden");

}


document
    .getElementById("close-modal")
    .addEventListener(
        "click",
        closeMonument
    );


document
    .getElementById("place-modal")
    .addEventListener(
        "click",
        function(event) {

            if (
                event.target === this
            ) {

                closeMonument();

            }

        }
    );


/* =========================================================
   CAMBIO LINGUA
   ========================================================= */

document
    .querySelectorAll(
        ".language-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function() {

                    currentLanguage =
                        this.dataset.lang;


                    document
                        .querySelectorAll(
                            ".language-btn"
                        )
                        .forEach(
                            btn =>
                                btn.classList
                                    .remove(
                                        "active"
                                    )
                        );


                    this.classList.add(
                        "active"
                    );


                    loadSpeechVoices();


                    if (
                        currentMonument
                    ) {

                        const monument =
                            currentMonument;


                        stopSpeech();


                        openMonument(
                            monument,
                            null
                        );

                    }

                }
            );

        }
    );


/* =========================================================
   CURSORE
   ========================================================= */

function initializeRouteCursor() {

    routeCursor =
        document.getElementById(
            "route-cursor"
        );

}


function moveCursorToMonument(
    index
) {

    if (
        !routeCursor ||
        !monuments[index]
    ) {

        return;

    }


    const monument =
        monuments[index];


    const lat =
        parseFloat(
            monument["Lat"]
        );


    const lng =
        parseFloat(
            monument["Long"]
        );


    const point =
        map.latLngToContainerPoint(
            [lat, lng]
        );


    routeCursor.style.left =
        `${point.x - 9}px`;


    routeCursor.style.top =
        `${point.y - 9}px`;


    routeCursor.style.display =
        "block";

}


function playRoute() {

    if (!monuments.length) {
        return;
    }


    routePlaying = true;


    clearInterval(
        routeAnimation
    );


    moveCursorToMonument(
        routeIndex
    );


    routeAnimation =
        setInterval(
            function() {

                if (!routePlaying) {
                    return;
                }


                routeIndex++;


                if (
                    routeIndex >=
                    monuments.length
                ) {

                    routeIndex = 0;

                }


                moveCursorToMonument(
                    routeIndex
                );

            },
            3000
        );

}


function pauseRoute() {

    routePlaying = false;


    clearInterval(
        routeAnimation
    );

}


function restartRoute() {

    pauseRoute();


    routeIndex = 0;


    moveCursorToMonument(
        routeIndex
    );

}


function updateCursorPosition() {

    if (
        routeCursor &&
        routeCursor.style.display !==
            "none"
    ) {

        moveCursorToMonument(
            routeIndex
        );

    }

}


window.addEventListener(
    "resize",
    updateCursorPosition
);


/* =========================================================
   AVVIO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeMap();

        initializeRouteCursor();

        loadSpeechVoices();


        map.on(
            "move zoom",
            updateCursorPosition
        );


        loadMonuments();

    }
);
