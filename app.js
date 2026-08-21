let currentLang = 'ita';
let selectedMonument = null;
let currentUtterance = null;

const uiTranslations = {
  ita: { listen: "🔊 Ascolta Audioguida", stop: "⏹️ Ferma Audioguida", video: "🎥 Guarda il Video", langCode: "it-IT" },
  ing: { listen: "🔊 Listen to Audio Guide", stop: "⏹️ Stop Audio Guide", video: "🎥 Watch Video", langCode: "en-US" },
  sp:  { listen: "🔊 Escuchar Audioguía", stop: "⏹️ Detener Audioguía", video: "🎥 Ver Video", langCode: "es-ES" }
};

// 1. Inizializzazione Mappa blindata
const map = L.map('map').setView([40.3521, 18.1691], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

// 2. Geolocalizzazione GPS
if ("geolocation" in navigator) {
  let userMarker = null;
  navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      if (!userMarker) {
        userMarker = L.circleMarker([lat, lng], {
          radius: 8, fillColor: "#2980b9", color: "#ffffff", weight: 2, opacity: 1, fillOpacity: 0.9
        }).addTo(map).bindPopup("Ti trovi qui");
      } else {
        userMarker.setLatLng([lat, lng]);
      }
    },
    (error) => console.warn("GPS non disponibile:", error.message),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

// 3. Caricamento Dati
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

async function loadMonuments() {
  try {
    const response = await fetch('monumenti_lecce.json');
    if (!response.ok) throw new Error("File JSON non trovato");

    const monuments = await response.json();

    monuments.forEach(item => {
      const lat = parseFloat(item.Lat || item.lat || item.latitude);
      const lng = parseFloat(item.Long || item.long || item.longitude || item.Lng || item.lng);

      if (!isNaN(lat) && !isNaN(lng)) {
        let markerOptions = {};
        if (item["Nome Luogo"] === "A casa di Francesca" || item["Categoria Ita"] === "Appartamento") {
          markerOptions = { icon: redIcon };
        }

        const marker = L.marker([lat, lng], markerOptions).addTo(map);

        marker.on('click', () => {
          selectedMonument = item;
          showDetails(selectedMonument);
        });
      }
    });
  } catch (err) {
    console.error("Errore nel caricamento del file dei monumenti:", err);
  }
}

// 4. Visualizzazione Dettagli
function showDetails(data) {
  if (!data) return;
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  const titleKey = currentLang === 'ita' ? 'Nome Luogo' : (currentLang === 'ing' ? 'Nome Luogo Ing' : 'Nome Luogo Sp');
  const catKey   = currentLang === 'ita' ? 'Categoria Ita' : (currentLang === 'ing' ? 'Categoria Ing' : 'Categoria Sp');
  const secretKey= currentLang === 'ita' ? 'Il Segreto di Virgilio (Leggenda/Curiosità)' : (currentLang === 'ing' ? 'The Secret of Virgil (Legend/Curiosity)' : 'El secreto de Virgilio (Leyenda/Curiosidad)');
  const descKey  = currentLang === 'ita' ? 'Scopri di più' : (currentLang === 'ing' ? 'Find out more' : 'Descubra más');

  const titleText  = data[titleKey] || data['Nome Luogo'] || "";
  const secretText = data[secretKey] || "";
  const descText   = data[descKey] || "";

  const elTitle  = document.getElementById('monument-title');
  const elCat    = document.getElementById('monument-category');
  const elSecret = document.getElementById('monument-secret');
  const elDesc   = document.getElementById('monument-desc');

  if (elTitle)  elTitle.textContent = titleText;
  if (elCat)    elCat.textContent = data[catKey] || "";
  if (elSecret) elSecret.textContent = secretText;
  if (elDesc)   elDesc.textContent = descText;

  // Immagine
  const imgEl = document.getElementById('monument-img');
  if (imgEl) {
    if (data["Immagine"]) {
      imgEl.src = data["Immagine"];
      imgEl.classList.remove('hidden');
    } else {
      imgEl.classList.add('hidden');
    }
  }

  // Video
  const videoContainer = document.getElementById('video-container');
  const videoBtn = document.getElementById('monument-video');
  if (videoContainer && videoBtn) {
    if (data["Video"]) {
      videoBtn.href = data["Video"];
      videoBtn.textContent = uiTranslations[currentLang].video;
      videoContainer.classList.remove('hidden');
    } else {
      videoContainer.classList.add('hidden');
    }
  }

  // Audio (Sintesi Vocale)
  const speakBtn = document.getElementById('speak-btn');
  if (speakBtn) {
    speakBtn.textContent = uiTranslations[currentLang].listen;
    speakBtn.onclick = () => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        speakBtn.textContent = uiTranslations[currentLang].listen;
      } else if (window.speechSynthesis) {
        const textToRead = `${titleText}. ${secretText} ${descText}`;
        currentUtterance = new SpeechSynthesisUtterance(textToRead);
        currentUtterance.lang = uiTranslations[currentLang].langCode;
        currentUtterance.rate = 0.95;

        currentUtterance.onend = () => {
          speakBtn.textContent = uiTranslations[currentLang].listen;
        };

        window.speechSynthesis.speak(currentUtterance);
        speakBtn.textContent = uiTranslations[currentLang].stop;
      }
    };
  }

  const panel = document.getElementById('details-panel');
  if (panel) panel.classList.remove('hidden');
}

// Gestore cambio lingua protetto
const langSelectEl = document.getElementById('lang-select');
if (langSelectEl) {
  langSelectEl.addEventListener('change', (e) => {
    currentLang = e.target.value;
    if (selectedMonument) showDetails(selectedMonument);
  });
}

// Gestore chiusura pannello protetto
const closeBtnEl = document.getElementById('close-btn');
if (closeBtnEl) {
  closeBtnEl.addEventListener('click', () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const panel = document.getElementById('details-panel');
    if (panel) panel.classList.add('hidden');
  });
}

// Avvio
loadMonuments();

// Forza il rendering della mappa
setTimeout(() => { map.invalidateSize(); }, 300);
