// 3. Caricamento Monumenti
async function loadMonuments() {
    try {
        const response = await fetch('monumenti_lecce.json');
        const monuments = await response.json();

        monuments.forEach(item => {
            const lat = parseFloat(item.Lat || item.lat || item.latitude);
const lng = parseFloat(item.Long || item.long || item.longitude || item.Lng || item.lng);

            if (!isNaN(lat) && !isNaN(lng)) {
                const marker = L.marker([lat, lng]).addTo(map);
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
