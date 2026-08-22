/**
 * APP.JS - Virgilio Tour Lecce (Debug Definitivo + Icone Personalizzate)
 */

const map = L.map('map').setView([40.3547, 18.1728], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// Definizione Icone
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

async function caricaMappa() {
    console.log("--> CARICAMENTO JSON IN CORSO...");
    try {
        const response = await fetch('./monumenti_lecce.json');
        if (!response.ok) throw new Error("File JSON non trovato o errore HTTP: " + response.status);
        
        const luoghi = await response.json();
        console.log("--> JSON LETTO CON SUCCESSO. Ecco i dati:", luoghi);

        if (!Array.isArray(luoghi)) {
            console.error("ATTENZIONE: Il JSON non è un array (una lista) valida!");
            return;
        }

        luoghi.forEach((luogo, index) => {
            console.log(`Elemento ${index}:`, luogo);

            // Gestisce sia maiuscole che minuscole per le coordinate
            const latVal = luogo.Lat !== undefined ? luogo.Lat : luogo.lat;
            const lngVal = luogo.Long !== undefined ? luogo.Long : (luogo.long !== undefined ? luogo.long : luogo.lng);

            const lat = parseFloat(latVal);
            const lng = parseFloat(lngVal);

            console.log(`-> Coordinate estratte: Lat=${lat}, Lng=${lng}`);

            if (!isNaN(lat) && !isNaN(lng)) {
                const nomeLuogo = luogo["Nome Luogo"] || "Punto di interesse";
                
                // Imposta l'icona rossa per l'appartamento, blu per il resto
                const isAppartamento = nomeLuogo.toLowerCase().includes("appartamento");
                const markerIcon = isAppartamento ? redIcon : blueIcon;

                // Aggiunge il pin alla mappa con l'icona corretta
                const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
                marker.bindPopup(`<b>${nomeLuogo}</b>`);
                console.log(`--> Pin aggiunto con successo per: ${nomeLuogo} (${isAppartamento ? 'Rosso' : 'Blu'})`);
            } else {
                console.warn(`--> ERRORE: Coordinate non valide per l'elemento ${index} (${luogo["Nome Luogo"]})`);
            }
        });

    } catch (e) {
        console.error("--> ERRORE CRITICO NEL FETCH:", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    caricaMappa();
});
