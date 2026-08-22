/* ============================================================
   VIRGILIO - LECCE
   APP.JS

   VERSIONE COMPLETA

   - 35 monumenti caricati dal JSON
   - mappa centrata su A casa di Francesca
   - pin blu
   - A casa di Francesca pin rosso
   - italiano / inglese / spagnolo
   - scheda monumento
   - Segreto di Virgilio
   - Scopri di più
   - audio
   - video
   - cursore Virgilio
   - avvio / pausa / ricomincia
============================================================ */


/* ============================================================
   CONFIGURAZIONE
============================================================ */

const CONFIG = {

    /* File dati */
    jsonFile: "./monumenti_lecce.json",


    /* ========================================================
       CENTRO INIZIALE DELLA MAPPA

       A casa di Francesca
       Coordinate prese direttamente dal JSON.
    ======================================================== */

    mapCenter: [
        40.356820,
        18.171628
    ],


    /* Zoom iniziale */
    defaultZoom: 16,


    /* Monumenti previsti */
    expectedMonuments: 35,


    /* Velocità del cursore */
    cursorSpeed: 0.00022,


    /* Pausa quando raggiunge un monumento */
    pauseAtMonument: 1800,


    /* ========================================================
       LINGUE
    ======================================================== */

    languages: {

        it: {

            code: "it",

            categoryKey:
                "Categoria Ita",

            secretKey:
                "Il Segreto di Virgilio (Leggenda/Curiosità)",

            moreKey:
                "Scopri di più",

            secretTitle:
                "Il Segreto di Virgilio",

            moreTitle:
                "Scopri di più",

            audioTitle:
                "Ascolta",

            videoTitle:
                "Guarda il video",

            playAudio:
                "▶ Ascolta",

            stopAudio:
                "■ Ferma audio",

            audioNote:
                "Audio generato dalla sintesi vocale del dispositivo.",

            noVideo:
                "Video non disponibile."

        },


        en: {

            code: "en",

            categoryKey:
                "Categoria Ing",

            secretKey:
                "The Secret of Virgil (Legend/Curiosity)",

            moreKey:
                "Find out more",

            secretTitle:
                "The Secret of Virgil",

            moreTitle:
                "Find out more",

            audioTitle:
                "Listen",

            videoTitle:
                "Watch the video",

            playAudio:
                "▶ Listen",

            stopAudio:
                "■ Stop audio",

            audioNote:
                "Audio generated using the device's speech synthesis.",

            noVideo:
                "Video not available."

        },


        es: {

            code: "es",

            categoryKey:
                "Categoria Sp",

            secretKey:
                "El secreto de Virgilio (Leyenda/Curiosidad)",

            moreKey:
                "Descubra más",

            secretTitle:
                "El secreto de Virgilio",

            moreTitle:
                "Descubra más",

            audioTitle:
                "Escuchar",

            videoTitle:
                "Ver el vídeo",

            playAudio:
                "▶ Escuchar",

            stopAudio:
                "■ Detener audio",

            audioNote:
                "Audio generado mediante la síntesis de voz del dispositivo.",

            noVideo:
                "Vídeo no disponible."

        }

    }

};


/* ============================================================
   VARIABILI
============================================================ */

let monumenti = [];

let markers = [];

let currentLanguage = "it";

let selectedMonument = null;

let cursorMarker = null;

let routeIndex = 0;

let animationFrame = null;

let animationRunning = false;

let segmentStart = null;

let segmentEnd = null;

let segmentProgress = 0;

let pauseUntil = 0;

let speechUtterance = null;

let speechPlaying = false;


/* ============================================================
   ELEMENTI HTML
============================================================ */

const elements = {

    map:
        document.getElementById("map"),

    languageSelect:
        document.getElementById("language-select"),

    monumentPanel:
        document.getElementById("monument-panel"),

    closePanel:
        document.getElementById("close-panel"),

    monumentName:
        document.getElementById("monument-name"),

    monumentCategory:
        document.getElementById("monument-category"),

    monumentSecret:
        document.getElementById("monument-secret"),

    monumentMore:
        document.getElementById("monument-more"),

    secretTitle:
        document.getElementById("secret-title"),

    moreTitle:
        document.getElementById("more-title"),

    audioTitle:
        document.getElementById("audio-title"),

    videoTitle:
        document.getElementById("video-title"),

    audioContainer:
        document.getElementById("audio-container"),

    videoContainer:
        document.getElementById("video-container"),

    startButton:
        document.getElementById("start-button"),

    pauseButton:
        document.getElementById("pause-button"),

    resetButton:
        document.getElementById("reset-button"),

    routeStatusPosition:
        document.getElementById("route-status-position"),

    loadingScreen:
        document.getElementById("loading-screen")

};


/* ============================================================
   MAPPA

   IMPORTANTISSIMO:
   NON utilizziamo fitBounds().

   La mappa deve rimanere centrata su
   A casa di Francesca all'apertura.
============================================================ */

const map = L.map(
    "map",
    {
        zoomControl: true,

        preferCanvas: true
    }
).setView(

    CONFIG.mapCenter,

    CONFIG.defaultZoom

);


/* ============================================================
   CARTOGRAFIA
============================================================ */

L.tileLayer(

    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

    {

        maxZoom: 19,

        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'

    }

).addTo(map);


/* ============================================================
   PIN BLU
============================================================ */

const blueIcon = L.icon({

    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",

    iconSize: [
        25,
        41
    ],

    iconAnchor: [
        12,
        41
    ],

    popupAnchor: [
        1,
        -34
    ],

    shadowSize: [
        41,
        41
    ]

});


/* ============================================================
   PIN ROSSO
============================================================ */

const redIcon = L.icon({

    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",

    iconSize: [
        25,
        41
    ],

    iconAnchor: [
        12,
        41
    ],

    popupAnchor: [
        1,
        -34
    ],

    shadowSize: [
        41,
        41
    ]

});


/* ============================================================
   ICONA CURSORE VIRGILIO
============================================================ */

const cursorIcon = L.divIcon({

    className:
        "virgilio-cursor-wrapper",

    html:
        '<div class="virgilio-cursor">V</div>',

    iconSize: [
        36,
        36
    ],

    iconAnchor: [
        18,
        18
    ]

});


/* ============================================================
   UTILITY
============================================================ */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   NOME MONUMENTO
============================================================ */

function getNome(monumento) {

    return (
        monumento["Nome Luogo"] ||
        ""
    );

}


/* ============================================================
   COORDINATE
============================================================ */

function getCoordinate(monumento) {

    const lat =
        parseFloat(
            monumento["Lat"]
        );

    const lng =
        parseFloat(
            monumento["Long"]
        );


    if (
        Number.isFinite(lat) &&
        Number.isFinite(lng)
    ) {

        return {

            lat: lat,

            lng: lng

        };

    }


    return null;

}


/* ============================================================
   CONTROLLO A CASA DI FRANCESCA
============================================================ */

function isFrancesca(monumento) {

    return (

        getNome(monumento)

            .trim()

            .toLowerCase()

            ===

            "a casa di francesca"

    );

}


/* ============================================================
   DATI LOCALIZZATI
============================================================ */

function getLocalizedData(monumento) {

    const language =
        CONFIG.languages[
            currentLanguage
        ];


    let secret =
        monumento[
            language.secretKey
        ];


    /* ========================================================
       CORREZIONE DEL CAMPO INGLESE DI PORTA NAPOLI

       Nel JSON attuale è presente:
       "TheSecret of Virgil..."

       anziché:
       "The Secret of Virgil..."
    ======================================================== */

    if (
        currentLanguage === "en" &&
        !secret
    ) {

        secret =
            monumento[
                "TheSecret of Virgil (Legend/Curiosity)"
            ];

    }


    return {

        name:
            getNome(monumento),

        category:
            monumento[
                language.categoryKey
            ] || "",

        secret:
            secret || "",

        more:
            monumento[
                language.moreKey
            ] || "",

        video:
            monumento[
                "Video"
            ] || "",

        audio:
            getAudioUrl(
                monumento,
                currentLanguage
            )

    };

}


/* ============================================================
   AUDIO

   Il JSON attuale non contiene ancora i 105 MP3.

   Il codice è comunque già predisposto per usarli.

   Quando aggiungeremo i percorsi degli MP3 al JSON,
   verranno utilizzati automaticamente.

   In assenza di MP3 viene utilizzata la sintesi vocale.
============================================================ */

function getAudioUrl(
    monumento,
    language
) {

    const keys = {

        it: [
            "Audio Ita",
            "Audio IT",
            "Audio Italiano",
            "audio_it",
            "audio_ita"
        ],

        en: [
            "Audio Ing",
            "Audio EN",
            "Audio English",
            "audio_en",
            "audio_eng"
        ],

        es: [
            "Audio Sp",
            "Audio ES",
            "Audio Español",
            "audio_es",
            "audio_esp"
        ]

    };


    const possibleKeys =
        keys[language] || [];


    for (
        const key of possibleKeys
    ) {

        if (
            monumento[key] &&
            String(
                monumento[key]
            ).trim() !== ""
        ) {

            return String(
                monumento[key]
            ).trim();

        }

    }


    return "";

}


/* ============================================================
   CREAZIONE DEI 35 PIN
============================================================ */

function creaMarkers() {

    markers.forEach(

        marker => {

            map.removeLayer(
                marker
            );

        }

    );


    markers = [];


    monumenti.forEach(

        (
            monumento,
            index
        ) => {

            const coordinate =
                getCoordinate(
                    monumento
                );


            if (!coordinate) {

                return;

            }


            /* -----------------------------------------------
               Francesca = ROSSO
               Tutti gli altri = BLU
            ------------------------------------------------ */

            const icon =
                isFrancesca(
                    monumento
                )

                    ? redIcon

                    : blueIcon;


            const marker =
                L.marker(

                    [
                        coordinate.lat,
                        coordinate.lng
                    ],

                    {
                        icon: icon
                    }

                ).addTo(map);


            marker.monumento =
                monumento;


            marker.routeIndex =
                index;


            /* -----------------------------------------------
               CLICK PIN
            ------------------------------------------------ */

            marker.on(

                "click",

                () => {

                    apriScheda(
                        monumento
                    );

                }

            );


            /* -----------------------------------------------
               TOOLTIP
            ------------------------------------------------ */

            marker.bindTooltip(

                escapeHtml(
                    getNome(
                        monumento
                    )
                ),

                {

                    direction: "top",

                    offset: [
                        0,
                        -35
                    ]

                }

            );


            markers.push(
                marker
            );

        }

    );

}


/* ============================================================
   CREA CURSORE
============================================================ */

function creaCursore() {

    if (
        cursorMarker
    ) {

        map.removeLayer(
            cursorMarker
        );

    }


    if (
        monumenti.length === 0
    ) {

        return;

    }


    /*
       Il cursore parte dal primo monumento
       dell'ordine presente nel JSON.
    */

    const first =
        getCoordinate(
            monumenti[0]
        );


    if (!first) {

        return;

    }


    cursorMarker =
        L.marker(

            [
                first.lat,
                first.lng
            ],

            {

                icon:
                    cursorIcon,

                zIndexOffset:
                    1000,

                interactive:
                    false

            }

        ).addTo(map);


    routeIndex = 0;

    segmentStart = null;

    segmentEnd = null;

    segmentProgress = 0;

    aggiornaStatoPercorso();

}


/* ============================================================
   APERTURA SCHEDA
============================================================ */

function apriScheda(monumento) {

    selectedMonument =
        monumento;


    aggiornaScheda();


    elements.monumentPanel
        .classList
        .remove(
            "hidden"
        );


    elements.monumentPanel
        .setAttribute(
            "aria-hidden",
            "false"
        );

}


/* ============================================================
   CHIUSURA SCHEDA
============================================================ */

function chiudiScheda() {

    elements.monumentPanel
        .classList
        .add(
            "hidden"
        );


    elements.monumentPanel
        .setAttribute(
            "aria-hidden",
            "true"
        );


    selectedMonument =
        null;


    stopSpeech();

}


/* ============================================================
   AGGIORNA SCHEDA
============================================================ */

function aggiornaScheda() {

    if (
        !selectedMonument
    ) {

        return;

    }


    const language =
        CONFIG.languages[
            currentLanguage
        ];


    const data =
        getLocalizedData(
            selectedMonument
        );


    elements.monumentName
        .textContent =
        data.name;


    elements.monumentCategory
        .textContent =
        data.category;


    elements.monumentSecret
        .textContent =
        data.secret;


    elements.monumentMore
        .textContent =
        data.more;


    elements.secretTitle
        .textContent =
        language.secretTitle;


    elements.moreTitle
        .textContent =
        language.moreTitle;


    elements.audioTitle
        .textContent =
        language.audioTitle;


    elements.videoTitle
        .textContent =
        language.videoTitle;


    creaAudio(
        selectedMonument,
        data.audio
    );


    creaVideo(
        data.video
    );

}


/* ============================================================
   AUDIO
============================================================ */

function creaAudio(
    monumento,
    audioUrl
) {

    const language =
        CONFIG.languages[
            currentLanguage
        ];


    elements.audioContainer
        .innerHTML = "";


    /* ========================================================
       SE ESISTE UN MP3 REALE
    ======================================================== */

    if (
        audioUrl
    ) {

        const audio =
            document.createElement(
                "audio"
            );


        audio.controls =
            true;


        audio.preload =
            "none";


        audio.src =
            audioUrl;


        audio.className =
            "audio-player";


        elements.audioContainer
            .appendChild(
                audio
            );


        return;

    }


    /* ========================================================
       SINTESI VOCALE
    ======================================================== */

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "audio-button";


    button.textContent =
        language.playAudio;


    button.addEventListener(

        "click",

        () => {

            if (
                speechPlaying
            ) {

                stopSpeech();

                button.textContent =
                    language.playAudio;

                return;

            }


            speakMonument(
                monumento
            );


            button.textContent =
                language.stopAudio;

        }

    );


    elements.audioContainer
        .appendChild(
            button
        );


    const note =
        document.createElement(
            "div"
        );


    note.className =
        "audio-note";


    note.textContent =
        language.audioNote;


    elements.audioContainer
        .appendChild(
            note
        );

}


/* ============================================================
   TESTO PER SINTESI VOCALE
============================================================ */

function getSpeechText(
    monumento
) {

    const data =
        getLocalizedData(
            monumento
        );


    return [

        data.name,

        data.secret,

        data.more

    ]

        .filter(
            Boolean
        )

        .join(". ");

}


/* ============================================================
   AVVIO SINTESI VOCALE
============================================================ */

function speakMonument(
    monumento
) {

    if (
        !(
            "speechSynthesis"
            in window
        )
    ) {

        alert(
            "La sintesi vocale non è supportata da questo browser."
        );

        return;

    }


    stopSpeech();


    const text =
        getSpeechText(
            monumento
        );


    speechUtterance =
        new SpeechSynthesisUtterance(
            text
        );


    speechUtterance.lang =

        currentLanguage === "it"

            ? "it-IT"

            : currentLanguage === "en"

                ? "en-US"

                : "es-ES";


    speechUtterance.rate =
        0.92;


    speechUtterance.pitch =
        1;


    speechUtterance.volume =
        1;


    speechUtterance.onstart =
        () => {

            speechPlaying =
                true;

        };


    speechUtterance.onend =
        () => {

            speechPlaying =
                false;

            aggiornaScheda();

        };


    speechUtterance.onerror =
        () => {

            speechPlaying =
                false;

        };


    window.speechSynthesis
        .speak(
            speechUtterance
        );

}


/* ============================================================
   FERMA SINTESI
============================================================ */

function stopSpeech() {

    if (
        "speechSynthesis"
        in window
    ) {

        window.speechSynthesis
            .cancel();

    }


    speechPlaying =
        false;

}


/* ============================================================
   VIDEO
============================================================ */

function creaVideo(
    videoUrl
) {

    const language =
        CONFIG.languages[
            currentLanguage
        ];


    elements.videoContainer
        .innerHTML = "";


    if (
        !videoUrl
    ) {

        const message =
            document.createElement(
                "p"
            );


        message.className =
            "no-media";


        message.textContent =
            language.noVideo;


        elements.videoContainer
            .appendChild(
                message
            );


        return;

    }


    const youtubeId =
        getYoutubeId(
            videoUrl
        );


    /* ========================================================
       YOUTUBE
    ======================================================== */

    if (
        youtubeId
    ) {

        const iframe =
            document.createElement(
                "iframe"
            );


        iframe.className =
            "video-frame";


        iframe.src =
            "https://www.youtube.com/embed/" +
            youtubeId;


        iframe.title =
            "Virgilio video";


        iframe.loading =
            "lazy";


        iframe.allow =
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";


        iframe.allowFullscreen =
            true;


        elements.videoContainer
            .appendChild(
                iframe
            );


        return;

    }


    /* ========================================================
       LINK VIDEO
    ======================================================== */

    const link =
        document.createElement(
            "a"
        );


    link.className =
        "video-link";


    link.href =
        videoUrl;


    link.target =
        "_blank";


    link.rel =
        "noopener noreferrer";


    link.textContent =
        "▶ " +
        language.videoTitle;


    elements.videoContainer
        .appendChild(
            link
        );

}


/* ============================================================
   ESTRAI ID YOUTUBE
============================================================ */

function getYoutubeId(
    url
) {

    if (
        !url
    ) {

        return null;

    }


    try {

        const parsed =
            new URL(
                url
            );


        /* youtube.com/watch?v= */

        if (
            parsed.hostname
                .includes(
                    "youtube.com"
                )
        ) {

            const id =
                parsed.searchParams
                    .get(
                        "v"
                    );


            if (
                id
            ) {

                return id;

            }


            /* youtube.com/embed/ID */

            const match =
                parsed.pathname.match(
                    /\/embed\/([^/?]+)/
                );


            if (
                match
            ) {

                return match[1];

            }

        }


        /* youtu.be/ID */

        if (
            parsed.hostname ===
            "youtu.be"
        ) {

            return parsed.pathname
                .replace(
                    "/",
                    ""
                );

        }

    }

    catch (
        error
    ) {

        console.warn(
            "URL video non valida:",
            url
        );

    }


    return null;

}


/* ============================================================
   INTERPOLAZIONE
============================================================ */

function interpolate(
    start,
    end,
    progress
) {

    return {

        lat:
            start.lat +
            (
                end.lat -
                start.lat
            ) *
            progress,

        lng:
            start.lng +
            (
                end.lng -
                start.lng
            ) *
            progress

    };

}


/* ============================================================
   ANIMAZIONE CURSORE
============================================================ */

function animateCursor(
    timestamp
) {

    if (
        !animationRunning
    ) {

        animationFrame =
            null;

        return;

    }


    if (
        monumenti.length < 2
    ) {

        animationRunning =
            false;

        animationFrame =
            null;

        return;

    }


    /* ========================================================
       PAUSA
    ======================================================== */

    if (
        pauseUntil &&
        timestamp < pauseUntil
    ) {

        animationFrame =
            requestAnimationFrame(
                animateCursor
            );

        return;

    }


    pauseUntil = 0;


    /* ========================================================
       FINE PERCORSO
    ======================================================== */

    if (
        routeIndex >=
        monumenti.length - 1
    ) {

        animationRunning =
            false;

        animationFrame =
            null;

        aggiornaStatoPercorso();

        return;

    }


    /* ========================================================
       CREA SEGMENTO
    ======================================================== */

    if (
        !segmentStart ||
        !segmentEnd
    ) {

        const current =
            getCoordinate(
                monumenti[
                    routeIndex
                ]
            );


        const next =
            getCoordinate(
                monumenti[
                    routeIndex + 1
                ]
            );


        if (
            !current ||
            !next
        ) {

            routeIndex++;

            segmentStart =
                null;

            segmentEnd =
                null;

            segmentProgress =
                0;

            animationFrame =
                requestAnimationFrame(
                    animateCursor
                );

            return;

        }


        segmentStart =
            current;


        segmentEnd =
            next;


        segmentProgress =
            0;

    }


    /* ========================================================
       MOVIMENTO
    ======================================================== */

    segmentProgress +=
        CONFIG.cursorSpeed;


    if (
        segmentProgress >= 1
    ) {

        segmentProgress =
            1;


        const finalPosition =
            interpolate(

                segmentStart,

                segmentEnd,

                segmentProgress

            );


        cursorMarker.setLatLng(

            [
                finalPosition.lat,
                finalPosition.lng
            ]

        );


        routeIndex++;


        segmentStart =
            null;

        segmentEnd =
            null;

        segmentProgress =
            0;


        aggiornaStatoPercorso();


        /* ====================================================
           APRE LA SCHEDA DEL MONUMENTO RAGGIUNTO
        ==================================================== */

        if (
            routeIndex <
            monumenti.length
        ) {

            apriScheda(
                monumenti[
                    routeIndex
                ]
            );


            pauseUntil =
                timestamp +
                CONFIG.pauseAtMonument;

        }


    }

    else {

        const position =
            interpolate(

                segmentStart,

                segmentEnd,

                segmentProgress

            );


        cursorMarker.setLatLng(

            [
                position.lat,
                position.lng
            ]

        );

    }


    animationFrame =
        requestAnimationFrame(
            animateCursor
        );

}


/* ============================================================
   AVVIA PERCORSO
============================================================ */

function startRoute() {

    if (
        monumenti.length < 2
    ) {

        return;

    }


    /* Se siamo alla fine, ricominciamo */

    if (
        routeIndex >=
        monumenti.length - 1
    ) {

        resetRoute();

    }


    animationRunning =
        true;


    pauseUntil =
        0;


    if (
        !animationFrame
    ) {

        animationFrame =
            requestAnimationFrame(
                animateCursor
            );

    }

}


/* ============================================================
   PAUSA
============================================================ */

function pauseRoute() {

    animationRunning =
        false;


    if (
        animationFrame
    ) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame =
            null;

    }

}


/* ============================================================
   RICOMINCIA
============================================================ */

function resetRoute() {

    pauseRoute();


    routeIndex =
        0;


    segmentStart =
        null;


    segmentEnd =
        null;


    segmentProgress =
        0;


    pauseUntil =
        0;


    if (
        cursorMarker &&
        monumenti.length > 0
    ) {

        const first =
            getCoordinate(
                monumenti[0]
            );


        if (
            first
        ) {

            cursorMarker.setLatLng(

                [
                    first.lat,
                    first.lng
                ]

            );

        }

    }


    aggiornaStatoPercorso();


    chiudiScheda();

}


/* ============================================================
   STATO PERCORSO
============================================================ */

function aggiornaStatoPercorso() {

    if (
        !elements.routeStatusPosition
    ) {

        return;

    }


    const total =
        monumenti.length;


    const current =
        Math.min(

            routeIndex + 1,

            total

        );


    elements.routeStatusPosition
        .textContent =
        current +
        " / " +
        total;

}


/* ============================================================
   CAMBIO LINGUA
============================================================ */

function cambiaLingua(
    language
) {

    if (
        !CONFIG.languages[
            language
        ]
    ) {

        return;

    }


    currentLanguage =
        language;


    document.documentElement.lang =
        language;


    stopSpeech();


    if (
        selectedMonument
    ) {

        aggiornaScheda();

    }


    /* Aggiorna i nomi dei pin */

    markers.forEach(

        marker => {

            if (
                marker.monumento
            ) {

                marker.setTooltipContent(

                    escapeHtml(
                        getNome(
                            marker.monumento
                        )
                    )

                );

            }

        }

    );

}


/* ============================================================
   CARICA JSON
============================================================ */

async function caricaMonumenti() {

    try {

        const response =
            await fetch(
                CONFIG.jsonFile,
                {
                    cache: "no-cache"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(

                "Impossibile caricare " +
                CONFIG.jsonFile +
                " (HTTP " +
                response.status +
                ")."

            );

        }


        const data =
            await response.json();


        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "Il file JSON non contiene un array valido."
            );

        }


        monumenti =
            data.filter(

                monumento => {

                    return (
                        getCoordinate(
                            monumento
                        ) !== null
                    );

                }

            );


        if (
            monumenti.length === 0
        ) {

            throw new Error(
                "Non è stato trovato nessun monumento con coordinate valide."
            );

        }


        console.log(
            "Virgilio: caricati " +
            monumenti.length +
            " monumenti."
        );


        /* ====================================================
           CONTROLLO DEI 35 MONUMENTI
        ==================================================== */

        if (
            monumenti.length !==
            CONFIG.expectedMonuments
        ) {

            console.warn(

                "ATTENZIONE: il JSON contiene " +
                monumenti.length +
                " monumenti. " +
                "Sono previsti " +
                CONFIG.expectedMonuments +
                "."

            );

        }


        /* ====================================================
           CONTROLLO FRANCESCA
        ==================================================== */

        const francesca =
            monumenti.find(
                isFrancesca
            );


        if (
            !francesca
        ) {

            console.warn(
                "A casa di Francesca non è stata trovata nel JSON."
            );

        }


        /* ====================================================
           CREA PIN
        ==================================================== */

        creaMarkers();


        /* ====================================================
           CREA CURSORE
        ==================================================== */

        creaCursore();


        /* ====================================================
           IMPORTANTISSIMO:
           NON fare fitBounds.

           La mappa deve rimanere centrata su
           A casa di Francesca.
        ==================================================== */

        map.setView(

            CONFIG.mapCenter,

            CONFIG.defaultZoom

        );


        nascondiLoading();


    }

    catch (
        error
    ) {

        console.error(
            "Errore:",
            error
        );


        mostraErroreCaricamento(
            error
        );

    }

}


/* ============================================================
   NASCONDI LOADING
============================================================ */

function nascondiLoading() {

    elements.loadingScreen
        .classList
        .add(
            "hidden"
        );

}


/* ============================================================
   MOSTRA ERRORE
============================================================ */

function mostraErroreCaricamento(
    error
) {

    elements.loadingScreen
        .innerHTML = `

            <div class="loading-box">

                <h2>
                    Impossibile caricare Virgilio
                </h2>

                <p>
                    Controlla che
                    <strong>
                        monumenti_lecce.json
                    </strong>
                    si trovi nella stessa cartella
                    di
                    <strong>
                        index.html
                    </strong>.
                </p>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>

        `;

}


/* ============================================================
   EVENTI
============================================================ */

function collegaEventi() {

    /* ========================================================
       CAMBIO LINGUA
    ======================================================== */

    elements.languageSelect
        .addEventListener(

            "change",

            event => {

                cambiaLingua(
                    event.target.value
                );

            }

        );


    /* ========================================================
       CHIUDI SCHEDA
    ======================================================== */

    elements.closePanel
        .addEventListener(

            "click",

            chiudiScheda

        );


    /* ========================================================
       AVVIA
    ======================================================== */

    elements.startButton
        .addEventListener(

            "click",

            startRoute

        );


    /* ========================================================
       PAUSA
    ======================================================== */

    elements.pauseButton
        .addEventListener(

            "click",

            pauseRoute

        );


    /* ========================================================
       RICOMINCIA
    ======================================================== */

    elements.resetButton
        .addEventListener(

            "click",

            resetRoute

        );


    /* ========================================================
       ESC = CHIUDI SCHEDA
    ======================================================== */

    document.addEventListener(

        "keydown",

        event => {

            if (
                event.key === "Escape"
            ) {

                chiudiScheda();

            }

        }

    );

}


/* ============================================================
   AVVIO
============================================================ */

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        collegaEventi();

        await caricaMonumenti();

    }

);
