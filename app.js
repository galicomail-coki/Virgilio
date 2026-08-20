// 1. Inizializza la Mappa su Lecce (Centro storico)
const map = L.map('map').setView([40.3521, 18.1691], 16);

// 2. Carica i tasselli della mappa da OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

// 3. Gestione GPS Utente in tempo reale
let userMarker = null;

if ("geolocation" in navigator) {
  navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Icona o pallino blu per l'utente
      if (!userMarker) {
        userMarker = L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: "#2980b9",
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map).bindPopup("Ti trovi qui");
      } else {
        userMarker.setLatLng([lat, lng]);
      }
    },
    (error) => {
      console.warn("GPS non disponibile o permesso negato:", error.message);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

// 4. Carica e visualizza i monumenti
async function loadMonuments() {
  try {
    const response = await fetch('data.json');
    const monuments = await response.json();

    monuments.forEach(item => {
      if (item.Lat && item.Long) {
        // Aggiunge il marker sulla mappa per ogni luogo
        const marker = L.marker([parseFloat(item.Lat), parseFloat(item.Long)]).addTo(map);

        // Al click sul marker apre il pannello dettagli
        marker.on('click', () => {
          showDetails(item);
        });
      }
    });
  } catch (err) {
    console.error("Errore nel caricamento dati:", err);
  }
}

// 5. Funzione per mostrare i dettagli nel pannello scorrevole
function showDetails(data) {
  document.getElementById('monument-title').textContent = data["Nome Luogo"] || "";
  document.getElementById('monument-category').textContent = data["Categoria Ita"] || "";
  document.getElementById('monument-secret').textContent = data["Il Segreto di Virgilio (Leggenda/Curiosità)"] || "";
  document.getElementById('monument-desc').textContent = data["Scopri di più"] || "";
  
  const imgEl = document.getElementById('monument-img');
  if (data["Immagine"]) {
    imgEl.src = data["Immagine"];
    imgEl.classList.remove('hidden');
  } else {
    imgEl.classList.add('hidden');
  }

  const videoContainer = document.getElementById('video-container');
  const videoBtn = document.getElementById('monument-video');
  if (data["Video"]) {
    videoBtn.href = data["Video"];
    videoContainer.classList.remove('hidden');
  } else {
    videoContainer.classList.add('hidden');
  }

  document.getElementById('details-panel').classList.remove('hidden');
}

// Chiusura del pannello
document.getElementById('close-btn').addEventListener('click', () => {
  document.getElementById('details-panel').classList.add('hidden');
});

// Avvia il caricamento dei monumenti
loadMonuments();