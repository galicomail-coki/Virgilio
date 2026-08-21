// 1. Inizializzazione della mappa centrata su Lecce
const map = L.map('map').setView([40.3547, 18.1728], 15);

// 2. Caricamento del layer mappa da OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 3. Definizione delle icone (Blu predefinita, Rossa per l'appartamento)
const blueIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Gruppo di layer per gestire i marker ed eliminarli al cambio lingua
let markersLayer = L.layerGroup().addTo(map);

// 4. Funzione principale di caricamento mappa e dati
async function caricaMappa() {
    try {
        const response = await fetch('./monumenti_lecce.json');
        if (!response.ok) {
            throw new Error(`Errore HTTP! Stato: ${response.status}`);
        }
        const luoghi = await response.json();
        
        // Legge la lingua selezionata dall'elemento HTML (es. <select id="languageSelect">)
        const langSelect = document.getElementById('languageSelect');
        const currentLang = langSelect ? langSelect.value : 'ita';

        // Pulisce i marker precedenti prima di ricaricarli
        markersLayer.clearLayers();

        luoghi.forEach(luogo => {
            // Estrazione coordinate (supporta "Coordinate GPS", "Lat"/"Long" o "latitudine"/"longitudine")
            let lat = luogo["Lat"] || luogo["latitudine"] || luogo["lat"];
            let lng = luogo["Long"] || luogo["longitudine"] || luogo["lng"];

            if ((!lat || !lng) && luogo["Coordinate GPS"]) {
                const coords = luogo["Coordinate GPS"].split(',');
                lat = parseFloat(coords[0].trim());
                lng = parseFloat(coords[1].trim());
            } else {
                lat = parseFloat(lat);
                lng = parseFloat(lng);
            }

            if (!isNaN(lat) && !isNaN(lng)) {
                // Selezione dinamica dei campi in base alla lingua corrente
                let nome, categoria, segreto, scopriDiPiu, btnVideoText;

                if (currentLang === 'eng') {
                    nome = luogo["Name"] || luogo["Nome Luogo"] || luogo["nome"];
                    categoria = luogo["Category Eng"] || luogo["Categoria Ita"] || "";
                    segreto = luogo["Secret Eng"] || luogo["Il Segreto di Virgilio (Leggenda/Curiosità)"] || "";
                    scopriDiPiu = luogo["Discover More Eng"] || luogo["Scopri di più"] || "";
                    btnVideoText = "Watch Video";
                } else {
                    // Default Italiano
                    nome = luogo["Nome Luogo"] || luogo["nome"] || luogo["Luogo d'interesse"];
                    categoria = luogo["Categoria Ita"] || luogo["categoria_ita"] || "";
                    segreto = luogo["Il Segreto di Virgilio (Leggenda/Curiosità)"] || luogo["segreto"] || "";
                    scopriDiPiu = luogo["Scopri di più"] || luogo["scopri_di_piu"] || "";
                    btnVideoText = "Guarda il Video";
                }

                const videoUrl = luogo["Video"] || luogo["videoUrl"] || "";

                // Controllo appartamento per il pin rosso
                const isAppartamento = nome.toLowerCase().includes("francesca") || categoria.toLowerCase().includes("appartamento");
                const iconaScelta = isAppartamento ? redIcon : blueIcon;

                const marker = L.marker([lat, lng], { icon: iconaScelta });

                // Costruzione del popup dinamico
                let popupContent = `
                    <div style="font-family: sans-serif; padding: 4px; max-width: 260px; max-height: 280px; overflow-y: auto;">
                        <h3 style="margin: 0 0 6px 0; color: #111; font-size: 15px; border-bottom: 2px solid #e74c3c; padding-bottom: 4px;">${nome}</h3>
                        ${categoria ? `<p style="margin: 0 0 8px 0; font-size: 11px; font-weight: bold; color: #777; text-transform: uppercase;">${categoria}</p>` : ''}
                        
                        ${segreto ? `
                            <div style="background-color: #fff9e6; border-left: 3px solid #f39c12; padding: 6px; margin-bottom: 8px;">
                                <p style="margin: 0; font-size: 11px; font-weight: bold; color: #d35400;">💡 ${currentLang === 'eng' ? "Virgil's Secret:" : "Il Segreto di Virgilio:"}</p>
                                <p style="margin: 3px 0 0 0; font-size: 12px; line-height: 1.35; color: #333;">${segreto}</p>
                            </div>
                        ` : ''}

                        ${scopriDiPiu ? `
                            <div style="margin-bottom: 8px;">
                                <p style="margin: 0 0 3px 0; font-size: 11px; font-weight: bold; color: #2980b9;">📖 ${currentLang === 'eng' ? "Discover more:" : "Scopri di più:"}</p>
                                <p style="margin: 0; font-size: 12px; line-height: 1.35; color: #444;">${scopriDiPiu}</p>
                            </div>
                        ` : ''}

                        ${videoUrl ? `
                            <div style="margin-top: 10px; text-align: center;">
                                <a href="${videoUrl}" target="_blank" style="display: inline-block; background-color: #e74c3c; color: #ffffff; text-decoration: none; padding: 5px 10px; border-radius: 4px; font-size: 12px;">▶ ${btnVideoText}</a>
                            </div>
                        ` : ''}
                    </div>
                `;

                marker.bindPopup(popupContent);
                markersLayer.addLayer(marker);
            }
        });
    } catch (error) {
        console.error("Errore durante il caricamento dei dati della mappa:", error);
    }
}

// Avvio iniziale al caricamento della pagina
caricaMappa();

// Event listener per intercettare il cambio di lingua dal menu a tendina
document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.addEventListener('change', () => {
            caricaMappa();
        });
    }
});
