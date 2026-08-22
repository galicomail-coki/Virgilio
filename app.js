/**
 * APP.JS - Virgilio Tour Lecce (Dati Integrati)
 */

// 1. Inizializzazione mappa
const map = L.map('map').setView([40.3547, 18.1728], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// 2. Icone
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

// 3. Dati caricati direttamente (evitiamo il file JSON che dava problemi)
const luoghi = [
    { nome: "A casa di Francesca", lat: 40.3530, lng: 18.1685 },
    { nome: "Basilica di Santa Croce", lat: 40.3547, lng: 18.1728 },
    { nome: "Museo Faggiano", lat: 40.3512, lng: 18.1705 },
    { nome: "Piazza Duomo", lat: 40.3521, lng: 18.1691 }
];

// 4. Disegno dei pin
luoghi.forEach(luogo => {
    // Se è casa di Francesca, icona rossa, altrimenti blu
    const icona = (luogo.nome === "A casa di Francesca") ? redIcon : blueIcon;
    
    L.marker([luogo.lat, luogo.lng], { icon: icona })
        .addTo(map)
        .bindPopup(`<b>${luogo.nome}</b>`);
});
