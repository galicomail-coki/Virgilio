/**
 * APP.JS - Virgilio Tour Lecce
 */

// 1. Variabili globali per memorizzare i dati e la lingua corrente
let datiLocali = [];
let linguaCorrente = 'Ita'; // Default: 'Ita' ('Ita', 'Ing', 'Sp')

// 2. Inizializzazione della mappa centrata su Lecce
const map = L.map('map').setView([40.3547, 18.1728], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// 3. Definizione delle icone (Blu per i monumenti, Rossa per casa di Francesca)
const blueIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// 4. Funzione per generare il contenuto del popup in base alla lingua selezionata
function creaContenutoPopup(luogo, lingua) {
    // Mappatura delle chiavi del JSON a seconda della lingua scelta
    const catKey = `Categoria ${lingua}`;
    
    // Gestione delle chiavi per "Il Segreto di Virgilio"
    let segretoKey = "Il Segreto di Virgilio (Leggenda/Curiosità)";
    if (lingua === 'Ing') segretoKey = "The Secret of Virgil (Legend/Curiosity)";
    if (lingua === 'Sp') segretoKey = "El secreto de Virgilio (Leyenda/Curiosidad)";

    // Gestione delle chiavi per "Scopri di più / Find out more"
    let infoKey = "Scopri di più";
    if (lingua === 'Ing') infoKey = "Find out more";
    if (lingua === 'Sp') infoKey = "Descubra más";

    const nomeLuogo = luogo["Nome Luogo"] || "";
    const categoria = luogo[catKey] || "";
    const segreto = luogo[segretoKey] || "";
    const info = luogo[infoKey] || "";
    const videoUrl = luogo["Video"] || "";

    return `
        <div class="popup-content" style="max-width: 250px;">
            <h3 style="margin: 0 0 5px 0; font-size: 16px;">${nomeLuogo}</h3>
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #555;"><strong>${categoria}</strong></p>
            <p style="margin: 0 0 8px 0; font-size: 13px;"><em>${segreto}</em></p>
            <p style="margin: 0 0 8px 0; font-size: 13px;">${info}</p>
            ${videoUrl ? `<a href="${videoUrl}" target="_blank" style="color: #007bff; text-decoration: none; font-weight: bold; font-size: 13px;">🎥 Guarda il Video</a>` : ''}
        </div>
    `;
}

// 5. Funzione asincrona per leggere il file JSON e posizionare i pin
async function caricaMappa() {
    try {
        const response = await fetch('./monumenti_lecce.json');
        if (!response.ok) throw new Error("Impossibile trovare il file monumenti_lecce.json");
        
        // Salviamo i dati nella variabile globale
        datiLocali = await response.json();

        datiLocali.forEach((luogo) => {
            // Estrazione coordinate (gestisce sia maiuscole che minuscole)
            const lat = parseFloat(luogo.Lat !== undefined ? luogo.Lat : luogo.lat);
            const lng = parseFloat(luogo.Long !== undefined ? luogo.Long : luogo.long);

            if (!isNaN(lat) && !isNaN(lng)) {
                const nomeLuogo = luogo["Nome Luogo"] || "";
                const nomePulito = nomeLuogo.trim().toLowerCase();
                
                // Se il nome corrisponde all'appartamento, usa l'icona rossa, altrimenti blu
                const isFrancesca = nomePulito.includes("a casa di francesca");
                const markerIcon = isFrancesca ? redIcon : blueIcon;

                // Aggiunta del marker sulla mappa
                const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
                
                // Associamo i dati grezzi direttamente al marker per facilitare il cambio lingua
                marker.luogoData = luogo;

                // Impostiamo il popup iniziale
                marker.bindPopup(creaContenutoPopup(luogo, linguaCorrente));
            }
        });
    } catch (e) {
        console.error("Errore nel caricamento dei dati:", e);
    }
}

// 6. Funzione per aggiornare la lingua di tutti i popup aperti o presenti sulla mappa
function aggiornaLingua(nuovaLingua) {
    linguaCorrente = nuovaLingua;

    map.eachLayer((layer) => {
        // Controlliamo che il layer sia un Marker e che contenga i nostri dati
        if (layer instanceof L.Marker && layer.luogoData) {
            // Aggiorniamo il contenuto del popup con la nuova lingua
            layer.setPopupContent(creaContenutoPopup(layer.luogoData, linguaCorrente));
        }
    });
}

// 7. Event Listener al caricamento della pagina e per il selettore lingua HTML
document.addEventListener('DOMContentLoaded', () => {
    caricaMappa();

    // Collega l'evento al cambio di selezione nel menu a tendina della lingua
    const selettoreLingua = document.getElementById('lingua-selector');
    if (selettoreLingua) {
        selettoreLingua.addEventListener('change', (e) => {
            aggiornaLingua(e.target.value);
        });
    }
});
