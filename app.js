/**
 * APP.JS - Virgilio Tour Lecce
 * Gestisce la mappa e la traduzione dinamica dei punti di interesse
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
    console.log("Aggiornamento mappa in corso...");
    try {
        const response = await fetch('./monumenti_lecce.json');
        if (!response.ok) throw new Error("File JSON non trovato!");
        
        const luoghi = await response.json();
        const langSelect = document.getElementById('lang-select');
        const currentLang = langSelect ? langSelect.value : 'ita';
        
        console.log("Lingua attiva selezionata:", currentLang);
        
        // Chiude eventuali popup aperti prima di pulire i layer
        map.closePopup();
        markersLayer.clearLayers();

        luoghi.forEach(luogo => {
            const lat = parseFloat(luogo.lat);
            const lng = parseFloat(luogo.lng);

            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                let cat, seg, scopri, labelSeg, labelScopri, btnTxt;

                // Selezione testi in base alla lingua
                if (currentLang === 'ing') {
                    cat = luogo["Category Eng"] || luogo["Categoria Ita"];
                    seg = luogo["Secret Eng"] || luogo["Il Segreto di Virgilio (Leggenda/Curiosità)"];
                    scopri = luogo["Discover More Eng"] || luogo["Scopri di più"];
                    labelSeg = "Virgil's Secret:";
                    labelScopri = "Discover more:";
                    btnTxt = "Watch Video";
                } else if (currentLang === 'sp') {
                    cat = luogo["Category Sp"] || luogo["Categoria Ita"];
                    seg = luogo["Secret Sp"] || luogo["Il Segreto di Virgilio (Leggenda/Curiosità)"];
                    scopri = luogo["Discover More Sp"] || luogo["Scopri di più"];
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

                // Nome del luogo
                const nomeLuogo = luogo["Nome Luogo"] || "";

                // Crea Marker
                const isAppartamento = nomeLuogo.toLowerCase().includes("appartamento");
                const marker = L.marker([lat, lng], { icon: isAppartamento ? redIcon : blueIcon });

                const popupContent = `
                    <div style="font-family:sans-serif; max-width:220px; max-height:260px; overflow-y:auto;">
                        <h3 style="margin:0 0 5px 0; font-size:14px; color:#e74c3c; border-bottom:1px solid #ddd; padding-bottom:3px;">${nomeLuogo}</h3>
                        <p style="font-size:10px; font-weight:bold; color:#777; text-transform:uppercase; margin:0 0 5px 0;">${cat}</p>
                        
                        ${seg ? `
                            <div style="background:#fff9e6; border-left:3px solid #f39c12; padding:5px; margin-bottom:5px;">
                                <p style="margin:0; font-size:10px; font-weight:bold; color:#d35400;">💡 ${labelSeg}</p>
                                <p style="margin:2px 0 0 0; font-size:11px; color:#333;">${seg}</p>
                            </div>
                        ` : ''}

                        ${scopri ? `
                            <div style="margin-bottom:5px;">
                                <p style="margin:0; font-size:10px; font-weight:bold; color:#2980b9;">📖 ${labelScopri}</p>
                                <p style="margin:2px 0 0 0; font-size:11px; color:#444;">${scopri}</p>
                            </div>
                        ` : ''}

                        ${luogo.Video ? `
                            <div style="text-align:center; margin-top:8px;">
                                <a href="${luogo.Video}" target="_blank" style="display:inline-block; background:#e74c3c; color:#fff; text-decoration:none; padding:4px 8px; border-radius:3px; font-size:11px; font-weight:bold;">▶ ${btnTxt}</a>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                marker.bindPopup(popupContent);
                markersLayer.addLayer(marker);
            }
        });
        console.log("Mappa aggiornata con la nuova lingua.");
    } catch (e) {
        console.error("Errore critico durante il caricamento:", e);
    }
}

// 4. Inizializzazione Eventi al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
    caricaMappa();
    
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.addEventListener('change', () => {
            console.log("Evento change intercettato sul menu lingua");
            caricaMappa();
        });
    } else {
        console.error("Attenzione: elemento 'lang-select' non trovato nel DOM!");
    }
});
