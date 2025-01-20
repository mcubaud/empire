var geojsonDataUrl = 'strategy_game/grille.geojson';
var army_number = 0;
hex_group = L.featureGroup().addTo(mymap);
mymap.removeEventListener("click");
var geojsondata = {};
var initial_mvmt = 5;
var terrainColors = {
    "forêt": "#228B22", // Forest: Green
    "montagne": "#A9A9A9", // Mountain: Gray
    "plaine": "#FFFF00" // Plain: Yellow
  };

  // Style function for GeoJSON
  function styleFeature(feature) {
    return {
      color: terrainColors[feature.properties.type] || '#FFFFFF', // Border color
      weight: 1.1, // Border width
      fillColor: '#FFFFFF', // Default white if unknown
      fillOpacity: 0 // Transparency
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
        <b>Owner:</b> ${props.owner? props.owner: "No owner"}<br>
      `;
    } else {
      popupContent += `<b>City:</b> No<br>`;
    }
    layer.bindTooltip(popupContent);
  }

function move_cost(hex){
  if(["forêt", "montagne"].includes(hex.feature.properties.type)){
    return 2
  }else{
    return 1
  }
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
  player1 = new Player("Alice", "blue");
  player2 = new Player("Bob", "red");
  list_players = [player1, player2]
  list_hexs = hex_group.getLayers()[0].getLayers()
  compute_neighbors()
  create_cities()
  hex0 = list_hexs[0]
  army1 = new Army(50, hex0, hex0.feature.properties.row_index, hex0.feature.properties.col_index, player1);
  army2 = new Army(50, list_hexs[1], list_hexs[1].feature.properties.row_index, list_hexs[1].feature.properties.col_index, player2);
  army3 = new Army(50, list_hexs[2], list_hexs[2].feature.properties.row_index, list_hexs[2].feature.properties.col_index, player1);
  player_turn = player1;
  turn_number = 0;
  update_turn_display()
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
        const newArmy = new Army(newSoldiers, city.hex, city.row, city.col, this);
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
    this.army = this;
    this.hex.army = this;
    this.row = row; // Current row position on the grid
    this.col = col; // Current column position on the grid
    this.owner = owner; // Owner of the army
    this.exhaustion = 0; // Exhaustion level (affects battle strength)
    this.marker = null; // Leaflet marker for the army
    this.city_stationed = null;
    this.updateMarker(); // Initialize the marker
    this.owner.addArmy(this);
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
  move(newhex) {
    this.hex.army = null;
    if(this.city_stationed) this.city_stationed.removeArmy()
    this.hex.removeEventListener("click");
    this.hex = newhex;
    this.row = this.hex.feature.properties.row_index;
    this.col = this.hex.feature.properties.col_index;
    this.exhaustion += move_cost(this.hex); // Increase exhaustion when moving
    this.updateMarker(); // Move the marker to the new position
    if(! this.hex.army){
      this.hex.army = this;//simply move
    }else if(this.owner == this.hex.army.owner){
      this.addSoldiers(this.hex.army.soldiers)
      this.hex.army.owner.removeArmy(this.hex.army);
      mymap.removeLayer(this.hex.army.marker);
      //Merge armies
    }else{
      console.log("bataille");
      //bataille
      battle(this, this.hex.army);
    }
  }

  // Update the Leaflet marker for the army
  updateMarker() {
    const position = this.hex.getCenter(); // Assuming grid coordinates match mymap lat/lng
    const htmlContent = `
      <div style="text-align: center; color: ${this.owner.color};">
        <img src="game/images/player.png" style="width: 32px; height: 32px;" />
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
      this.hex.addEventListener("click", this.show_available_mvmt);
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

  show_available_mvmt(){
    var this_army = this.army;
    reset_hexs();
    if(player_turn == this_army.owner){
      this_army.hex.neighbors.forEach(neighbor=>{
        if(initial_mvmt - this_army.exhaustion > move_cost(neighbor)){
          neighbor.setStyle({fillColor:"#62c123", fillOpacity:0.7})
          neighbor.removeEventListener("click");
          neighbor.addEventListener("click", function(){
            this_army.move(neighbor);
            this_army.show_available_mvmt();
          });
        }
        
      })
    }
  }

  // Engage in battle and calculate strength
  calculateStrength(isAttacking, defensiveBonus = 0) {
    let strength = this.soldiers * (1 - this.exhaustion * 0.1);
    if (isAttacking) strength *= 1.1; // Attacking bonus
    return strength * (1+defensiveBonus);
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
    if(this.owner){
      this.owner.removeCity(this);
    }
    this.owner = player;
    this.updateMarker(); // Update the marker to reflect the new owner
  }

  // Update the Leaflet marker for the city
  updateMarker() {
    const position = this.hex.getCenter(); // Assuming grid coordinates match mymap lat/lng
    const htmlContent = `
      <div style="text-align: center; color: ${this.owner ? this.owner.color : 'gray'};">
        <img src="Blasons/pontcastel.png" style="width: 32px; height: 32px;" />
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


function compute_neighbors(){
  list_hexs.forEach(layer=>{
    let col = layer.feature.properties.col_index;
    let row = layer.feature.properties.row_index;
    layer.neighbors = [];
    list_hexs.forEach(layer2=>{
      let col2 = layer2.feature.properties.col_index;
      let row2 = layer2.feature.properties.row_index;
      if( ((col2 == col) && (Math.abs(row2 - row) == 1)) || ((Math.abs(col2 - col) == 1) && (row2 == row) )  || ((Math.abs(col2 - col) == 1) && (row2 == row - 1 + 2*(col%2) ) )){
        layer.neighbors.push(layer2)
      }
    });
  })
}


function create_cities(){
  list_cities = [];
  list_hexs.forEach(layer=>{
    //console.log(layer)
    if(layer.feature.properties.Ville==1){
      col = layer.feature.properties.col_index
      row = layer.feature.properties.row_index
      var city = new City("", layer, col, row, layer.feature.properties.Population, layer.feature.owner);
      list_cities.push(city);
    }
  })
}

function reset_hexs(){
  list_hexs.forEach(hex=>{
    if(!hex.army){
      hex.onclick=function(){}//reset the function
      hex.removeEventListener("click");
    }else{
      hex.removeEventListener("click");
      hex.addEventListener("click", hex.army.show_available_mvmt)
    }
    
    hex.setStyle(styleFeature(hex.feature))//reset the style
    onEachFeature(hex.feature, hex)
  })
}

function end_turn(){
  army_number = 0
  turn_number ++
  player_turn = list_players[turn_number%list_players.length];
  update_turn_display();
  //exhaustion recuperation
  player_turn.armies.forEach(army=>{
    army.exhaustion = Math.max(0, army.exhaustion-3);
  })
  reset_hexs();
  list_cities.forEach(city=>{
    if(city.hex.army){
      city.stationArmy(city.hex.army);
      if(city.owner != city.hex.army.owner){
        city.population = Math.round(0.6 * city.population);//conquering a city make the population drops
        city.hex.army.owner.addCity(city);
        onEachFeature(city.hex.feature, city.hex);//update the display
        city.updateMarker();
      }
    }else{
      city.population = Math.round(1.01 * city.population);//1% population growth per turn in unoccupied cities;
      onEachFeature(city.hex.feature, city.hex);//update the display
      city.updateMarker();
    }
  })
  player_turn.produceSoldiers();  
  if(player_turn.armies.length==0){
    alert(player_turn.name + " a été vaincu!");
    turn_number --;//fix turn number so that the next turn remains the next player;
    list_players = list_players.filter(a => a.name !== player_turn.name);
    if(list_players.length==1){
      alert("Victoire de " + list_players[0].name);
      window.location = ""
    }
    end_turn();

  }else{
    mymap.flyTo(player_turn.armies[0].marker.getLatLng()) ;
  }
}
document.getElementById("end_turn").onclick = end_turn;

function update_turn_display(){
  document.getElementById("current_player").innerHTML = `Tour de ${player_turn.name}`;
  document.getElementById("current_player").style.color = player_turn.color;
}

function battle(attacking_army, defending_army){
  attacking_strength = attacking_army.calculateStrength(true, defensiveBonus = 0);
  if(defending_army.city_stationed){
    defending_strength = defending_army.calculateStrength(false, defensiveBonus=0.2)
  }else{
    defending_strength = defending_army.calculateStrength(false)
  }
  if(attacking_strength>defending_strength){
    attacking_army.exhaustion+=3
    attacking_army.takeCasualties(defending_strength);
    defending_army.soldiers = 0;
    defending_army.owner.removeArmy(defending_army);
    mymap.removeLayer(defending_army.marker);
    displayBattleResults(attacking_army, defending_army, attacking_army, defending_army, defending_strength, attacking_strength);
  }else{
    defending_army.exhaustion+=3
    defending_army.takeCasualties(attacking_strength);
    attacking_army.soldiers = 0;
    attacking_army.owner.removeArmy(attacking_army);
    mymap.removeLayer(attacking_army.marker);
    displayBattleResults(attacking_army, defending_army, defending_army, attacking_army, attacking_strength, defending_strength);
  }
}

function displayBattleResults(attacking_army, defending_army, winner, loser, winnerCasualties, loserCasualties) {
  // Create the results div
  const resultsDiv = document.createElement('div');
  resultsDiv.style.border = '1px solid black';
  resultsDiv.style.padding = '10px';
  resultsDiv.style.backgroundColor = '#f8f9fa';
  resultsDiv.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
  resultsDiv.style.position = 'absolute';
  resultsDiv.style.left = '40%';
  resultsDiv.style.top = '35%';
  resultsDiv.style.width = '20%';
  resultsDiv.style.zindex = '20000';
  // Title
  const title = document.createElement('h3');
  title.textContent = 'Battle Results';
  resultsDiv.appendChild(title);

  // Create the table
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';

  // Add table headers
  const headers = ['Army', 'Owner', 'Casualties', 'Remaining Troops', 'Result'];
  const headerRow = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.style.border = '1px solid black';
    th.style.padding = '5px';
    th.style.backgroundColor = '#e9ecef';
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Add rows for attacking and defending armies
  const armies = [
    {
      army: 'Attacking',
      owner: attacking_army.owner.name,
      casualties: loser === attacking_army ? loserCasualties : winnerCasualties,
      remaining: attacking_army.soldiers,
      result: winner === attacking_army ? 'Winner' : 'Loser',
    },
    {
      army: 'Defending',
      owner: defending_army.owner.name,
      casualties: loser === defending_army ? loserCasualties : winnerCasualties,
      remaining: defending_army.soldiers,
      result: winner === defending_army ? 'Winner' : 'Loser',
    },
  ];

  armies.forEach(({ army, owner, casualties, remaining, result }) => {
    const row = document.createElement('tr');
    [army, owner, casualties, remaining, result].forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      td.style.border = '1px solid black';
      td.style.padding = '5px';
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  resultsDiv.appendChild(table);

  // Add a close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.marginTop = '10px';
  closeButton.style.padding = '5px 10px';
  closeButton.style.backgroundColor = '#dc3545';
  closeButton.style.color = '#fff';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.addEventListener('click', () => {
    resultsDiv.remove();
  });

  resultsDiv.appendChild(closeButton);

  // Append the resultsDiv to the body or a specific container
  document.body.appendChild(resultsDiv);
}

function next_army(){
  army_number++;
  if(player_turn.armies.length>0){
    mymap.flyTo(player_turn.armies[army_number%player_turn.armies.length].marker.getLatLng())
  }
  
}
document.getElementById("next_army").onclick = next_army;