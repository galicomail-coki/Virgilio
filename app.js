/**
 * APP.JS - Virgilio Tour Lecce (Gestione Icone Corretta)
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
    try {
        const response = await fetch('./monumenti_lecce.json');
        if (!response.ok) throw new Error("File JSON non trovato");
        
        const luoghi = await response.json();

        luoghi.forEach((luogo) => {
            const lat = parseFloat(luogo.Lat !== undefined ? luogo.Lat : luogo.lat);
            const lng = parseFloat(luogo.Long !== undefined ? luogo.Long : luogo.long);

            if (!isNaN(lat) && !isNaN(lng)) {
                const nomeLuogo = luogo["Nome Luogo"] || "";
                const nomeLower = nomeLuogo.toLowerCase();
                
                // Riconosce l'appartamento se nel nome c'è "appartamento", "francesca" o "casa"
                const isAppartamento = nomeLower.includes("appartamento") || nomeLower.includes("francesca") || nomeLower.includes("casa");
                const markerIcon = isAppartamento ? redIcon : blueIcon;

                const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
                marker.bindPopup(`<b>${nomeLuogo}</b>`);
            }
        });
    } catch (e) {
        console.error("Errore critico:", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    caricaMappa();
});
