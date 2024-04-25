mymap.flyTo({"lat":14.203151, "lng":-54.283447},9)
document.getElementById("overlay").style.display = "none";
current_day = 0.25
today = 0.25
initial_remaining_time = 6.75
current_position = "Dragonoville"
npcs_positions={}
npcs_dialogues={}
travel_times={}
unlocked_subjects={"":true, "before_cesar":true}
alert("Vous êtes envoyé par l'Empereur dans la ville de Dragonoville pour enquêter secrètement sur un éventuel complot contre l'Empire. Tout le monde est suspect : les conspirateurs peuvent être le seigneur des Barbares, ou le Grand Prêtre de Dragono, ou le Grand Maître des guildes de Marchands, d'Artisans ou de Guerriers. Il peut également s'agir du seigneur d'une autre ville de Dragonoland, comme le seigneur guerrier d'Alaris, ou les seigneurs de Pontcastel, du port de Dragonoville ou de Chiot-chiotville. Des espions étrangers peuvent également faire partie de l'intrigue. Toutes ces personnes seront présentes à Dragonoville pour le festival de Dragono qui aura lieu dans une semaine. Vous arrivez à Dragonoville. Quelle est la première chose que vous ferez ?")
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

function set_popups_using_daily_position(positions_day, current_day){
    for(location_name in positions_day){
        for(i_marker in listeMarkers){
            var marker = listeMarkers[i_marker];
            if(marker.name==location_name){
                popup = marker.getPopup();
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
                            	    document.getElementsByClassName("button_go")[0].onclick=function(){go_location(e.target)}
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
    move_events(current_position, location_name);
    travel_time = get_travel_time(current_position, location_name)/24;
    current_day += travel_time;
    current_position = location_name;
    update_time(current_day);
    set_popups_using_daily_position(positions_day, current_day);
    marker.closePopup();
    marker.openPopup();

}

function move_events(current_position, location_name){
    if((current_position=="Alaris") & (unlocked_subjects["explication_louche"]) & !(unlocked_subjects["embuscade"])){
        unlocked_subjects["embuscade"]=true;
        current_day+=1/12;
        alert('Quelques heures après avoir quitté Alaris, le joueur est attaqué par 3 adversaires encapuchonnés. Après un rude combat, le joueur se débarrassa de ses attaquants. En fouillant les corps, le joueur trouva une note sur laquelle il est écrit : "Tuez le chien de l\'Empereur ! G"')
    }
    //random events in any road
    if((Math.random()<0.1) & !unlocked_subjects["loups"]){
        current_day+=1/8;
        alert(`Peu de temps avant d'arriver à ${location_name}, le joueur se retrouva nez à nez avec une meute de loups. Le combat fut difficile. Les derniers loups s'enfuirent quand le joueur tua un grand loup blanc, qui devait probablement mener la meute.`)
        unlocked_subjects["loups"]=true;
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
            setTimeout(function(){
                for(neighborhood in neighborhoods){
                    console.log(neighborhood.replaceAll(" ", "_"))
                    document.getElementById(neighborhood.replaceAll(" ", "_")).onclick=function(e){show_characters(e, popup, marker, neighborhoods)}
                }
                document.getElementById("Repos").onclick=function(e){
                    current_day+=6/24;
                    update_time(current_day);
                    set_popups_using_daily_position(positions_day, current_day);
                    marker.closePopup();
                    marker.openPopup();
                }
            },1000)
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
        alert("Le joueur a échoué à identifier les conspirateurs durant le temps imparti ! L'Empereur est assassiné durant le festival, sans que le joueur, impuissant, ne puisse faire quoi que ce soit !")
        window.location="";
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
    if((neighborhood_name=="Quartier du Marché") | (neighborhood_name=="Quartier du Marché")){
        if(Math.random()<0.1){
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
    },1000)
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
    combatDiv.style.display = 'flex';
    combatDiv.style.flexDirection = 'column';
    combatDiv.style.alignItems = 'center';
    combatDiv.style.justifyContent = 'space-between';
    combatDiv.style.backgroundColor= 'beige';
    document.body.appendChild(combatDiv);

    const battlefieldDiv = document.createElement('div');
    battlefieldDiv.id = 'battlefieldDiv';
    battlefieldDiv.style.display = 'flex';
    battlefieldDiv.style.flexDirection = 'column-reverse';
    battlefieldDiv.style.alignItems = 'center';
    battlefieldDiv.style.width = '100%';
    battlefieldDiv.style.height = '100%';
    battlefieldDiv.style.justifyContent = 'space-between';
    combatDiv.appendChild(battlefieldDiv);

    const playerDiv = document.createElement('div');
    playerDiv.id = 'playerDiv';
    playerDiv.innerHTML = `<img src="player_image.jpg" alt="Player" style="width: 100px; height: auto;">`;
    playerDiv.innerHTML += `<p>Player Health: 100</p>`;
    battlefieldDiv.appendChild(playerDiv);

    const enemiesDiv = document.createElement('div');
    enemiesDiv.id = 'enemiesDiv';
    enemiesDiv.style.display = 'flex';
    enemiesDiv.style.flexDirection = 'row-reverse';
    enemies.forEach(enemy => {
        const enemyDiv = document.createElement('div');
        enemyDiv.classList.add('enemy');
        enemyDiv.innerHTML = `<img src="${enemy.ennemy_image}" alt="${enemy.ennemy_name}" style="width: 100px; height: auto;">`;
        enemyDiv.innerHTML += `<p>${enemy.ennemy_name} Health: ${enemy.ennemy_health}</p>`;
        enemyDiv.attack = enemy.attack;
        enemiesDiv.appendChild(enemyDiv);
    });
    battlefieldDiv.appendChild(enemiesDiv);

    const attackButtonsDiv = document.createElement('div');
    attackButtonsDiv.id = 'attackButtonsDiv';
    attackButtonsDiv.style.display = 'flex';
    attackButtonsDiv.style.justifyContent = 'center';
    combatDiv.appendChild(attackButtonsDiv);

    const attack1Button = document.createElement('button');
    attack1Button.textContent = 'Heavy Attack (Single Enemy)';
    attack1Button.addEventListener('click', () => {
        // Logic for heavy attack
        // Player chooses target enemy
        enemyDivs = enemiesDiv.querySelectorAll('.enemy');
        enemyDivs.forEach(enemyDiv => {
            enemyDiv.onclick = function(){
                //We remove the event listeners
                enemyDivs.forEach(enemyDiv2 => {
                    enemyDiv2.onclick="";
                })
                //we applie the damages
                playerDamage = 25 + Math.floor(Math.random()*25);
                const enemyHealth = enemyDiv.querySelector('p').textContent.split(': ')[1];
                const newEnemyHealth = Math.max(0, enemyHealth - playerDamage);
                enemyDiv.querySelector('p').textContent = `Enemy Health: ${newEnemyHealth}`;
                if (newEnemyHealth === 0) {
                    // Enemy defeated
                    enemyDiv.style.display = 'none';
                }
            }
            
        });
        enemy_attacks(enemies);

    });
    attackButtonsDiv.appendChild(attack1Button);

    const attack2Button = document.createElement('button');
    attack2Button.textContent = 'Light Attack (All Enemies)';
    attack2Button.addEventListener('click', () => {
        // Logic for light attack
        playerDamage = 10 + Math.ceil(10 * Math.random());
        enemyDivs = enemiesDiv.querySelectorAll('.enemy');
        enemyDivs.forEach(enemyDiv => {
            const enemyHealth = enemyDiv.querySelector('p').textContent.split(': ')[1];
            const newEnemyHealth = Math.max(0, enemyHealth - playerDamage);
            enemyDiv.querySelector('p').textContent = `Enemy Health: ${newEnemyHealth}`;
            if (newEnemyHealth === 0) {
                // Enemy defeated
                enemyDiv.style.display = 'none';
            }
        });
        enemy_attacks(enemies)
    });
    attackButtonsDiv.appendChild(attack2Button);

    // Function to handle enemy attacks

    // Function to handle player attacks

    // Function to check victory conditions
}

function enemy_attacks(enemies){
    const playerHealth = document.getElementById('playerDiv').querySelector('p').textContent.split(': ')[1];
    enemies.forEach(enemy => {
        enemyDamage = Math.floor(Math.random()/2 * enemy.attack ) + enemy.attack/2;
        const newPlayerHealth = Math.max(0, playerHealth - enemyDamage);
    document.getElementById('playerDiv').querySelector('p').textContent = `Player Health: ${newPlayerHealth}`;
    if (newPlayerHealth === 0) {
        // Player defeated
        handleDefeat();
    }
}

/*
// Example usage:
const begginingMessage = 'Prepare for battle!';
const enemies = [
    { ennemy_health: 100, ennemy_attack: 20, ennemy_name: 'Enemy 1', ennemy_image: 'enemy1_image.jpg' },
    { ennemy_health: 120, ennemy_attack: 25, ennemy_name: 'Enemy 2', ennemy_image: 'enemy2_image.jpg' }
];
const backgroundImage = 'battle_background.jpg';
const victoryMessage = 'Victory! The enemies have been defeated!';
startCombat(begginingMessage, enemies, backgroundImage, victoryMessage);
*/