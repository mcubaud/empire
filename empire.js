/// Initialisation de la carte
var mymap = L.map('mapid').setView([0, 0], 2);
mymap.setMinZoom(2);

var Icone = L.Icon.extend({
    options: {
        shadowUrl: '',
        iconSize:     [42, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76]
    }
});

// Group contient tous les marqueurs et overlays
var group = L.featureGroup().addTo(mymap);

// Stockage des données
var listeCartes = [];
var listeMarkers = [];

// Fonction de préchargement d'image
function preloadImage(url) {
    const img = new Image();
    img.src = url;
}

// Fonction de mise à jour de la carte
function mettre_a_jour_carte() {
    let currentZoom = mymap.getZoom(); 
    group.clearLayers();

    // Affichage des overlays d'images selon le zoom
    listeCartes.forEach(objet => {
        if (currentZoom > objet.zoom) {
            L.imageOverlay(objet.nom, objet.imageBounds).addTo(group);
        }
    });

    // Affichage des marqueurs selon les bornes de zoom
    listeMarkers.forEach(marker => {
        if (marker.zoom_max >= currentZoom && currentZoom >= marker.zoom_min) {
            marker.addTo(group);
        }
    });
}

// Chargement asynchrone des données avec fetch / async/await
async function chargerDonnees() {
    try {
        // Chargement en parallèle des cartes et des labels
        const [resCartes, resLabels] = await Promise.all([
            fetch('cartes.json'),
            fetch('label.json')
        ]);

        if (!resCartes.ok || !resLabels.ok) {
            throw new Error('Erreur lors du chargement des fichiers JSON');
        }

        listeCartes = await resCartes.json();
        const labels = await resLabels.json();

        // Préchargement des images de cartes
        listeCartes.forEach(objet => preloadImage(objet.nom));

        // Traitement des marqueurs
        listeMarkers = labels.map(label => {
            const marker = L.marker([label.lat, label.long], {
                icon: L.divIcon({
                    className: label.class,
                    html: `<h3>${label.titre}</h3>`
                }),
                title: label.titre
            });

            marker.name = label.titre;
            marker.zoom_min = label.zoom_min;
            marker.zoom_max = label.zoom_max;

            if (label.descr) {
                marker.bindPopup(label.descr);
            }
            marker.addTo(group);
            return marker;
        });

        // Initialisation de la barre de recherche une fois les données chargées
        //initSearchControl();

        // Premier affichage une fois les données prêtes
        mettre_a_jour_carte();

    } catch (erreur) {
        console.error("Erreur de chargement :", erreur);
    }
}

function initSearchControl() {
    // Groupe contenant tous les marqueurs
    searchLayer = L.layerGroup(listeMarkers);

    searchControl = new L.Control.Search({
        layer: searchLayer,
        propertyName: 'title', // Cible marker.options.title
        initial: false,
        zoom: null,            // Gestion manuelle du zoom
        marker: false,         // Pas d'icône rouge de recherche
        textPlaceholder: 'Rechercher un lieu...'
    });

    // 1. Ajout du contrôle à la carte ( Leaflet Search y ajoute aussi searchLayer )
    mymap.addControl(searchControl);

    // 2. On retire immédiatement le calque de la carte :
    // Le moteur de recherche garde l'index, mais la carte reste propre !
    mymap.removeLayer(searchLayer);

    // 3. Comportement lors de la sélection d'un résultat
    searchControl.on('search:locationfound', (e) => {
        const targetMarker = e.layer;
        const currentZoom = mymap.getZoom();
        let targetZoom = currentZoom;

        // Ajustement selon le zoom_min et zoom_max du marqueur trouvé
        if (currentZoom < targetMarker.zoom_min) {
            targetZoom = targetMarker.zoom_min;
        } else if (currentZoom > targetMarker.zoom_max) {
            targetZoom = targetMarker.zoom_max;
        }

        // Déplacement de la vue
        mymap.setView(targetMarker.getLatLng(), targetZoom);

        // Mise à jour de l'affichage selon le nouveau zoom
        mettre_a_jour_carte();

        // Ouverture de la popup
        if (targetMarker.getPopup()) {
            targetMarker.openPopup();
        }
    });
}

// Lancement du chargement
chargerDonnees();

// Événements
mymap.on("zoomend", mettre_a_jour_carte);

mymap.on('click', (e) => {
    L.popup()
        .setLatLng(e.latlng)
        .setContent(`You clicked the map at ${e.latlng.toString()}`)
        .openOn(mymap);
});
