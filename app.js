/* =========================================================
   A CASA DI FRANCESCA
   IL SEGRETO DI VIRGILIO
   ========================================================= */

const DATA_URL = "monumenti_lecce.json";


/* =========================================================
   VARIABILI GLOBALI
   ========================================================= */

let monuments = [];

let currentLanguage = "it";

let currentMonument = null;

let speechUtterance = null;

let map;

let routeCursor;

let routeIndex = 0;

let routeAnimation = null;

let routePlaying = false;


/* =========================================================
   TRADUZIONI INTERFACCIA
   ========================================================= */

const translations = {

    it: {

        secret:
            "Il Segreto di Virgilio",

        more:
            "Scopri di più",

        audio:
            "Ascolta",

        audioDescription:
            "Premi ▶ per ascoltare il testo.",

        video:
            "▶ Guarda il video"

    },


    en: {

        secret:
            "Virgil's Secret",

        more:
            "Find out more",

        audio:
            "Listen",

        audioDescription:
            "Press ▶ to listen to the text.",

        video:
            "▶ Watch the video"

    },


    es: {

        secret:
            "El secreto de Virgilio",

        more:
            "Descubre más",

        audio:
            "Escuchar",

        audioDescription:
            "Pulsa ▶ para escuchar el texto.",

        video:
            "▶ Ver el vídeo"

    }

};


/* =========================================================
   INIZIALIZZAZIONE MAPPA
   ========================================================= */

function initializeMap() {

    /*
     * La mappa viene centrata su
     * A casa di Francesca.
     */

    map = L.map("map", {

        zoomControl: true,

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

}


/* =========================================================
   ICONA MARKER
   ========================================================= */

function createMarkerIcon(isFrancesca) {

    /*
     * A casa di Francesca = ROSSO
     *
     * Tutti gli altri = BLU
     */

    const color =
        isFrancesca
            ? "#d71920"
            : "#1565c0";


    return L.divIcon({

        className:
            "custom-marker",

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

        iconSize:
            [24, 24],

        iconAnchor:
            [12, 24],

        popupAnchor:
            [0, -24]

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


        /*
         * Controllo informativo.
         * L'app è progettata per 35 monumenti.
         */

        console.log(
            `Monumenti caricati: ${monuments.length}`
        );


        addMonumentsToMap();


        /*
         * Posizioniamo inizialmente
         * il cursore sul primo monumento.
         */

        if (monuments.length > 0) {

            moveCursorToMonument(0);

        }


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
   AGGIUNTA MONUMENTI ALLA MAPPA
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

                    offset:
                        [0, -20]

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
   CAMPI JSON IN BASE ALLA LINGUA
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
   RECUPERA IL SEGRETO
   ========================================================= */

function getSecretText(monument) {

    const fields =
        getFieldsForLanguage();


    let text =
        monument[fields.secret];


    /*
     * Nel JSON di Porta Napoli il campo contiene
     * accidentalmente "TheSecret" senza spazio.
     *
     * Gestiamo entrambi i casi.
     */

    if (
        !text &&
        currentLanguage === "en"
    ) {

        text =
            monument[
                "TheSecret of Virgil (Legend/Curiosity)"
            ];

    }


    return text || "";

}


/* =========================================================
   RECUPERA SCOPRI DI PIÙ
   ========================================================= */

function getMoreText(monument) {

    const fields =
        getFieldsForLanguage();


    return (
        monument[fields.more] ||
        ""
    );

}


/* =========================================================
   APERTURA SCHEDA
   ========================================================= */

function openMonument(
    monument,
    marker
) {

    currentMonument =
        monument;


    const labels =
        translations[
            currentLanguage
        ];


    /* -----------------------------------------------------
       NOME
       ----------------------------------------------------- */

    document
        .getElementById(
            "place-name"
        )
        .textContent =
            monument["Nome Luogo"] || "";


    /* -----------------------------------------------------
       SEGRETO
       ----------------------------------------------------- */

    document
        .getElementById(
            "secret-title"
        )
        .textContent =
            labels.secret;


    document
        .getElementById(
            "place-secret"
        )
        .textContent =
            getSecretText(
                monument
            );


    /* -----------------------------------------------------
       SCOPRI DI PIÙ
       ----------------------------------------------------- */

    document
        .getElementById(
            "more-title"
        )
        .textContent =
            labels.more;


    document
        .getElementById(
            "place-more"
        )
        .textContent =
            getMoreText(
                monument
            );


    /* -----------------------------------------------------
       AUDIO
       ----------------------------------------------------- */

    document
        .getElementById(
            "audio-title"
        )
        .textContent =
            labels.audio;


    document
        .getElementById(
            "audio-description"
        )
        .textContent =
            labels.audioDescription;


    /* -----------------------------------------------------
       VIDEO
       ----------------------------------------------------- */

    setupVideo(

        monument["Video"],

        labels

    );


    /* -----------------------------------------------------
       APRI MODALE
       ----------------------------------------------------- */

    document
        .getElementById(
            "place-modal"
        )
        .classList.remove(
            "hidden"
        );


    /*
     * Interrompe eventuale audio precedente.
     */

    stopSpeech();

}


/* =========================================================
   LINGUA AUDIO
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
   TROVA VOCE MIGLIORE
   ========================================================= */

function getBestVoice(language) {

    const voices =
        window.speechSynthesis
            .getVoices();


    if (!voices.length) {

        return null;

    }


    /*
     * Prima cerchiamo corrispondenza
     * esatta.
     */

    let voice =
        voices.find(

            v =>
                v.lang.toLowerCase() ===
                language.toLowerCase()

        );


    if (voice) {

        return voice;

    }


    /*
     * Poi cerchiamo la stessa lingua.
     */

    const prefix =
        language
            .substring(0, 2)
            .toLowerCase();


    voice =
        voices.find(

            v =>
                v.lang
                    .substring(0, 2)
                    .toLowerCase() ===
                prefix

        );


    return voice || null;

}


/* =========================================================
   AUDIO: LEGGE SCOPRI DI PIÙ
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
     * IMPORTANTE:
     * l'audio utilizza esattamente
     * il testo di "Scopri di più".
     */

    const text =
        getMoreText(
            currentMonument
        );


    if (!text.trim()) {

        return;

    }


    stopSpeech();


    speechUtterance =
        new SpeechSynthesisUtterance(
            text
        );


    const language =
        getSpeechLanguage();


    speechUtterance.lang =
        language;


    speechUtterance.rate =
        0.95;


    speechUtterance.pitch =
        1;


    speechUtterance.volume =
        1;


    const voice =
        getBestVoice(
            language
        );


    if (voice) {

        speechUtterance.voice =
            voice;

    }


    window.speechSynthesis
        .speak(
            speechUtterance
        );

}


/* =========================================================
   PAUSA AUDIO
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
   RIPRENDI AUDIO
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
   STOP AUDIO
   ========================================================= */

function stopSpeech() {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }

}


/* =========================================================
   RIPETI AUDIO
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
    .getElementById(
        "audio-play"
    )
    .addEventListener(

        "click",

        function () {

            if (
                window.speechSynthesis
                    .paused
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
    .getElementById(
        "audio-pause"
    )
    .addEventListener(

        "click",

        function () {

            pauseSpeech();

        }

    );


/* =========================================================
   RIPETI
   ========================================================= */

document
    .getElementById(
        "audio-repeat"
    )
    .addEventListener(

        "click",

        function () {

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
        function () {

            window.open(

                videoUrl.trim(),

                "_blank",

                "noopener,noreferrer"

            );

        };

}


/* =========================================================
   CHIUDI SCHEDA
   ========================================================= */

function closeMonument() {

    stopSpeech();


    currentMonument =
        null;


    document
        .getElementById(
            "place-modal"
        )
        .classList.add(
            "hidden"
        );

}


document
    .getElementById(
        "close-modal"
    )
    .addEventListener(

        "click",

        closeMonument

    );


/* =========================================================
   CLICK FUORI DALLA SCHEDA
   ========================================================= */

document
    .getElementById(
        "place-modal"
    )
    .addEventListener(

        "click",

        function (event) {

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

                function () {

                    currentLanguage =
                        this.dataset.lang;


                    /*
                     * Aggiorna pulsante attivo.
                     */

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


                    /*
                     * Se una scheda è aperta,
                     * la aggiorniamo immediatamente.
                     */

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
   CURSORE DEL PERCORSO
   ========================================================= */

function initializeRouteCursor() {

    routeCursor =
        document.getElementById(
            "route-cursor"
        );

}


/* =========================================================
   SPOSTA CURSORE
   ========================================================= */

function moveCursorToMonument(
    index
) {

    if (
        !routeCursor ||
        !monuments[index] ||
        !map
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


    if (
        Number.isNaN(lat) ||
        Number.isNaN(lng)
    ) {

        return;

    }


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


/* =========================================================
   AVVIO PERCORSO
   ========================================================= */

function playRoute() {

    if (!monuments.length) {

        return;

    }


    routePlaying =
        true;


    clearInterval(
        routeAnimation
    );


    moveCursorToMonument(
        routeIndex
    );


    routeAnimation =
        setInterval(

            function () {

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


/* =========================================================
   PAUSA PERCORSO
   ========================================================= */

function pauseRoute() {

    routePlaying =
        false;


    clearInterval(
        routeAnimation
    );

}


/* =========================================================
   RIAVVIA PERCORSO
   ========================================================= */

function restartRoute() {

    pauseRoute();


    routeIndex =
        0;


    moveCursorToMonument(
        routeIndex
    );

}


/* =========================================================
   AGGIORNA POSIZIONE CURSORE
   ========================================================= */

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


/* =========================================================
   AGGIORNAMENTO CURSORE QUANDO MAPPA SI MUOVE
   ========================================================= */

window.addEventListener(

    "resize",

    updateCursorPosition

);


/* =========================================================
   AVVIO APPLICAZIONE
   ========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        initializeMap();


        initializeRouteCursor();


        map.on(

            "move zoom",

            updateCursorPosition

        );


        loadMonuments();

    }

);
