var geojsonDataUrl = '.strategy_game/grille.geojson';
var terrainColors = {
    "forêt": "#228B22", // Forest: Green
    "montagne": "#A9A9A9", // Mountain: Gray
    "plaine": "#FFFF00" // Plain: Yellow
  };

  // Style function for GeoJSON
  function styleFeature(feature) {
    return {
      color: 'black', // Border color
      weight: 1, // Border width
      fillColor: terrainColors[feature.properties.type] || '#FFFFFF', // Default white if unknown
      fillOpacity: 0.3 // Transparency
    };
  }

  // Add popups to display feature details
  function onEachFeature(feature, layer) {
    var props = feature.properties;
    let popupContent = `
      <strong>Cell Details:</strong><br>
      <b>Row:</b> ${props.row_index}<br>
      <b>Column:</b> ${props.col_index}<br>
      <b>Type:</b> ${props.type}<br>
    `;
    if (props.Ville) {
      popupContent += `
        <b>City:</b> Yes<br>
        <b>Population:</b> ${props.Population}<br>
        <b>Owner:</b> ${props.propriétaire}<br>
      `;
    } else {
      popupContent += `<b>City:</b> No<br>`;
    }
    layer.bindPopup(popupContent);
  }

  // Load GeoJSON data
  fetch(geojsonDataUrl)
    .then(response => response.json())
    .then(data => {
      L.geoJSON(data, {
        style: styleFeature,
        onEachFeature: onEachFeature
      }).addTo(mymap);

      // Adjust the mymap view to fit the data bounds
      var bounds = L.geoJSON(data).getBounds();
      mymap.fitBounds(bounds);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));