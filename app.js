/* ============================================================
   VIRGILIO - LECCE
   APP.JS

   Funzioni:
   - caricamento dei 35 monumenti dal JSON
   - mappa Leaflet
   - pin blu
   - pin rosso A casa di Francesca
   - 3 lingue
   - scheda monumento
   - audio
   - video
   - cursore animato
   - controlli avvio / pausa / reset
============================================================ */


/* ============================================================
   CONFIGURAZIONE
============================================================ */

const CONFIG = {

    jsonFile: "./monumenti_lecce.json",

    mapCenter: [
        40.3547,
        18.1728
    ],

    defaultZoom: 15,

    languages: {

        it: {
            code: "it",
            label: "Italiano",

            categoryKey: "Categoria Ita",

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
                "Video non disponibile.",

            noAudio:
                "Audio non disponibile."
        },

        en: {
            code: "en",
            label: "English",

            categoryKey: "Categoria Ing",

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
                "Audio generated using your device's speech synthesis.",

            noVideo:
                "Video not available.",

            noAudio:
                "Audio not available."
        },

        es: {
            code: "es",
            label: "Español",

            categoryKey: "Categoria Sp",

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
                "Vídeo no disponible.",

            noAudio:
                "Audio no disponible."
        }
    },

    /* Velocità del cursore.
       Maggiore = più veloce.
    */
    cursorSpeed:
        0.00025,

    /* Pausa automatica quando il cursore
       arriva a un monumento.
    */
    pauseAtMonument:
        1200
};


/* ============================================================
   VARIABILI GLOBALI
============================================================ */

let monumenti = [];

let markers = [];

let currentLanguage = "it";

let selectedMonument = null;

let routeIndex = 0;

let cursorMarker = null;

let animationFrame = null;

let animationRunning = false;

let segmentStart = null;

let segmentEnd = null;

let segmentProgress = 0;

let pauseUntil = 0;


/* ============================================================
   ELEMENTI HTML
============================================================ */

const elements = {

    map: null,

    languageSelect: null,

    monumentPanel: null,

    closePanel: null,

    monumentName: null,

    monumentCategory: null,

    monumentSecret: null,

    monumentMore: null,

    secretTitle: null,

    moreTitle: null,

    audioTitle: null,

    videoTitle: null,

    audioContainer: null,

    videoContainer: null,

    startButton: null,

    pauseButton: null,

    resetButton: null,

    routeStatusPosition: null,

    loadingScreen: null
};


/* ============================================================
   ICONA PIN BLU
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
   ICONA PIN ROSSA
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
   ICONA DEL CURSORE VIRGILIO
============================================================ */

const cursorIcon = L.divIcon({

    className:
        "virgilio-cursor-wrapper",

    html:
        '<div class="virgilio-cursor">V</div>',

    iconSize: [
        34,
        34
    ],

    iconAnchor: [
        17,
        17
    ]
});


/* ============================================================
   CREAZIONE MAPPA
============================================================ */

const map = L.map("map", {

    zoomControl: true,

    preferCanvas: true

}).setView(

    CONFIG.mapCenter,

    CONFIG.defaultZoom

);


/* ============================================================
   MAPPA OPENSTREETMAP
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
   INIZIALIZZAZIONE DOM
============================================================ */

function inizializzaElementi() {

    elements.map =
        document.getElementById("map");

    elements.languageSelect =
        document.getElementById("language-select");

    elements.monumentPanel =
        document.getElementById("monument-panel");

    elements.closePanel =
        document.getElementById("close-panel");

    elements.monumentName =
        document.getElementById("monument-name");

    elements.monumentCategory =
        document.getElementById("monument-category");

    elements.monumentSecret =
        document.getElementById("monument-secret");

    elements.monumentMore =
        document.getElementById("monument-more");

    elements.secretTitle =
        document.getElementById("secret-title");

    elements.moreTitle =
        document.getElementById("more-title");

    elements.audioTitle =
        document.getElementById("audio-title");

    elements.videoTitle =
        document.getElementById("video-title");

    elements.audioContainer =
        document.getElementById("audio-container");

    elements.videoContainer =
        document.getElementById("video-container");

    elements.startButton =
        document.getElementById("start-button");

    elements.pauseButton =
        document.getElementById("pause-button");

    elements.resetButton =
        document.getElementById("reset-button");

    elements.routeStatusPosition =
        document.getElementById(
            "route-status-position"
        );

    elements.loadingScreen =
        document.getElementById(
            "loading-screen"
        );
}


/* ============================================================
   UTILITÀ
============================================================ */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   OTTIENI NOME
============================================================ */

function getNome(monumento) {

    return monumento["Nome Luogo"] || "";
}


/* ============================================================
   OTTIENI COORDINATE
============================================================ */

function getCoordinate(monumento) {

    const lat =
        parseFloat(
            monumento.Lat
        );

    const lng =
        parseFloat(
            monumento.Long
        );

    if (
        Number.isFinite(lat) &&
        Number.isFinite(lng)
    ) {

        return {
            lat,
            lng
        };

    }

    return null;
}


/* ============================================================
   CONTROLLO FRANCESCA
============================================================ */

function isFrancesca(monumento) {

    const nome =
        getNome(monumento)
            .trim()
            .toLowerCase();

    return (
        nome === "a casa di francesca"
    );
}


/* ============================================================
   OTTIENI TESTO IN BASE ALLA LINGUA
============================================================ */

function getLocalizedData(monumento) {

    const language =
        CONFIG.languages[
            currentLanguage
        ];

    return {

        name:
            getNome(monumento),

        category:
            monumento[
                language.categoryKey
            ] || "",

        secret:
            monumento[
                language.secretKey
            ] || "",

        more:
            monumento[
                language.moreKey
            ] || "",

        video:
            monumento["Video"] || "",

        audio:
            getAudioUrl(
                monumento,
                currentLanguage
            )

    };
}


/* ============================================================
   AUDIO

   Il codice cerca prima eventuali campi audio
   presenti nel JSON.

   Se non esistono, utilizza la sintesi vocale
   del browser.
============================================================ */

function getAudioUrl(
    monumento,
    language
) {

    const possibleKeys = {

        it: [
            "Audio Ita",
            "Audio IT",
            "Audio Italiano",
            "audio_ita",
            "audio_it"
        ],

        en: [
            "Audio Ing",
            "Audio EN",
            "Audio English",
            "audio_eng",
            "audio_en"
        ],

        es: [
            "Audio Sp",
            "Audio ES",
            "Audio Español",
            "audio_esp",
            "audio_es"
        ]

    };


    const keys =
        possibleKeys[language] || [];


    for (
        const key of keys
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
   CREAZIONE MARKER
============================================================ */

function creaMarkers() {

    markers.forEach(
        marker => map.removeLayer(marker)
    );

    markers = [];


    monumenti.forEach(

        (monumento, index) => {

            const coordinate =
                getCoordinate(monumento);

            if (!coordinate) {
                return;
            }


            const icon =
                isFrancesca(monumento)
                    ? redIcon
                    : blueIcon;


            const marker =
                L.marker(

                    [
                        coordinate.lat,
                        coordinate.lng
                    ],

                    {
                        icon
                    }

                ).addTo(map);


            marker.monumento =
                monumento;

            marker.routeIndex =
                index;


            marker.on(
                "click",
                () => {

                    apriScheda(
                        monumento
                    );

                }
            );


            marker.bindTooltip(

                escapeHtml(
                    getNome(monumento)
                ),

                {
                    direction: "top",

                    offset: [
                        0,
                        -35
                    ]
                }

            );


            markers.push(marker);

        }

    );
}


/* ============================================================
   ADATTA LA MAPPA AI 35 PUNTI
============================================================ */

function adattaMappa() {

    const coordinates =
        monumenti

            .map(
                getCoordinate
            )

            .filter(
                Boolean
            )

            .map(
                coordinate => [
                    coordinate.lat,
                    coordinate.lng
                ]
            );


    if (
        coordinates.length === 0
    ) {
        return;
    }


    const bounds =
        L.latLngBounds(
            coordinates
        );


    map.fitBounds(
        bounds,
        {

            padding: [
                50,
                50
            ]

        }
    );
}


/* ============================================================
   SCHEDA MONUMENTO
============================================================ */

function apriScheda(monumento) {

    selectedMonument =
        monumento;


    aggiornaScheda();


    elements.monumentPanel
        .classList
        .remove("hidden");


    elements.monumentPanel
        .setAttribute(
            "aria-hidden",
            "false"
        );

}


/* ============================================================
   CHIUDI SCHEDA
============================================================ */

function chiudiScheda() {

    elements.monumentPanel
        .classList
        .add("hidden");


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

    if (!selectedMonument) {
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

let speechUtterance = null;

let speechPlaying = false;


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


    /* --------------------------------------------------------
       CASO 1:
       ESISTE UN FILE AUDIO REALE
    -------------------------------------------------------- */

    if (audioUrl) {

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "audio-player";


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

        audio.style.width =
            "100%";


        wrapper.appendChild(
            audio
        );


        elements.audioContainer
            .appendChild(
                wrapper
            );

        return;
    }


    /* --------------------------------------------------------
       CASO 2:
       USIAMO SINTESI VOCALE
    -------------------------------------------------------- */

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
   TESTO DA LEGGERE
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
   SINTESI VOCALE
============================================================ */

function speakMonument(
    monumento
) {

    if (
        !("speechSynthesis" in window)
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
   FERMA AUDIO
============================================================ */

function stopSpeech() {

    if (
        "speechSynthesis" in window
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


    /* --------------------------------------------------------
       VIDEO YOUTUBE
    -------------------------------------------------------- */

    if (youtubeId) {

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
            "YouTube video";


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


    /* --------------------------------------------------------
       LINK VIDEO GENERICO
    -------------------------------------------------------- */

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
                    .get("v");

            if (id) {
                return id;
            }

            /* youtube.com/embed/ID */
            const embedMatch =
                parsed.pathname.match(
                    /\/embed\/([^/?]+)/
                );

            if (
                embedMatch
            ) {
                return embedMatch[1];
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

    } catch (error) {

        console.warn(
            "URL video non valida:",
            url
        );

    }


    return null;
}


/* ============================================================
   CREAZIONE CURSORE
============================================================ */

function creaCursore() {

    if (cursorMarker) {

        map.removeLayer(
            cursorMarker
        );

    }


    if (
        monumenti.length === 0
    ) {
        return;
    }


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


    routeIndex =
        0;

    segmentStart =
        null;

    segmentEnd =
        null;

    segmentProgress =
        0;


    aggiornaStatoPercorso();
}


/* ============================================================
   INTERPOLAZIONE POSIZIONE
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

        return;
    }


    if (
        monumenti.length < 2
    ) {

        animationRunning =
            false;

        return;
    }


    /* --------------------------------------------------------
       PAUSA AUTOMATICA
    -------------------------------------------------------- */

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


    pauseUntil =
        0;


    /* --------------------------------------------------------
       CREIAMO IL SEGMENTO
    -------------------------------------------------------- */

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


        const nextIndex =
            routeIndex + 1;


        if (
            nextIndex >=
            monumenti.length
        ) {

            animationRunning =
                false;

            aggiornaStatoPercorso();

            return;
        }


        const next =
            getCoordinate(
                monumenti[
                    nextIndex
                ]
            );


        if (
            !current ||
            !next
        ) {

            routeIndex =
                nextIndex;

            segmentStart =
                null;

            segmentEnd =
                null;

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


    /* --------------------------------------------------------
       MOVIMENTO
    -------------------------------------------------------- */

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


        routeIndex += 1;


        segmentStart =
            null;

        segmentEnd =
            null;

        segmentProgress =
            0;


        aggiornaStatoPercorso();


        /* ----------------------------------------------------
           APRIAMO AUTOMATICAMENTE IL MONUMENTO RAGGIUNTO
        ---------------------------------------------------- */

        if (
            routeIndex <
            monumenti.length
        ) {

            const monumento =
                monumenti[
                    routeIndex
                ];


            apriScheda(
                monumento
            );


            pauseUntil =
                timestamp +
                CONFIG.pauseAtMonument;

        }


    } else {

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
   RESET
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
        monumenti.length > 0
    ) {

        const coordinate =
            getCoordinate(
                monumenti[0]
            );


        if (
            coordinate &&
            cursorMarker
        ) {

            cursorMarker.setLatLng(

                [
                    coordinate.lat,
                    coordinate.lng
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


    let current =
        routeIndex;


    if (
        total > 0
    ) {

        current =
            Math.min(
                routeIndex + 1,
                total
            );

    }


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


    document.documentElement
        .lang =
        language;


    stopSpeech();


    /* --------------------------------------------------------
       AGGIORNA LA SCHEDA APERTA
    -------------------------------------------------------- */

    if (
        selectedMonument
    ) {

        aggiornaScheda();

    }


    /* --------------------------------------------------------
       AGGIORNA TOOLTIP
    -------------------------------------------------------- */

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
   CARICAMENTO JSON
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
                "HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "Il JSON non contiene un array."
            );

        }


        monumenti =
            data.filter(

                monumento =>
                    getCoordinate(
                        monumento
                    ) !== null

            );


        if (
            monumenti.length === 0
        ) {

            throw new Error(
                "Nessun monumento con coordinate valide."
            );

        }


        console.log(
            "Virgilio: caricati " +
            monumenti.length +
            " monumenti."
        );


        if (
            monumenti.length !== 35
        ) {

            console.warn(
                "Attenzione: il JSON contiene " +
                monumenti.length +
                " punti invece dei 35 previsti."
            );

        }


        creaMarkers();

        adattaMappa();

        creaCursore();

        nascondiLoading();


    } catch (error) {

        console.error(
            "Errore caricamento monumenti:",
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
        .add("hidden");

}


/* ============================================================
   ERRORE CARICAMENTO
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
                    di index.html.
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

    /* LINGUA */

    elements.languageSelect
        .addEventListener(

            "change",

            event => {

                cambiaLingua(
                    event.target.value
                );

            }

        );


    /* CHIUDI SCHEDA */

    elements.closePanel
        .addEventListener(

            "click",

            chiudiScheda

        );


    /* AVVIA */

    elements.startButton
        .addEventListener(

            "click",

            startRoute

        );


    /* PAUSA */

    elements.pauseButton
        .addEventListener(

            "click",

            pauseRoute

        );


    /* RESET */

    elements.resetButton
        .addEventListener(

            "click",

            resetRoute

        );


    /* ESC PER CHIUDERE */

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
   AVVIO APPLICAZIONE
============================================================ */

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        inizializzaElementi();

        collegaEventi();

        await caricaMonumenti();

    }

);
