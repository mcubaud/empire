var geojsonDataUrl = 'strategy_game/grille.geojson';
hex_group = L.featureGroup().addTo(mymap);
var geojsondata = {};
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
        <b>Owner:</b> ${props.owner}<br>
      `;
    } else {
      popupContent += `<b>City:</b> No<br>`;
    }
    layer.bindPopup(popupContent);
  }

var requestURL = 'strategy_game/grille.geojson';
var request_strat = new XMLHttpRequest();
request_strat.open('GET', requestURL);
request_strat.responseType = 'json';
request_strat.send();
request_strat.onload = function() {
  geojsondata=request_strat.response;
  L.geoJSON(geojsondata, {
    style: styleFeature,
    onEachFeature: onEachFeature
  }).addTo(hex_group);

  // Adjust the mymap view to fit the data bounds
  var bounds = L.geoJSON(geojsondata).getBounds();
  mymap.fitBounds(bounds);
  //group.clearLayers();
  //mymap.removeEventListener("zoomend", mettre_a_jour_carte);
}

// Class for Players
class Player {
  constructor(name, color) {
    this.name = name; // Name of the player
    this.color = color; // Player's color (e.g., for mymap/army representation)
    this.cities = []; // List of cities controlled by the player
    this.armies = []; // List of armies controlled by the player
  }

  // Add a city to the player's control
  addCity(city) {
    this.cities.push(city);
    city.setOwner(this);
  }

  // Remove a city from the player's control
  removeCity(city) {
    this.cities = this.cities.filter(c => c !== city);
    city.setOwner(null);
  }

  // Add an army to the player's control
  addArmy(army) {
    this.armies.push(army);
    army.setOwner(this);
  }

  // Remove an army from the player's control
  removeArmy(army) {
    this.armies = this.armies.filter(a => a !== army);
  }

  // Produce soldiers from all controlled cities
  produceSoldiers() {
    this.cities.forEach(city => {
      const newSoldiers = city.produceSoldiers();
      if (city.army) {
        city.army.addSoldiers(newSoldiers);
      } else {
        const newArmy = new Army(newSoldiers, city.row, city.col, this);
        this.addArmy(newArmy);
        city.army = newArmy;
      }
    });
  }
}

// Class for Armies
class Army {
  constructor(soldiers, hex, row, col, owner = null) {
    this.soldiers = soldiers; // Number of soldiers in the army
    this.hex = hex;
    this.row = row; // Current row position on the grid
    this.col = col; // Current column position on the grid
    this.owner = owner; // Owner of the army
    this.exhaustion = 0; // Exhaustion level (affects battle strength)
    this.marker = null; // Leaflet marker for the army
    this.city_stationed = null;
    this.updateMarker(); // Initialize the marker
  }

  // Set the owner of the army
  setOwner(player) {
    this.owner = player;
  }

  // Add soldiers to the army
  addSoldiers(count) {
    this.soldiers += count;
    this.updateMarker(); // Update the marker content
  }

  // Move the army to a new position
  move(newhex, newRow, newCol) {
    this.hex = newhex;
    this.row = newRow;
    this.col = newCol;
    this.exhaustion += 1; // Increase exhaustion when moving
    this.updateMarker(); // Move the marker to the new position
  }

  // Update the Leaflet marker for the army
  updateMarker() {
    const position = this.hex.getLatLng(); // Assuming grid coordinates match mymap lat/lng
    const htmlContent = `
      <div style="text-align: center; color: ${this.owner.color};">
        <img src="army-icon.png" style="width: 24px; height: 24px;" />
        <div>${this.soldiers}</div>
      </div>
    `;

    if (!this.marker) {
      this.marker = L.marker(position, {
        icon: L.divIcon({
          className: 'army-marker',
          html: htmlContent,
        }),
      }).addTo(mymap); // Add marker to the mymap
      this.marker.army = this;
    } else {
      this.marker.setLatLng(position); // Update position
      this.marker.setIcon(
        L.divIcon({
          className: 'army-marker',
          html: htmlContent,
        })
      );
    }
  }

  // Engage in battle and calculate strength
  calculateStrength(isAttacking, defensiveBonus = 0) {
    let strength = this.soldiers - this.exhaustion;
    if (isAttacking) strength *= 1.1; // Attacking bonus
    return strength + defensiveBonus;
  }

  // Take casualties after a battle
  takeCasualties(losses) {
    this.soldiers = Math.max(0, this.soldiers - losses);
    this.updateMarker();
    if (this.soldiers === 0) {
      if (this.owner) this.owner.removeArmy(this);
      mymap.removeLayer(this.marker); // Remove marker from mymap
    }
  }
}

// Class for Cities
class City {
  constructor(name, hex, row, col, population, owner = null) {
    this.name = name; // Name of the city
    this.hex = hex;
    this.row = row; // Row position on the grid
    this.col = col; // Column position on the grid
    this.population = population; // Population of the city (affects soldier production)
    this.owner = owner; // Owner of the city
    this.army = null; // Army stationed in the city
    this.marker = null; // Leaflet marker for the city
    this.updateMarker(); // Initialize the marker
  }

  // Set the owner of the city
  setOwner(player) {
    this.owner = player;
    this.updateMarker(); // Update the marker to reflect the new owner
  }

  // Update the Leaflet marker for the city
  updateMarker() {
    const position = this.hex.getLatLng(); // Assuming grid coordinates match mymap lat/lng
    const htmlContent = `
      <div style="text-align: center; color: ${this.owner ? this.owner.color : 'gray'};">
        <img src="city-icon.png" style="width: 32px; height: 32px;" />
        <div>${this.population}</div>
      </div>
    `;

    if (!this.marker) {
      this.marker = L.marker(position, {
        icon: L.divIcon({
          className: 'city-marker',
          html: htmlContent,
        }),
      }).addTo(mymap); // Add marker to the mymap
    } else {
      this.marker.setLatLng(position); // Update position
      this.marker.setIcon(
        L.divIcon({
          className: 'city-marker',
          html: htmlContent,
        })
      );
    }
  }

  // Produce soldiers based on population
  produceSoldiers() {
    return 10 + Math.floor(this.population / 100);
  }


  // Add an army to the city
  stationArmy(army) {
    this.army = army;
    army.row = this.row;
    army.col = this.col;
    army.city_stationed = this;
    this.updateMarker();
  }

  // Remove the stationed army
  removeArmy() {
    this.army.city_stationed = null;
    this.army = null;
  }

}
