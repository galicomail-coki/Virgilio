/**
 * APP.JS - Virgilio Tour Lecce
 * Gestisce la mappa e la traduzione dinamica dei 35 punti di interesse
 */

// 1. Inizializzazione della mappa
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

let markersLayer = L.layerGroup().addTo(map);

// 3. Funzione di caricamento e renderizzazione
async function caricaMappa() {
    console.log("Inizio caricamento mappa...");
    try {
        const response = await fetch('./monumenti_lecce.json');
        if (!response.ok) throw new Error("File JSON non trovato!");
        
        const luoghi = await response.json();
        const langSelect = document.getElementById('lang-select');
        const currentLang = langSelect ? langSelect.value : 'ita';
        
        console.log("Lingua attiva:", currentLang);
        markersLayer.clearLayers();

        luoghi.forEach(luogo => {
            const lat = parseFloat(luogo.lat);
            const lng = parseFloat(luogo.lng);

            if (!isNaN(lat) && !isNaN(lng)) {
                // Selezione testi
                let cat, seg, scopri, labelSeg, labelScopri, btnTxt;

                if (currentLang === 'ing') {
                    cat = luogo["Category Eng"];
                    seg = luogo["Secret Eng"];
                    scopri = luogo["Discover More Eng"];
                    labelSeg = "Virgil's Secret:";
                    labelScopri = "Discover more:";
                    btnTxt = "Watch Video";
                } else if (currentLang === 'sp') {
                    cat = luogo["Category Sp"];
                    seg = luogo["Secret Sp"];
                    scopri = luogo["Discover More Sp"];
                    labelSeg = "El secreto de Virgilio:";
                    labelScopri = "Saber más:";
                    btnTxt = "Ver Video";
                } else {
                    cat = luogo["Categoria Ita"];
                    seg = luogo["Il Segreto di Virgilio (Leggenda/Curiosità)"];
                    scopri = luogo["Scopri di più"];
                    labelSeg = "Il Segreto di Virgilio:";
                    labelScopri = "Scopri di più:";
                    btnTxt = "Guarda il Video";
                }

                // Crea Marker
                const isAppartamento = luogo["Nome Luogo"].toLowerCase().includes("appartamento");
                const marker = L.marker([lat, lng], { icon: isAppartamento ? redIcon : blueIcon });

                const popupContent = `
                    <div style="font-family:sans-serif; max-width:200px;">
                        <h3 style="margin:0; font-size:14px; color:#e74c3c;">${luogo["Nome Luogo"]}</h3>
                        <p style="font-size:10px; color:#777;">${cat}</p>
                        <div style="background:#fff9e6; padding:5px; margin-bottom:5px;">
                            <p style="margin:0; font-size:11px; font-weight:bold;">${labelSeg}</p>
                            <p style="margin:0; font-size:11px;">${seg}</p>
                        </div>
                        <p style="margin:0; font-size:11px;"><b>${labelScopri}</b> ${scopri}</p>
                        ${luogo.Video ? `<a href="${luogo.Video}" target="_blank" style="display:block; margin-top:5px; color:#e74c3c;">▶ ${btnTxt}</a>` : ''}
                    </div>
                `;
                marker.bindPopup(popupContent);
                markersLayer.addLayer(marker);
            }
        });
        console.log("Mappa caricata con successo.");
    } catch (e) {
        console.error("Errore critico:", e);
    }
}

// 4. Inizializzazione Eventi
document.addEventListener('DOMContentLoaded', () => {
    caricaMappa();
    
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.addEventListener('change', () => {
            console.log("Cambiamento lingua rilevato");
            caricaMappa();
        });
    }
});
