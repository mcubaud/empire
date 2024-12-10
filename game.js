mymap.flyTo({"lat":14.203151, "lng":-54.283447},9)
document.getElementById("overlay").style.display = "none";
current_day = 0.25
today = 0.25
initial_remaining_time = 6.75
player_health = 200
max_player_health = 200
player_attack_1_strenght = 100;
player_attack_2_strenght = 40;
random_proportion = 0.3;
player_stamina = 200; // New: Player's stamina
max_stamina = 200;
stamina_regen_on_block = 50; // Amount of stamina regained when blocking
stamina_cost_attack1 = 30; // Stamina cost for Heavy Attack
stamina_cost_attack2 = 20; // Stamina cost for Light Attack
shield_active = false;
healing_potions = 3; // New: Number of healing potions the player has
healing_amount = 50; // New: Amount healed by one potion
player_gold = 0;
after_function = null;

goldDisplay = document.getElementById("goldDisplay");

player_marker = L.marker(
    [14.346887, -54.272461],
    {icon:L.icon({
        iconUrl: 'game/images/player.png',
        iconSize: [20, 37],
        iconAnchor: [10, 37]
    })
}).addTo(mymap)

current_position = "Dragonoville"
npcs_positions={}
npcs_dialogues={}
travel_times={}
unlocked_subjects={"":true, "before_cesar":true}
alert("Vous êtes envoyé par l'Empereur dans la ville de Dragonoville pour enquêter secrètement sur un éventuel complot contre l'Empire. Tout le monde est suspect : les conspirateurs peuvent être parmi les puissants seigneurs des principales villes de Dragonoland, ou parmi le clergé corrompu de Dragono, ou encore des membres des plus influentes guildes. Des espions étrangers peuvent également faire partie de l'intrigue. Toutes ces personnes seront présentes à Dragonoville pour le festival de Dragono qui aura lieu dans une semaine. Vous arrivez à Dragonoville. Quelle est la première chose que vous ferez ?")
setTimeout(x=>alert("AUBE DU PREMIER JOUR !"), 1000);
var request3 = new XMLHttpRequest();
requestURL3 = "game/npcs_positions.json"
request3.open('GET', requestURL3);
request3.responseType = 'json';
request3.send();
request3.onload = function() {
    npcs_positions=request3.response;
    positions_day = npcs_positions["days"][Math.floor(current_day)]
    set_popups_using_daily_position(positions_day, current_day)
}
var request4 = new XMLHttpRequest();
requestURL4 = "game/npcs_dialogues.json"
request4.open('GET', requestURL4);
request4.responseType = 'json';
request4.send();
request4.onload = function() {
    npcs_dialogues=request4.response;
}
var request5 = new XMLHttpRequest();
requestURL5 = "game/travel_times.json"
request5.open('GET', requestURL5);
request5.responseType = 'json';
request5.send();
request5.onload = function() {
    travel_times=request5.response;
}

function add_marker(lat, long, titre, zoom_min, zoom_max, descr){
    var marker=L.marker([lat, long],{icon:L.divIcon({className: "lieu" ,html:"<h3>"+titre+"</h3>"})})
    marker.name = titre;
    marker.zoom_min=zoom_min;
    marker.zoom_max=zoom_max;
    if(descr){
        marker.bindPopup(descr);
    }
    setTimeout(function(){
        listeMarkers.push(marker);
    }, 1000);
}


function set_popups_using_daily_position(positions_day, current_day){
    for(location_name in positions_day){
        for(i_marker in listeMarkers){
            var marker = listeMarkers[i_marker];
            if(marker.name==location_name){
                var popup = marker.getPopup();
                marker.removeEventListener("popupopen")
                if(current_position == location_name){
                    print_neighborhoods(marker, popup)
                }else{
                    popup = remove_existing_content(popup)
                    if(!(popup.getContent().includes("button_go"))){

                        popup.setContent(
                            popup.getContent()+ `<button class='button_go'>S'y rendre (${get_travel_time(current_position, location_name)} heures)</button>`
                        )
                        marker.on(
                            "popupopen",
                            function(e){
                                setTimeout(function(){
                                    if(document.getElementsByClassName("button_go").length>0 & current_position != marker.name){
                                        document.getElementsByClassName("button_go")[0].onclick=function(){go_location(e.target)}
                                    }
                                },1000)
                            }
                        )
                    }
                }
            }
        }
    }
}

function go_location(marker){
    location_name = marker.name;
    console.log(location_name);
    var cur_latlng = player_marker.getLatLng()
    var obj_latlng = marker.getLatLng()
    travel_time = get_travel_time(current_position, location_name);
    current_position = location_name;
    marker.closePopup();
    function move_player(i){
        if(i < 2*travel_time){
            current_day += 1/24/2;
            update_time(current_day);
            var lat = cur_latlng["lat"] + (i/travel_time/2) * (obj_latlng["lat"] - cur_latlng["lat"])
            var lng = cur_latlng["lng"] + (i/travel_time/2) * (obj_latlng["lng"] - cur_latlng["lng"])
            console.log(i, lat, lng)
            player_marker.setLatLng({"lat":lat, "lng":lng});
            setTimeout(move_player, 200, i+1);
        }else{
            move_events(current_position, location_name);
            set_popups_using_daily_position(positions_day, current_day);
            player_marker.setLatLng(marker.getLatLng())
            marker.openPopup();
        }
    }
    move_player(1);
}

function move_events(current_position, location_name){
    if((current_position=="Alaris") & (unlocked_subjects["explication_louche"]) & !(unlocked_subjects["embuscade"])){
        unlocked_subjects["embuscade"]=true;
        current_day+=1/12;
        begginingMessage = 'Quelques heures après avoir quitté Alaris, le joueur est attaqué par 3 adversaires encapuchonnés !';
        enemies = [
            { enemy_health: 100, enemy_attack: 20, enemy_name: 'Bandit', enemy_image: 'game/images/brigand.png', enemy_height: 380 , proba_gold: 0.5, proba_potion: 0.5},
            { enemy_health: 120, enemy_attack: 25, enemy_name: 'Bandit', enemy_image: 'game/images/brigand2.png', enemy_height: 380  , proba_gold: 0.5, proba_potion: 0.5},
            { enemy_health: 100, enemy_attack: 20, enemy_name: 'Bandit', enemy_image: 'game/images/brigand.png', enemy_height: 380 , proba_gold: 0.5, proba_potion: 0.5 }
        ];
        backgroundImage = 'game/images/une-voie-romaine.jpg';
        victoryMessage = 'Après un rude combat, le joueur se débarrassa de ses attaquants. En fouillant les corps, le joueur trouva une note sur laquelle il est écrit : "Tuez le chien de l\'Empereur ! G"';
        startCombat(begginingMessage, enemies, backgroundImage, victoryMessage);
    }
    //random events in any road
    if((Math.random()<0.1) & !unlocked_subjects["loups"]){
        unlocked_subjects["loups"] = true
        current_day+=1/12;
        begginingMessage = `Peu de temps avant d'arriver à ${location_name}, le joueur se retrouva nez à nez avec une meute de loups.`;
        enemies = [
            { enemy_health: 50, enemy_attack: 10, enemy_name: 'loup', enemy_image: 'game/images/loup.png', enemy_height: 200, proba_gold: 0.1, proba_potion: 0 },
            { enemy_health: 50, enemy_attack: 10, enemy_name: 'loup', enemy_image: 'game/images/loup.png', enemy_height: 200, proba_gold: 0.1, proba_potion: 0 },
            { enemy_health: 50, enemy_attack: 10, enemy_name: 'loup', enemy_image: 'game/images/loup.png', enemy_height: 200, proba_gold: 0.1, proba_potion: 0 },
            { enemy_health: 50, enemy_attack: 10, enemy_name: 'loup', enemy_image: 'game/images/loup.png', enemy_height: 200, proba_gold: 0.1, proba_potion: 0 },
            { enemy_health: 50, enemy_attack: 10, enemy_name: 'loup', enemy_image: 'game/images/loup.png', enemy_height: 200, proba_gold: 0.1, proba_potion: 1 }
        ];
        backgroundImage = 'game/images/foret_hantee.png';
        victoryMessage = `Le combat fut difficile. Les derniers loups s'enfuirent quand le joueur tua un grand loup blanc, qui devait probablement mener la meute.`;
        startCombat(begginingMessage, enemies, backgroundImage, victoryMessage);
    }else if((Math.random()<0.1) & !unlocked_subjects["thieves"]){
        unlocked_subjects["thieves"]=true;
        current_day+=1/12;
        begginingMessage = `En traversant un col de montagne près de ${location_name}, un groupe de voleurs surgit des buissons pour attaquer le joueur.`;
        enemies = [
            { enemy_health: 80, enemy_attack: 15, enemy_name: 'Voleur', enemy_image: 'game/images/thief1.png', enemy_height: 350 , proba_gold: 0.8, proba_potion: 0.3},
            { enemy_health: 80, enemy_attack: 15, enemy_name: 'Voleur', enemy_image: 'game/images/thief2.png', enemy_height: 350 , proba_gold: 0.8, proba_potion: 0.3},
            { enemy_health: 80, enemy_attack: 15, enemy_name: 'Voleur', enemy_image: 'game/images/thief1.png', enemy_height: 350 , proba_gold: 0.8, proba_potion: 0.3 }
        ];
        backgroundImage = 'game/images/mountain_path_v2.png';
        victoryMessage = `Après une bataille intense, les voleurs s'enfuirent, laissant derrière eux une petite bourse remplie de pièces d'or.`;
        startCombat(begginingMessage, enemies, backgroundImage, victoryMessage);
        after_function = function(){
            player_gold +=50;
            goldDisplay.textContent = `Gold: ${player_gold}`;
        }
    }else if((Math.random()<0.1) & !unlocked_subjects["pelerins"] ){
        alert(`Sur la route de ${location_name}, le joueur rencontra un groupe de pélerins. Ceux-ci se rendaient à Dragonoville pour participer aux célébrations en l'honneur du dieu.`)
        unlocked_subjects["pelerins"]=true;
    }else if((Math.random()<0.05) & !unlocked_subjects["tempete"]){
        current_day+=1/6;
        alert(`Pendant que le joueur voyageait vers ${location_name}, une violente tempête éclata. Le joueur fut forcé de s'abriter pendant plusieurs heures avant de pouvoir reprendre sa route.`)
        unlocked_subjects["tempete"]=true;
    }else if(Math.random() < 0.1 && !unlocked_subjects["rencontre_marchand"]){
        current_day += 1/12;
        alert(`Sur la route entre ${current_position} et ${location_name}, le joueur rencontra un marchand ambulant. Il proposait une variété d'objets rares, mais aucun ne s'avéra utile.`);
        unlocked_subjects["rencontre_marchand"] = true;
    }else if((Math.random()<0.1) & !unlocked_subjects["troll"]){
        current_day+=1/12;
        begginingMessage = `Sur la route de ${location_name}, un troll attaqua le joueur.`;
        enemies = [
            { enemy_health: 200, enemy_attack: 40, enemy_name: 'troll', enemy_image: 'game/images/troll.png', enemy_height: 400 }
        ];
        backgroundImage = 'game/images/cave.jpg';
        victoryMessage = `Après avoir vaincu le troll, le joueur fouilla sa caverne à proximité et trouva une armure et de l'or.`;
        after_function = function(){
            player_health+=30;
            max_player_health+=30;
            player_gold +=50;
            goldDisplay.textContent = `Gold: ${player_gold}`;
        }
        startCombat(begginingMessage, enemies, backgroundImage, victoryMessage);
    }else if((Math.random()<0.05) & !unlocked_subjects["hermit"]){
        current_day+=1/24;
        alert(`Sur la route de ${location_name}, le joueur croisa un ermite étrange vivant dans une cabane isolée. Il offrit de bénir le joueur avec un mystérieux sort.`);
        unlocked_subjects["hermit"]=true;
        player_health += 20;
        max_player_health += 20;
        alert('Le joueur se sent étrangement revigoré après la rencontre.');
    }else if((Math.random()<0.1) & !unlocked_subjects["ruins"]){
        current_day+=1/12;
        alert(`En se rapprochant de ${location_name}, le joueur découvrit des ruines antiques. En explorant brièvement, il trouva une arme ancienne ornée de runes.`);
        unlocked_subjects["ruins"]=true;
        player_attack_1_strenght += 10;
        player_attack_2_strenght += 10;
        alert('Le joueur reçoit une amélioration de ses capacités de combat grâce à l\'arme ancienne.');
    }
}

function get_travel_time(current_position, location_name){
    if(current_position in travel_times){
        if(location_name in travel_times[current_position]){
            return travel_times[current_position][location_name]
        }
    }
    return 12
}

function remove_existing_content(popup){
    popup_content = popup.getContent()
    if(popup_content.includes("button_go")){
        popup_content = popup_content.split("<button class='button_go")[0]
        popup.setContent(popup_content)
    }
    if(popup.getContent().includes("div_neighborhood")){
        popup_content = popup.getContent()
        popup_content = popup_content.split("<div class='div_neighborhood")[0]
        popup.setContent(popup_content)
    }
    if(popup.getContent().includes("div_quartier")){
        popup_content = popup.getContent()
        popup_content = popup_content.split("<div class='div_quartier")[0]
        popup.setContent(popup_content)
    }
    if(popup.getContent().includes("div_character")){
        popup_content = popup.getContent()
        popup_content = popup_content.split("<div class='div_character")[0]
        popup.setContent(popup_content)
    }
    return popup
}

function print_neighborhoods(marker, popup){
    flavour_text = positions_day[current_position]["flavour_text"]
    neighborhoods = positions_day[current_position]["neighborhoods"]
    popup = remove_existing_content(popup)
    popup_content = popup.getContent()
    popup_content += `<div class='div_neighborhood popup_content'>
    <i>${flavour_text}</i>
    <p>Vous pouvez accéder aux quartiers suivants :</p>
    `
    for(neighborhood in neighborhoods){
        popup_content += `<button id=${neighborhood.replaceAll(" ", "_")}>${neighborhood}</button>`
    }
    popup_content += `<p>Vous pouvez également vous reposer dans une taverne :</p>
    <button id="Repos">Se reposer dans une taverne (6h)</button>
    `
    popup_content += "</div>"
    popup.setContent(popup_content)
    marker.on(
        "popupopen",
        function(e){
            if(document.getElementById("Repos")){
                setTimeout(function(){
                    for(neighborhood in neighborhoods){
                        console.log(neighborhood.replaceAll(" ", "_"));
                        document.getElementById(neighborhood.replaceAll(" ", "_")).onclick=function(e){show_characters(e, popup, marker, neighborhoods)};
                    }
                    document.getElementById("Repos").onclick=function(e){
                        current_day+=6/24;
                        update_time(current_day);
                        set_popups_using_daily_position(positions_day, current_day);
                        player_health = max_player_health;
                        night_events(current_position, "");
                        marker.closePopup();
                        marker.openPopup();
                    }
                },1000)
            }else{
                //a character is open
                talk_character({"target":{"id":char_id}}, popup, marker, neighborhood["characters"])

            }
        }
    )
}

function update_time(current_day){
    positions_day = npcs_positions["days"][Math.floor(current_day)]
    remaining_days = Math.floor(initial_remaining_time - current_day);
    remaining_hours = Math.floor((initial_remaining_time - current_day)*24)%24;
    document.getElementById("hours").innerHTML="Il est "+Math.round((current_day*24)%24)+"h00.";
    document.getElementById("remaining_time").innerHTML="Temps restant avant le festival : "+ remaining_days + " jours et "+remaining_hours+" heures";
    //New day
    if(current_day - today>=1){
        today = Math.floor(current_day)+0.25
        alert(`AUBE DU ${Math.floor(current_day+1)}ᵉ JOUR !`)
    }
    //night system
    if( (((current_day*24)%24)>19) | (((current_day*24)%24)<6) ){//night
        document.getElementById("overlay").style.display = "block";
    }else{
        document.getElementById("overlay").style.display = "none";
    }
    
    //Timed events
    if(current_day>=3.5){//arrival of cesar
        unlocked_subjects["before_cesar"]=false;
        unlocked_subjects["after_cesar"]=true;
    }
    if(initial_remaining_time < current_day){
        handleDefeat("Vous avez échoué à identifier les conspirateurs durant le temps imparti ! L'Empereur est assassiné durant le festival, sans que le joueur, impuissant, ne puisse faire quoi que ce soit ! Plus rien ne peut empêcher l'Empire de sombrer désormais...")
    }
}

function show_characters(e, popup, marker, neighborhoods){
    neighborhood_name = e.target.id.replaceAll("_", " ")
    neighborhood = neighborhoods[neighborhood_name]
    console.log(neighborhood);
    current_day+=1/24;
    update_time(current_day);
    is_night = (((current_day*24)%24)>19) | (((current_day*24)%24)<6);
    popup = remove_existing_content(popup)
    popup_content = popup.getContent()
    popup_content += `<div class='div_quartier popup_content'>
    <i>${neighborhood["description"]}</i>
    `
    if(is_night){
        if((marker.name=="Dragonoville") & unlocked_subjects["after_cesar"]){
            popup_content += "<i>Il fait nuit, mais vous entendez des bruits de fêtes dans certaines habitations.</i>"
        }else{
            popup_content += "<i>Il fait nuit, et le quartier est presque désert.</i>"
        }
        night_events(marker.name, neighborhood_name)
    }
    if(
        (neighborhood["characters"].length==0) |//if there is nobody here
        is_night// or if it is the night
        ){
        popup_content += "<p>Le joueur ne rencontra aucun personnage intéressant ici.</p>"
    }else{
        popup_content += "<p>Les personnages suivants sont présents :</p>"
        for(character in neighborhood["characters"]){
            popup_content += `<button id=${"char_"+character}>${neighborhood["characters"][character]}</button>`
    }
    }
    
    popup_content += `<button id="Retour">Retour</button>`
    popup_content += "</div>"
    popup.setContent(popup_content)
    setTimeout(function(){
        if(!is_night){
            for(character in neighborhood["characters"]){
                document.getElementById("char_"+character).onclick=function(e){talk_character(e, popup, marker, neighborhood["characters"])}
            }
        }
        document.getElementById("Retour").onclick = function(){
            print_neighborhoods(marker, popup)
            marker.closePopup();
            marker.openPopup();
        }
    },1000)
    
}

function night_events(city_name, neighborhood_name){
    if((city_name=="Dragonoville") & (unlocked_subjects["embuscade_2"]) & !(unlocked_subjects["embuscade_3"])){
        unlocked_subjects["embuscade_3"]=true;
        current_day+=1/24;
        begginingMessage = 'Alors qu\'il marchait dans les ruelles sombres de Dragonoville, le joueur est pris en embuscade !';
        enemies = [
            { enemy_health: 100, enemy_attack: 20, enemy_name: 'Bandit', enemy_image: 'game/images/brigand.png', enemy_height: 380, proba_gold: 0.5, proba_potion: 0.5 },
            { enemy_health: 120, enemy_attack: 25, enemy_name: 'Bandit', enemy_image: 'game/images/brigand2.png', enemy_height: 380, proba_gold: 0.5, proba_potion: 0.5 },
            { enemy_health: 120, enemy_attack: 25, enemy_name: 'Bandit', enemy_image: 'game/images/brigand2.png', enemy_height: 380, proba_gold: 0.5, proba_potion: 0.5 }
        ];
        backgroundImage = 'game/images/BackAlley.webp';
        victoryMessage = 'Le combat fut difficile, mais le joueur triompha de ces adversaires. En fouillant les corps, il trouva une note sur laquelle il était écrit : "Cette fois-ci, ne le manquez pas !"';
        startCombat(begginingMessage, enemies, backgroundImage, victoryMessage);
    }
    if((neighborhood_name=="Quartier du Marché") | (neighborhood_name=="Marché") | (neighborhood_name=="Port")){
        if(Math.random()<0.3){
            alert("Une bagarre éclata dans une auberge et déborda jusqu'à la rue. Le joueur fut pris à parti. Après s'être vaillament défendu contre les attaques d'ivrognes, le joueur préféra s'éloigner.")
        }
    }
}

function talk_character(e, popup, marker, characters){
    char_id = e.target.id;
    character_name = characters[char_id.replaceAll("char_", "")]
    console.log(character_name)
    character_information = npcs_dialogues[character_name]
    character_dialogs = character_information["dialogues"]

    popup = remove_existing_content(popup)
    popup_content = popup.getContent()
    popup_content += `<div class='div_character popup_content'>
    <i>${character_information["description"]}</i>
    <div class='popup_content' id='list_dialogs'>
    `
    for(i_dialog in character_dialogs){
        dialog=character_dialogs[i_dialog]
        if(unlocked_subjects[dialog["need"]]){
            popup_content += `<button id=${"dialog_"+i_dialog}>${dialog["question"]}</button>`
        }
        
    }
    // Special case for l'Empereur
    if(character_name === "L'Empereur"){
        popup_content += `<button id='denounce_button'>Je pense avoir démasqué les conspirateurs !</button>`
    }
    popup_content += `</div><button id="Retour">Retour</button>`
    popup_content += "</div>"
    popup.setContent(popup_content)
    setTimeout(function(){
        document.getElementById("Retour").onclick = function(){
            print_neighborhoods(marker, popup)
            marker.closePopup();
            marker.openPopup();
        }
        for(i_dialog in character_dialogs){
            dialog=character_dialogs[i_dialog]
            if(unlocked_subjects[dialog["need"]]){
                document.getElementById("dialog_"+i_dialog).onclick=function(e){
                    add_answer(e, character_dialogs)
                }
            }
        }
        if(character_name === "L'Empereur"){
            document.getElementById('denounce_button').onclick = function(){
                show_accusation_form(popup, marker);
            }
        }
    },1000)
}

function show_accusation_form(popup, marker){
    // Assume npcs_positions contains the list of all characters
    var characters_list = Object.keys(npcs_dialogues);

    popup_content = popup.getContent();
    popup_content += `<div class='div_accusation popup_content'>
    <p>Sélectionnez les coupables parmi les personnages suivants :</p>
    <form id="accusation_form">`;

    characters_list.forEach(character => {
        popup_content += `
            <label>
                <input type="checkbox" name="suspect" value="${character}"> ${character}
            </label><br>`;
    });

    popup_content += `</form>
    <button id="submit_accusation">Soumettre</button>
    </div>`;

    popup.setContent(popup_content);

    setTimeout(function(){
        document.getElementById('submit_accusation').onclick = function(){
            process_accusation();
        };
    }, 1000);
}

function process_accusation(){
    var form = document.getElementById('accusation_form');
    var selected_suspects = [];
    var checkboxes = form.querySelectorAll('input[name="suspect"]:checked');

    checkboxes.forEach(checkbox => {
        selected_suspects.push(checkbox.value);
    });

    // The real list of conspirators, this should be defined in the game
    var real_conspirators = ["Haut Prêtre de Dragono", "Seigneur d'Alaris"];

    // Check if the player selected the correct conspirators and unlocked proof
    if(selected_suspects.sort().toString() === real_conspirators.sort().toString() && unlocked_subjects["proof"]){
        alert("Win !");
        handleVictory();  // Function to handle victory
    } else {
        alert("Les personnages accusés ne sont pas les bons, ou vous n'avez pas encore trouvé les preuves.");
    }
}

function handleVictory(){
    // Logic to handle victory (e.g., ending the game, displaying a winning message, etc.)
    console.log("The player has won the game!");
}

function add_answer(e, character_dialogs){
    i_dialog = e.target.id.replaceAll("dialog_", "");
    dialog = character_dialogs[i_dialog];
    console.log(dialog);
    answer = document.createElement("p");
    answer.innerHTML = dialog["answer"];
    e.target.insertAdjacentElement("afterend", answer);
    e.target.onclick="";
    unlocked_subjects[dialog["unlock"]]=true;
    //Add new unlocked dialog possibilities
    for(i_dialog in character_dialogs){
        new_dialog=character_dialogs[i_dialog]
        if(unlocked_subjects[new_dialog["need"]]){
            if(document.getElementById("dialog_"+i_dialog)===null){
                new_button = document.createElement("button")
                new_button.innerHTML= new_dialog["question"]
                new_button.id="dialog_"+i_dialog
                document.getElementById('list_dialogs').appendChild(new_button)
                document.getElementById("dialog_"+i_dialog).onclick=function(e){
                    add_answer(e, character_dialogs)
                }
            }
        }
    }
}


function startCombat(begginingMessage, enemies, backgroundImage, victoryMessage) {
    alert(begginingMessage);
    const combatDiv = document.createElement('div');
    combatDiv.id = 'combatDiv';
    combatDiv.style.position = 'absolute';
    combatDiv.style.top = '0';
    combatDiv.style.left = '0';
    combatDiv.style.width = '100%';
    combatDiv.style.height = '100%';
    combatDiv.style.backgroundImage = `url('${backgroundImage}')`;
    combatDiv.style.backgroundSize = 'cover';
    combatDiv.style.backgroundPosition = 'bottom';
    combatDiv.style.display = 'flex';
    combatDiv.style.flexDirection = 'column';
    combatDiv.style.alignItems = 'center';
    combatDiv.style.justifyContent = 'space-between';
    combatDiv.style.backgroundColor = 'beige';
    combatDiv.style.zIndex = '10000000';
    combatDiv.style.overflow = 'clip';
    document.body.appendChild(combatDiv);

    const battlefieldDiv = document.createElement('div');
    battlefieldDiv.id = 'battlefieldDiv';
    battlefieldDiv.style.display = 'flex';
    battlefieldDiv.style.flexDirection = 'row';
    battlefieldDiv.style.alignItems = 'end';
    battlefieldDiv.style.width = '100%';
    battlefieldDiv.style.height = '100%';
    battlefieldDiv.style.justifyContent = 'center';
    combatDiv.appendChild(battlefieldDiv);

    const playerDiv = document.createElement('div');
    playerDiv.id = 'playerDiv';
    playerDiv.innerHTML = `<img src="game/images/player.png" alt="Player" style="height: 400px;">`;
    playerDiv.innerHTML += `<p style="text-shadow: 1px 1px 5px white;background-color: green;text-align: center;color: wheat; margin: 0px;">Player Health: ${player_health}</p>`;
    playerDiv.innerHTML += `<p style="text-shadow: 1px 1px 5px white;background-color: blue;text-align: center;color: wheat; margin: 0px;">Player Stamina: ${player_stamina}</p>`;
    battlefieldDiv.appendChild(playerDiv);

    const enemiesDiv = document.createElement('div');
    enemiesDiv.id = 'enemiesDiv';
    enemiesDiv.style.display = 'flex';
    enemiesDiv.style.flexDirection = 'row';
    enemiesDiv.style.width = '50%';
    enemies.forEach(enemy => {
        const enemyDiv = document.createElement('div');
        enemyDiv.classList.add('enemy');
        enemyDiv.innerHTML = `<img src="${enemy.enemy_image}" alt="${enemy.enemy_name}" style="height: ${enemy.enemy_height}px;">`;
        enemyDiv.innerHTML += `<p style="text-shadow: 1px 1px 5px white;background-color: red;text-align: center;color: wheat;">${enemy.enemy_name} Health: ${enemy.enemy_health}</p>`;
        enemiesDiv.appendChild(enemyDiv);
        enemyDiv.attack = enemy.enemy_attack;
        enemyDiv.proba_gold = enemy.proba_gold;
        enemyDiv.proba_potion = enemy.proba_potion;
    });
    battlefieldDiv.appendChild(enemiesDiv);

    attackButtonsDiv = document.createElement('div');
    attackButtonsDiv.id = 'attackButtonsDiv';
    attackButtonsDiv.style.display = 'flex';
    attackButtonsDiv.style.justifyContent = 'center';
    combatDiv.appendChild(attackButtonsDiv);

    // Heavy Attack Button
    attack1Button = document.createElement('button');
    attack1Button.textContent = 'Heavy Attack (Single Enemy)';
    attack1Button.title = `Power: ${Math.floor(player_attack_1_strenght * (1-random_proportion))} - ${player_attack_1_strenght}`
    attack1Button.addEventListener('click', attack1);
    attackButtonsDiv.appendChild(attack1Button);

    // Light Attack Button
    attack2Button = document.createElement('button');
    attack2Button.textContent = 'Light Attack (All Enemies)';
    attack2Button.title = `Power: ${Math.floor(player_attack_2_strenght * (1-random_proportion))} - ${player_attack_2_strenght}, decreasing`
    attack2Button.addEventListener('click', attack2);
    attackButtonsDiv.appendChild(attack2Button);

    // Shield Button (New)
    shieldButton = document.createElement('button');
    shieldButton.textContent = 'Shield (Block & Recover Stamina)';
    shieldButton.title = 'Block the first enemy attack and recover stamina';
    shieldButton.addEventListener('click', activateShield);
    attackButtonsDiv.appendChild(shieldButton);

    // Create a shieldDiv for the shield animation
    const shieldDiv = document.createElement('div');
    shieldDiv.id = 'shieldDiv';
    shieldDiv.innerHTML = `<img src="Blasons/blason_dragon_rouge.png" alt="Shield" class="shield">`;
    combatDiv.appendChild(shieldDiv);
    shieldDiv.style.left = Math.floor(playerDiv.clientLeft + playerDiv.clientWidth*1.5)+"px";


    potionButton = document.createElement('button');
    potionButton.textContent = `Drink Healing Potion (${healing_potions} left)`;
    potionButton.title = 'Heal 50 HP, up to maximum health';
    potionButton.addEventListener('click', drinkPotion);
    attackButtonsDiv.appendChild(potionButton);


}

// Shield action
function activateShield() {
    shield_active = true;
    player_stamina = Math.min(max_stamina, player_stamina + stamina_regen_on_block);
    updatePlayerStats();
    // Show and animate the shield zoom-in
    const shieldElement = document.getElementById('shieldDiv');
    shieldElement.style.display = 'block';
    shieldElement.style.animation = 'shieldZoomIn 1s ease-out forwards';
    // Disable attack buttons while shield is active
    attack1Button.removeEventListener("click", attack1);
    attack2Button.removeEventListener("click", attack2);
    // Hide shield after animation completes (after 1.5 seconds)
    setTimeout(() => {
        shieldElement.style.display = 'none';
        test_victory(victoryMessage);
    }, 1500);
    
}

// Heavy Attack
function attack1() {
    if (player_stamina >= stamina_cost_attack1) {
        player_stamina -= stamina_cost_attack1; // Deduct stamina
        updatePlayerStats();
        executeHeavyAttack();
    } else {
        alert("Not enough stamina for Heavy Attack!");
    }
}

// Light Attack
function attack2() {
    if (player_stamina >= stamina_cost_attack2) {
        player_stamina -= stamina_cost_attack2; // Deduct stamina
        updatePlayerStats();
        executeLightAttack();
    } else {
        alert("Not enough stamina for Light Attack!");
    }
}

// Update player stats (health and stamina)
function updatePlayerStats() {
    document.getElementById('playerDiv').querySelector('p:nth-child(3)').textContent = `Player Stamina: ${player_stamina}`;
    document.getElementById('playerDiv').querySelector('p:nth-child(2)').textContent = `Player Health: ${player_health}`;
}

// Execute the heavy attack
function executeHeavyAttack() {
    attack1Button.removeEventListener("click", attack1);
    attack2Button.removeEventListener("click", attack2);

    enemyDivs = enemiesDiv.querySelectorAll('.enemy');
    enemyDivs.forEach(enemyDiv => {
        enemyDiv.onclick = function () {
            enemyDivs.forEach(enemyDiv2 => {
                enemyDiv2.onclick = "";
            });

            playerDamage = Math.ceil(player_attack_1_strenght * (1 - random_proportion) + Math.random() * player_attack_1_strenght * random_proportion);
            playerAttacks();
            const enemyHealth = enemyDiv.querySelector('p').textContent.split(': ')[1];
            const newEnemyHealth = Math.max(0, enemyHealth - playerDamage);
            setTimeout(() => {
                enemyDiv.querySelector('p').textContent = `Enemy Health: ${newEnemyHealth}`;
                enemyTakesDamage(enemyDiv);
            }, 500);

            if (newEnemyHealth === 0) {
                dropLoot(enemyDiv);
                enemyDiv.style.animation = 'shieldBreak 1s ease-out forwards';
                setTimeout(() => { enemyDiv.remove() }, 1000);
            }
            setTimeout(() => { test_victory(victoryMessage) }, 1000);
        }
    });
}

// Execute the light attack
function executeLightAttack() {
    attack1Button.removeEventListener("click", attack1);
    attack2Button.removeEventListener("click", attack2);

    playerDamage = Math.ceil(player_attack_2_strenght * (1 - random_proportion) + player_attack_2_strenght * random_proportion * Math.random());
    playerAttacks();
    enemyDivs = enemiesDiv.querySelectorAll('.enemy');
    let delay = 500;
    let i_enemy = 1;

    enemyDivs.forEach(enemyDiv => {
        const enemyHealth = enemyDiv.querySelector('p').textContent.split(': ')[1];
        const newEnemyHealth = Math.max(0, enemyHealth - Math.ceil(playerDamage / i_enemy));
        delay += 500;
        i_enemy += 1;

        setTimeout(() => {
            enemyDiv.querySelector('p').textContent = `Enemy Health: ${newEnemyHealth}`;
            enemyTakesDamage(enemyDiv);
        }, 500);

        if (newEnemyHealth === 0) {
            delay += 1000;
            dropLoot(enemyDiv);
            enemyDiv.style.animation = 'shieldBreak 1s ease-out forwards';
            setTimeout(() => { enemyDiv.remove() }, 1000);
        }
    });

    setTimeout(() => { test_victory(victoryMessage) }, delay);
}

function drinkPotion() {
    if (healing_potions > 0) {
        healing_potions -= 1; // Decrease the number of potions
        player_health = Math.min(max_player_health, player_health + healing_amount); // Add health, not exceeding max health
        updatePlayerStats(); // Update the player's stats
        potionButton.textContent = `Drink Healing Potion (${healing_potions} left)`;
    } else {
        alert("No healing potions left!");
    }
}

function enemies_attacks(enemies) {
    let delay = 1000;
    
    enemies.forEach(enemy => {
        delay += 1000;
        setTimeout(() => {
            var enemyDamage = Math.floor(Math.random()/2 * enemy.attack + enemy.attack/2);
            console.log(enemyDamage);
            enemyAttacks(enemy);
            if (shield_active) {
                shield_active = false; // Reset the shield after blocking
                // Play the shield break animation
                const shieldElement = document.getElementById('shieldDiv');
                shieldElement.style.display = 'block';
                shieldElement.style.animation = 'shieldBreak 1s ease-out forwards';

                // Hide the broken shield after the animation
                setTimeout(() => {
                    shieldElement.style.display = 'none';
                }, 1000);
            } else {
                player_health = Math.max(0, player_health - enemyDamage);
                setTimeout(
                    ()=>{
                        updatePlayerStats();
                        playerTakesDamage();
                    },100);
                if (player_health <= 0) {
                    // Player defeated
                    setTimeout(()=>{
                        handleDefeat("Vous êtes mort ! Plus rien ne peut empêcher l'Empire de sombrer désormais...");
                        },100);
                }
            }
        }, delay);
    });
}

function test_victory(victoryMessage){
    enemyDivs = enemiesDiv.querySelectorAll('.enemy');
    if(enemyDivs.length==0){
        alert(victoryMessage)
        document.getElementById('combatDiv').remove();
        if(after_function != null){
            after_function();
            after_function = null;
        }
    }else{
        enemies_attacks(enemyDivs);
        attack1Button.addEventListener('click', attack1);
        attack2Button.addEventListener('click', attack2);
    }
}
function handleDefeat(message){
    // Créer la div principale qui couvre tout l'écran
    const defeatScreen = document.createElement('div');
        
    // Ajouter du style à la div pour qu'elle couvre tout l'écran
    defeatScreen.style.position = 'fixed';
    defeatScreen.style.top = '0';
    defeatScreen.style.left = '0';
    defeatScreen.style.width = '100%';
    defeatScreen.style.height = '100%';
    defeatScreen.style.zIndex = '1000000000'; // Z-index très élevé pour être au-dessus de tout
    defeatScreen.style.display = 'flex';
    defeatScreen.style.flexDirection = 'column';
    defeatScreen.style.alignItems = 'center';
    defeatScreen.style.justifyContent = 'space-evenly';
    defeatScreen.style.textAlign = 'center';
    defeatScreen.style.fontFamily = 'Arial, sans-serif';

    // Ajouter une image d'arrière-plan avec transparence
    defeatScreen.style.backgroundImage = "url('game/images/defeat.jpg')"; // Remplacez par votre URL d'image
    defeatScreen.style.backgroundSize = 'cover'; // Pour couvrir tout l'écran
    defeatScreen.style.backgroundPosition = 'bottom'; // Pour aligner l'image avec le bas de l'écran
    defeatScreen.style.backgroundRepeat = 'no-repeat';

    // Texte principal
    const defeatMessage = document.createElement('h1');
    defeatMessage.textContent = message;
    defeatMessage.style.fontSize = '2em';
    defeatMessage.style.marginBottom = '20px';
    defeatMessage.style.color = 'red';


    // Bouton rejouer
    const replayButton = document.createElement('button');
    replayButton.textContent = 'Rejouer';
    replayButton.style.padding = '10px 20px';
    replayButton.style.fontSize = '1.5em';
    replayButton.style.backgroundColor = '#ff4b4b';
    replayButton.style.color = 'white';
    replayButton.style.border = 'none';
    replayButton.style.borderRadius = '5px';
    replayButton.style.cursor = 'pointer';
    replayButton.style.transition = 'background-color 0.3s ease';

    // Ajouter un hover effect au bouton
    replayButton.onmouseover = function() {
        replayButton.style.backgroundColor = '#e63939';
    };

    replayButton.onmouseout = function() {
        replayButton.style.backgroundColor = '#ff4b4b';
    };

    // Fonctionnalité du bouton pour recharger la page
    replayButton.onclick = function() {
        location.reload();
    };

    // Ajouter tous les éléments à la div principale
    defeatScreen.appendChild(defeatMessage);
    defeatScreen.appendChild(replayButton);

    // Ajouter la div principale au body de la page
    document.body.appendChild(defeatScreen);
}


function playerTakesDamage() {
    const playerDiv = document.getElementById('playerDiv');
    playerDiv.classList.add('damage-animation');
    setTimeout(() => {
        playerDiv.classList.remove('damage-animation');
    }, 500);
}

function playerAttacks() {
    const playerDiv = document.getElementById('playerDiv');
    playerDiv.classList.add('attack-animation');
    setTimeout(() => {
        playerDiv.classList.remove('attack-animation');
    }, 300);
}

function enemyTakesDamage(enemyDiv) {
    enemyDiv.classList.add('damage-animation');
    setTimeout(() => {
        enemyDiv.classList.remove('damage-animation');
    }, 500);
}

function enemyAttacks(enemyDiv) {
    enemyDiv.classList.add('attack-animation');
    setTimeout(() => {
        enemyDiv.classList.remove('attack-animation');
    }, 300);
}

// Function to animate loot (either potion or gold)
function animateLoot(lootDiv, targetButton) {
    const targetRect = targetButton.getBoundingClientRect();
    const lootRect = lootDiv.getBoundingClientRect();

    const deltaX = targetRect.left - lootRect.left;
    const deltaY = targetRect.top - lootRect.top;

    lootDiv.style.transition = 'transform 1s ease-out';
    lootDiv.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    setTimeout(() => {
        lootDiv.remove(); // Remove the loot after the animation
    }, 1000);
}

// Function to handle loot drop when an enemy dies
function dropLoot(enemyDiv) {
    if(Math.random()<=enemyDiv.proba_potion){
        const lootDiv = document.createElement('div');
        lootDiv.style.position = 'absolute';
        lootDiv.style.left = `${enemyDiv.getBoundingClientRect().left+ Math.floor(enemyDiv.clientWidth/2)}px`;
        lootDiv.style.top = `${enemyDiv.getBoundingClientRect().top + Math.floor(enemyDiv.clientHeight/2)}px`;
        lootDiv.style.zIndex = '100000000';

        lootDiv.innerHTML = `<img src="game/images/potion.png" style="width: 30px;">`;
        document.body.appendChild(lootDiv);

        animateLoot(lootDiv, potionButton);

        healing_potions += 1; // Increase the number of potions
        potionButton.textContent = `Drink Healing Potion (${healing_potions} left)`;
    }
    if(Math.random()<=enemyDiv.proba_gold){
        const lootDiv = document.createElement('div');
        lootDiv.style.position = 'absolute';
        lootDiv.style.left = `${enemyDiv.getBoundingClientRect().left+ Math.floor(enemyDiv.clientWidth/2)}px`;
        lootDiv.style.top = `${enemyDiv.getBoundingClientRect().top + Math.floor(enemyDiv.clientHeight/2)}px`;
        lootDiv.style.zIndex = '100000000';
        
        lootDiv.innerHTML = `<img src="game/images/pieces.png" style="width: 50px;">`;
        document.body.appendChild(lootDiv);

        animateLoot(lootDiv, goldDisplay);

        player_gold += Math.floor(Math.random() * 50) + 10; // Random gold between 10 and 60
        goldDisplay.textContent = `Gold: ${player_gold}`;
    }
}

function test_battle(){
    // Example usage:
    current_day+=1/12;
    begginingMessage = 'Quelques heures après avoir quitté Alaris, le joueur est attaqué par 3 adversaires encapuchonnés !';
    enemies = [
        { enemy_health: 20, enemy_attack: 5, enemy_name: 'rat', enemy_image: 'game/images/rat1.png', enemy_height: 50 , proba_gold: 0.1, proba_potion: 0},
        { enemy_health: 20, enemy_attack: 5, enemy_name: 'rat', enemy_image: 'game/images/rat2.png', enemy_height: 50, proba_gold: 1, proba_potion: 0 },
        { enemy_health: 50, enemy_attack: 10, enemy_name: 'loup', enemy_image: 'game/images/loup.png', enemy_height: 200, proba_gold: 0.1, proba_potion: 0 },
        { enemy_health: 50, enemy_attack: 10, enemy_name: 'loup', enemy_image: 'game/images/loup.png', enemy_height: 200 , proba_gold: 0.1, proba_potion: 0},
        { enemy_health: 50, enemy_attack: 10, enemy_name: 'loup', enemy_image: 'game/images/loup.png', enemy_height: 200 , proba_gold: 0.1, proba_potion: 0},
        { enemy_health: 50, enemy_attack: 10, enemy_name: 'loup', enemy_image: 'game/images/loup.png', enemy_height: 200 , proba_gold: 0.1, proba_potion: 1}
    ];
    backgroundImage = 'game/images/une-voie-romaine.jpg';
    victoryMessage = 'Après un rude combat, le joueur se débarrassa de ses attaquants. En fouillant les corps, le joueur trouva une note sur laquelle il est écrit : "Tuez le chien de l\'Empereur ! G"';
    startCombat(begginingMessage, enemies, backgroundImage, victoryMessage);
}

function explore(remaining_levels){
    console.log(remaining_levels);
    if(remaining_levels<=0){
        //Boss fight !
        alert("Boss fight !")
    }else{
        exploration_game = document.createElement("div");
        exploration_game.id = "exploration_game";
        exploration_game.innerHTML = '<canvas id="gameCanvas" width="600" height="600"></canvas>';
        document.querySelector("body").appendChild(exploration_game);
        canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        potion_div = document.createElement("div")
        exploration_game.appendChild(potion_div);
        potion_div.style = "position:absolute; top:50px; right:10px; background-color: magenta; padding: 5px; font-size: 20px; z-index: 100000000;"
        potion_div.textContent = `Potions : ${healing_potions}`;

        pv_div = document.createElement("div")
        exploration_game.appendChild(pv_div);
        pv_div.style = "position:absolute; top:90px; right:10px; background-color: red; padding: 5px; font-size: 20px; z-index: 100000000;"
        pv_div.textContent = `PV : ${player_health}`;

        // Game variables
        var tileSize = 40; // Size of each tile
        var rows = canvas.height / tileSize;
        var cols = canvas.width / tileSize;

        var list_enemies = [];

        function generateDungeon() {
            // Initialize map with walls
            let dungeon = Array(rows).fill(null).map(() => Array(cols).fill(1));
        
            // Helper function to create a room
            function createRoom(x, y, w, h) {
                for (let i = y; i < y + h; i++) {
                    for (let j = x; j < x + w; j++) {
                        if (i >= 0 && i < rows && j >= 0 && j < cols) {
                            dungeon[i][j] = 0; // Empty space
                        }
                    }
                }
            }
        
            // Create rooms
            const rooms = [];
            const numRooms = Math.floor(Math.random() * 5) + 5; // Between 5 and 10 rooms
        
            for (let i = 0; i < numRooms; i++) {
                const roomWidth = Math.floor(Math.random() * 3) + 2; // 3 to 7 tiles
                const roomHeight = Math.floor(Math.random() * 3) + 2;
                const roomX = Math.floor(Math.random() * (cols - roomWidth - 1)) + 1;
                const roomY = Math.floor(Math.random() * (rows - roomHeight - 1)) + 1;
        
                createRoom(roomX, roomY, roomWidth, roomHeight);
                rooms.push({ x: roomX, y: roomY, w: roomWidth, h: roomHeight });
            }
        
            // Connect rooms with corridors
            function createCorridor(x1, y1, x2, y2) {
                let currentX = x1;
                let currentY = y1;
        
                while (currentX !== x2 || currentY !== y2) {
                    dungeon[currentY][currentX] = 0; // Empty space
                    if(Math.random()>0.5){
                        if (currentX < x2) currentX++;
                        else if (currentX > x2) currentX--;
                    }else{
                        if (currentY < y2) currentY++;
                        else if (currentY > y2) currentY--;
                    }
                }
            }
            
            createCorridor(1, 1,rooms[0].x,  rooms[0].y)
            createCorridor(rooms[numRooms-1].x,  rooms[numRooms-1].y, rows-2, cols-2)
            for (let i = 0; i < rooms.length - 1; i++) {
                const roomA = rooms[i];
                const roomB = rooms[i + 1];
                createCorridor(
                    Math.floor(roomA.x + roomA.w / 2),
                    Math.floor(roomA.y + roomA.h / 2),
                    Math.floor(roomB.x + roomB.w / 2),
                    Math.floor(roomB.y + roomB.h / 2)
                );
            }
        
            // Ensure start and exit positions are inside rooms or connected
            dungeon[1][1] = 0; // Start position
            dungeon[rows - 2][cols - 2] = 0; // Exit position
        
            // Place enemies, traps, and chests
            function placeElement(element, count) {
                while (count > 0) {
                    const x = Math.floor(Math.random() * cols);
                    const y = Math.floor(Math.random() * rows);
        
                    if (dungeon[y][x] === 0 && !(x === 1 && y === 1) && !(x === cols - 2 && y === rows - 2)) {
                        if(element!=5){
                            dungeon[y][x] = element;
                        }else{
                            //Enemies
                            var rand1 = (Math.random()>0.5)
                            var rand2 = 2 * ((Math.random()>0.5) - 0.5)
                            var enemy={
                                "x":x,
                                "y":y,
                                "dx": rand1 * rand2,
                                "dy": (1-rand1) * rand2
                            }
                            list_enemies.push(enemy);
                        }
                        
                        count--;
                    }
                }
            }
        
            const numEnemies = Math.floor(Math.random() * 5) + 2; // 5 to 15 enemies
            const numTraps = Math.floor(Math.random() * 10) + 5; // 5 to 15 traps
            const numChests = Math.floor(Math.random() * 4) + 1; // 3 to 8 chests
        
            placeElement(5, numEnemies); // Place enemies
            placeElement(4, numTraps); // Place traps
            placeElement(3, numChests); // Place chests
        
            // Mark exit
            dungeon[rows - 2][cols - 2] = 2;
        
            return dungeon;
        }

        explo_map = generateDungeon();

        var player_explo = {
            x: 1,
            y: 1,
            color: 'yellow'
        };

        // Movement control
        document.addEventListener('keydown', moveplayer_explo);

        function moveplayer_explo(e) {
            switch (e.key) {
                case 'ArrowUp':
                    if (explo_map[player_explo.y - 1][player_explo.x] !== 1) player_explo.y -= 1;
                    break;
                case 'ArrowDown':
                    if (explo_map[player_explo.y + 1][player_explo.x] !== 1) player_explo.y += 1;
                    break;
                case 'ArrowLeft':
                    if (explo_map[player_explo.y][player_explo.x - 1] !== 1) player_explo.x -= 1;
                    break;
                case 'ArrowRight':
                    if (explo_map[player_explo.y][player_explo.x + 1] !== 1) player_explo.x += 1;
                    break;
            }
            drawGame();
            checkGoal();
            checkTrap();
            checkChest();
            checkEnemy();
        }

        function checkGoal() {
            if (explo_map[player_explo.y][player_explo.x] === 2) {
                document.removeEventListener('keydown', moveplayer_explo);
                clearInterval(move_enemies_set_interval);
                document.getElementById("exploration_game").remove()
                explore( remaining_levels - 1);
            }
        }

        function checkTrap() {
            if (explo_map[player_explo.y][player_explo.x] === 4) {
                //alert('You walked on a trap!');
                ctx.drawImage(textures.trap_activated, player_explo.x * tileSize, player_explo.y * tileSize, tileSize, tileSize);
                player_health -=10;
                pv_div.textContent = `PV : ${player_health}`;
                pv_div.style.animation = "shake 0.5s ease-in-out";
                setTimeout(()=>{pv_div.style.animation = "";}, 500);
                explo_map[player_explo.y][player_explo.x] = 0;
                if (player_health <= 0) {
                    // Player defeated
                    setTimeout(()=>{
                        handleDefeat("Vous êtes mort ! Plus rien ne peut empêcher l'Empire de sombrer désormais...");
                        },100);
                }
            }
        }

        function checkEnemy() {
            var new_list_enemies = [];
            var enemies_to_fight = [];
            for(let i=0; i<list_enemies.length; i++){
                var enemy = list_enemies[i];
                if ((player_explo.x == enemy.x) & (player_explo.y == enemy.y)) {
                    begginingMessage = `Vous êtes attaqué !`;
                    roll = Math.random()
                    if( roll <= 0.3){
                        enemies = [
                            { enemy_health: 10, enemy_attack: 5, enemy_name: 'Rat', enemy_image: 'game/images/rat1.png', enemy_height: 100 , proba_gold: 0.8, proba_potion: 0.3},
                            { enemy_health: 10, enemy_attack: 5, enemy_name: 'Rat', enemy_image: 'game/images/rat2.png', enemy_height: 100 , proba_gold: 0.8, proba_potion: 0.3},
                            { enemy_health: 10, enemy_attack: 5, enemy_name: 'Rat', enemy_image: 'game/images/rat2.png', enemy_height: 100 , proba_gold: 0.8, proba_potion: 0.3 },
                            { enemy_health: 10, enemy_attack: 5, enemy_name: 'Rat', enemy_image: 'game/images/rat1.png', enemy_height: 100 , proba_gold: 0.8, proba_potion: 0.3},
                            { enemy_health: 10, enemy_attack: 5, enemy_name: 'Rat', enemy_image: 'game/images/rat2.png', enemy_height: 100 , proba_gold: 0.8, proba_potion: 0.3},
                            { enemy_health: 10, enemy_attack: 5, enemy_name: 'Rat', enemy_image: 'game/images/rat2.png', enemy_height: 100 , proba_gold: 0.8, proba_potion: 0.3 }
                        ];
                        enemies_to_fight = enemies_to_fight.concat(enemies);
                    }else if(roll <= 0.6){
                        enemies = [
                            { enemy_health: 60, enemy_attack: 20, enemy_name: 'Squelette', enemy_image: 'game/images/squelette_1.png', enemy_height: 350 , proba_gold: 0.8, proba_potion: 0.3},
                            { enemy_health: 60, enemy_attack: 20, enemy_name: 'Squelette', enemy_image: 'game/images/squelette_1.png', enemy_height: 350 , proba_gold: 0.8, proba_potion: 0.3},
                            { enemy_health: 60, enemy_attack: 50, enemy_name: 'Squelette', enemy_image: 'game/images/squelette_2.png', enemy_height: 350 , proba_gold: 0.8, proba_potion: 0.3 },
                        ];
                        enemies_to_fight = enemies_to_fight.concat(enemies);
                    }else{
                        enemies = [
                            { enemy_health: 10, enemy_attack: 5, enemy_name: 'Rat', enemy_image: 'game/images/rat1.png', enemy_height: 100 , proba_gold: 0.8, proba_potion: 0.3},
                            { enemy_health: 10, enemy_attack: 5, enemy_name: 'Rat', enemy_image: 'game/images/rat2.png', enemy_height: 100 , proba_gold: 0.8, proba_potion: 0.3},
                            { enemy_health: 10, enemy_attack: 5, enemy_name: 'Rat', enemy_image: 'game/images/rat2.png', enemy_height: 100 , proba_gold: 0.8, proba_potion: 0.3 },
                            { enemy_health: 10, enemy_attack: 5, enemy_name: 'Rat', enemy_image: 'game/images/rat1.png', enemy_height: 100 , proba_gold: 0.8, proba_potion: 0.3},
                            { enemy_health: 10, enemy_attack: 5, enemy_name: 'Rat', enemy_image: 'game/images/rat2.png', enemy_height: 100 , proba_gold: 0.8, proba_potion: 0.3},
                            { enemy_health: 10, enemy_attack: 5, enemy_name: 'Rat', enemy_image: 'game/images/rat2.png', enemy_height: 100 , proba_gold: 0.8, proba_potion: 0.3 }
                        ];
                        enemies_to_fight = enemies_to_fight.concat(enemies);
                    }
                    
                    
                    
                }else{
                    new_list_enemies.push(enemy);
                }
            }
            if(length(enemies_to_fight)>0){
                clearInterval(move_enemies);
                backgroundImage = 'game/images/dungeon.jpg';
                victoryMessage = `Victoire !`;
                startCombat(begginingMessage, enemies, backgroundImage, victoryMessage);
                after_function = function(){
                    player_gold +=50;
                    goldDisplay.textContent = `Gold: ${player_gold}`;
                    explo_map[player_explo.y][player_explo.x] = 0;
                    potion_div.textContent = `Potions : ${healing_potions}`;
                    pv_div.textContent = `PV : ${player_health}`;
                    setInterval(move_enemies, enemy_speed);
                }
            }
            list_enemies = new_list_enemies;
        }

        function checkChest(){
            if (explo_map[player_explo.y][player_explo.x] === 3) {
                //The player can't move while the chest opens
                document.removeEventListener('keydown', moveplayer_explo);
                setTimeout(()=>{
                    document.addEventListener('keydown', moveplayer_explo);
                }, 600);
                //alert("You found a chest !");
                ctx.drawImage(textures.chest, player_explo.x * tileSize, player_explo.y * tileSize, tileSize, tileSize);
                var interval = 200
                setTimeout(()=>{
                    ctx.drawImage(textures.chest_1, player_explo.x * tileSize, player_explo.y * tileSize, tileSize, tileSize);
                }, interval);
                setTimeout(()=>{
                    ctx.drawImage(textures.chest_2, player_explo.x * tileSize, player_explo.y * tileSize, tileSize, tileSize);
                }, 2*interval);
                setTimeout(()=>{
                    ctx.drawImage(textures.chest_3, player_explo.x * tileSize, player_explo.y * tileSize, tileSize, tileSize);
                }, 3*interval);
                if(Math.random()<=0.5){
                    const lootDiv = document.createElement('div');
                    lootDiv.style.position = 'absolute';
                    lootDiv.style.left = `${canvas.offsetLeft + 40*player_explo.x}px`;
                    lootDiv.style.top = `${canvas.offsetTop + 40*player_explo.y}px`;
                    lootDiv.style.zIndex = '100000000';
            
                    lootDiv.innerHTML = `<img src="game/images/potion.png" style="width: 30px;">`;
                    document.body.appendChild(lootDiv);
            
                    animateLoot(lootDiv, potion_div);
            
                    healing_potions += 1; // Increase the number of potions
                    potion_div.textContent = `Potions : ${healing_potions}`;
                }
                else if(Math.random()<=0.5){
                    const lootDiv = document.createElement('div');
                    lootDiv.style.position = 'absolute';
                    lootDiv.style.left = `${canvas.offsetLeft + 40*player_explo.x}px`;
                    lootDiv.style.top = `${canvas.offsetTop + 40*player_explo.y}px`;
                    lootDiv.style.zIndex = '100000000';
                    
                    lootDiv.innerHTML = `<img src="game/images/pieces.png" style="width: 50px;">`;
                    document.body.appendChild(lootDiv);
            
                    animateLoot(lootDiv, goldDisplay);
            
                    player_gold += Math.floor(Math.random() * 50) + 10; // Random gold between 10 and 60
                    goldDisplay.textContent = `Gold: ${player_gold}`;
                }
                else{
                    //alert("The chest was trapped !");
                    
                    setTimeout(()=>{
                        ctx.drawImage(textures.player, player_explo.x * tileSize, player_explo.y * tileSize, tileSize, tileSize);
                        ctx.drawImage(textures.trap_activated, player_explo.x * tileSize, player_explo.y * tileSize, tileSize, tileSize);
                        pv_div.style.animation = "shake 0.5s ease-in-out";
                        player_health -=10;
                        pv_div.textContent = `PV : ${player_health}`;
                        if (player_health <= 0) {
                            // Player defeated
                            setTimeout(()=>{
                                handleDefeat("Vous êtes mort ! Plus rien ne peut empêcher l'Empire de sombrer désormais...");
                                },100);
                        }
                        setTimeout(()=>{pv_div.style.animation = "";}, 500);
                    }, 4*interval);
                    
                    
                }
                
                explo_map[player_explo.y][player_explo.x] = 0;
            }
        }

        // Preload textures for dungeon elements and player
        var textures = {};
        function preloadImages() {
            const imagePaths = {
                wall: 'game/images/dungeon/walls.png',
                exit: 'https://www.shutterstock.com/image-illustration/medieval-arch-wooden-closed-castle-600nw-2190794637.jpg',
                empty: 'game/images/dungeon/floors.png',
                chest: 'game/images/dungeon/tresor.png',
                chest_1:'game/images/dungeon/tresor1.png',
                chest_2:'game/images/dungeon/tresor2.png',
                chest_3:'game/images/dungeon/tresor3.png',
                trap: 'game/images/dungeon/trap.png',
                trap_activated: 'game/images/dungeon/trap_activated.png',
                enemy: 'game/images/squelette_1.png',
                player: 'game/images/player.png'
            };

            const promises = Object.keys(imagePaths).map((key) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = imagePaths[key];
                    img.onload = () => {
                        textures[key] = img;
                        resolve();
                    };
                    img.onerror = reject;
                });
            });

            return Promise.all(promises);
        }

        function drawGame() {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        
            // Draw the map
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    let tileTexture;
        
                    // Determine the texture based on the map value
                    if (explo_map[y][x] === 1) {
                        tileTexture = textures.wall; // Wall
                        ctx.drawImage(tileTexture, x * tileSize, y * tileSize, tileSize, tileSize);
                    } else if (explo_map[y][x] === 2) {
                        tileTexture = textures.exit; // Exit
                        ctx.drawImage(textures.empty, x * tileSize, y * tileSize, tileSize, tileSize);
                        ctx.drawImage(tileTexture, x * tileSize, y * tileSize, tileSize, tileSize);
                    } else if (explo_map[y][x] === 0) {
                        ctx.drawImage(textures.empty, x * tileSize, y * tileSize, tileSize, tileSize); // Empty space
                    } else if (explo_map[y][x] === 3) {
                        tileTexture = textures.chest; // Chest
                        ctx.drawImage(textures.empty, x * tileSize, y * tileSize, tileSize, tileSize);
                        ctx.drawImage(tileTexture, x * tileSize, y * tileSize, tileSize, tileSize);
                    } else if (explo_map[y][x] === 4) {
                        tileTexture = textures.trap; // Trap
                        ctx.drawImage(textures.empty, x * tileSize, y * tileSize, tileSize, tileSize);
                        ctx.drawImage(tileTexture, x * tileSize, y * tileSize, tileSize, tileSize);
                    }/* else if (explo_map[y][x] === 5) {
                        tileTexture = textures.enemy; // Enemy
                        ctx.drawImage(textures.empty, x * tileSize, y * tileSize, tileSize, tileSize);
                        ctx.drawImage(tileTexture, x * tileSize, y * tileSize, tileSize, tileSize);
                    }*/
                }
            }
        
            // Draw the player
            //ctx.drawImage(textures.empty, player_explo.x * tileSize, player_explo.y * tileSize, tileSize, tileSize);
            ctx.drawImage(textures.player, player_explo.x * tileSize, player_explo.y * tileSize, tileSize, tileSize);
            //Draw enemies
            for(let i=0; i<list_enemies.length; i++){
                var enemy = list_enemies[i];
                ctx.drawImage(textures.enemy, enemy.x * tileSize, enemy.y * tileSize, tileSize, tileSize);
            }
        }
        
        // Start the game by drawing the initial state
        preloadImages().then(() => {
            // Once all images are loaded, start the game
            drawGame();
        }).catch((error) => {
            console.error('Error loading images:', error);
        });

        function move_enemies(){
            for(let i=0; i<list_enemies.length; i++){
                var enemy = list_enemies[i];
                if(explo_map[enemy.y + enemy.dy][enemy.x + enemy.dx] === 0){//move the enemy only to empty cells
                    ctx.drawImage(textures.empty, enemy.x * tileSize, enemy.y * tileSize, tileSize, tileSize);
                    enemy.x = enemy.x + enemy.dx;
                    enemy.y = enemy.y + enemy.dy;
                    ctx.drawImage(textures.empty, enemy.x * tileSize, enemy.y * tileSize, tileSize, tileSize);
                    ctx.drawImage(textures.enemy, enemy.x * tileSize, enemy.y * tileSize, tileSize, tileSize);
                }else{//the enemy chose a new random direction
                    var rand1 = (Math.random()>0.5);
                    var rand2 = 2 * ((Math.random()>0.5) - 0.5);
                    enemy.dx = rand1 * rand2;
                    enemy.dy= (1-rand1) * rand2;
                }
            }
            checkEnemy();
        }

        enemy_speed = 500
        move_enemies_set_interval = setInterval(move_enemies, enemy_speed);
    }    
}