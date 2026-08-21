// 1. Inizializzazione della mappa centrata su Lecce
const map = L.map('map').setView([40.3547, 18.1728], 15);

// 2. Caricamento del layer mappa da OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 3. Definizione delle icone personalizzate (Blu predefinita, Rossa per l'appartamento)
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

// 4. Caricamento dati dal file monumenti_lecce.json
async function caricaMappa() {
  try {
    const response = await fetch('./monumenti_lecce.json');
    if (!response.ok) {
      throw new Error(`Errore HTTP! Stato: ${response.status}`);
    }
    const luoghi = await response.json();

    luoghi.forEach(luogo => {
      // Estrazione coordinate (supporta sia numeri diretti che stringa con virgola)
      let lat = luogo.latitudine || luogo.Lat;
      let lng = luogo.longitudine || luogo.Long;

      if (!lat && luogo["Coordinate GPS"]) {
        const coords = luogo["Coordinate GPS"].split(',');
        lat = parseFloat(coords[0].trim());
        lng = parseFloat(coords[1].trim());
      } else {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
      }

      // Se le coordinate sono valide, crea il marcatore
      if (!isNaN(lat) && !isNaN(lng)) {
        const nome = luogo.nome || luogo["Nome Luogo"] || "Luogo d'interesse";
        const categoria = luogo.categoria_ita || luogo["Categoria Ita"] || "";

        // Controllo per identificare l'appartamento e assegnare l'icona rossa
        const isAppartamento = nome.toLowerCase().includes("francesca") || categoria.toLowerCase().includes("appartamento");
        const iconaScelta = isAppartamento ? redIcon : blueIcon;

        // Creazione del marker sulla mappa
        const marker = L.marker([lat, lng], { icon: iconaScelta }).addTo(map);

        // Contenuto del popup al click
        const descr = luogo["Il Segreto di Virgilio (Leggenda/Curiosità)"] || luogo.descrizione || "";
        const popupContent = `
          <div style="max-width: 200px;">
            <h3 style="margin: 0 0 5px 0; font-size: 16px;">${nome}</h3>
            ${categoria ? `<p style="margin: 0 0 5px 0; font-weight: bold; color: #555;">${categoria}</p>` : ''}
            ${descr ? `<p style="margin: 0; font-size: 13px;">${descr}</p>` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
      }
    });
  } catch (error) {
    console.error("Errore durante il caricamento dei dati della mappa:", error);
  }
}

// Esecuzione della funzione
caricaMappa();
