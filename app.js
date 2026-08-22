/**
 * APP.JS - Virgilio Tour Lecce
 */

// 1. Inizializzazione della mappa centrata su Lecce
const map = L.map('map').setView([40.3547, 18.1728], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// 2. Definizione delle icone (Blu per i monumenti, Rossa per casa di Francesca)
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

// 3. Funzione asincrona per leggere il file JSON e posizionare i pin
async function caricaMappa() {
    try {
        const response = await fetch('./monumenti_lecce.json');
        if (!response.ok) throw new Error("Impossibile trovare il file monumenti_lecce.json");
        
        const luoghi = await response.json();

        luoghi.forEach((luogo) => {
            // Estrazione coordinate (gestisce sia maiuscole che minuscole)
            const lat = parseFloat(luogo.Lat !== undefined ? luogo.Lat : luogo.lat);
            const lng = parseFloat(luogo.Long !== undefined ? luogo.Long : luogo.long);

            if (!isNaN(lat) && !isNaN(lng)) {
                const nomeLuogo = luogo["Nome Luogo"] || "";
                
                // Pulizia del testo per un confronto sicuro
                const nomePulito = nomeLuogo.trim().toLowerCase();
                
                // Se il nome corrisponde al tuo appartamento, usa l'icona rossa, altrimenti blu
                const isFrancesca = nomePulito.includes("a casa di francesca");
                const markerIcon = isFrancesca ? redIcon : blueIcon;

                // Aggiunta del marker sulla mappa con popup
                const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
                marker.bindPopup(`<b>${nomeLuogo}</b>`);
            }
        });
    } catch (e) {
        console.error("Errore nel caricamento dei dati:", e);
    }
}

// Avvia il caricamento quando la pagina è pronta
document.addEventListener('DOMContentLoaded', () => {
    caricaMappa();
});
