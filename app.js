// Stato della lingua selezionata ('ita', 'ing', 'sp')
let currentLang = 'ita';
let selectedMonument = null;
let currentUtterance = null;

// Traduzioni per i pulsanti dell'interfaccia
const uiTranslations = {
    ita: { listen: "🔊 Ascolta Audioguida", stop: "⏹️ Ferma Audioguida", video: "🎥 Guarda il Video", langCode: "it-IT" },
    ing: { listen: "🔊 Listen to Audio Guide", stop: "⏹️ Stop Audio Guide", video: "🎥 Watch Video", langCode: "en-US" },
    sp:  { listen: "🔊 Escuchar Audioguía", stop: "⏹️ Detener Audioguía", video: "🎥 Ver Video", langCode: "es-ES" }
};

// 1. Inizializza la Mappa su Lecce
const map = L.map('map').setView([40.3521, 18.1691], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// 2. GPS Utente
let userMarker = null;
if ("geolocation" in navigator) {
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

// 3. Caricamento Monumenti
async function loadMonuments() {
    try {
        const response = await fetch('monumenti_lecce.json');
        const monuments = await response.json();

        monuments.forEach(item => {
            if (item.Lat && item.Long) {
                const marker = L.marker([parseFloat(item.Lat), parseFloat(item.Long)]).addTo(map);
                marker.on('click', () => {
                    selectedMonument = item;
                    showDetails(selectedMonument);
                });
            }
        });
    } catch (err) {
        console.error("Errore nel caricamento dati:", err);
    }
}

// 4. Mostra Dettagli Monumento
function showDetails(data) {
    if (!data) return;
    window.speechSynthesis.cancel();

    const titleKey = currentLang === 'ita' ? 'Nome Luogo' : (currentLang === 'ing' ? 'Nome Luogo Ing' : 'Nome Luogo Sp');
    const catKey   = currentLang === 'ita' ? 'Categoria Ita' : (currentLang === 'ing' ? 'Categoria Ing' : 'Categoria Sp');
    const secretKey= currentLang === 'ita' ? 'Il Segreto di Virgilio (Leggenda/Curiosità)' : (currentLang === 'ing' ? 'The Secret of Virgil' : 'El secreto de Virgilio');
    const descKey  = currentLang === 'ita' ? 'Scopri di più' : (currentLang === 'ing' ? 'Find out more' : 'Descubra más');

    const titleText  = data[titleKey] || data['Nome Luogo'] || "";
    const secretText = data[secretKey] || "";
    const descText   = data[descKey] || "";

    document.getElementById('monument-title').textContent = titleText;
    document.getElementById('monument-category').textContent = data[catKey] || "";
    document.getElementById('monument-secret').textContent = secretText;
    document.getElementById('monument-desc').textContent = descText;

    // Immagine
    const imgEl = document.getElementById('monument-img');
    if (data["Immagine"]) {
        imgEl.src = data["Immagine"];
        imgEl.classList.remove('hidden');
    } else {
        imgEl.classList.add('hidden');
    }

    // Video
    const videoContainer = document.getElementById('video-container');
    const videoBtn = document.getElementById('monument-video');
    if (data["Video"]) {
        videoBtn.href = data["Video"];
        videoBtn.textContent = uiTranslations[currentLang].video;
        videoContainer.classList.remove('hidden');
    } else {
        videoContainer.classList.add('hidden');
    }

    // Pulsante Audio
    const speakBtn = document.getElementById('speak-btn');
    speakBtn.textContent = uiTranslations[currentLang].listen;

    speakBtn.onclick = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            speakBtn.textContent = uiTranslations[currentLang].listen;
        } else {
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

    document.getElementById('details-panel').classList.remove('hidden');
}

// Cambio Lingua
document.getElementById('lang-select').addEventListener('change', (e) => {
    currentLang = e.target.value;
    if (selectedMonument) {
        showDetails(selectedMonument);
    }
});

// Chiusura del pannello
document.getElementById('close-btn').addEventListener('click', () => {
    window.speechSynthesis.cancel();
    document.getElementById('details-panel').classList.add('hidden');
});

loadMonuments();
