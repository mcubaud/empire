mymap.flyTo({"lat":14.203151, "lng":-54.283447},9)
current_day = 0
current_position = "Dragonoville"
npcs_positions={}
alert("Vous êtes envoyé par l'Empereur dans la ville de Dragonoville pour enquêter secrètement sur un éventuel complot contre l'Empire. Tout le monde est suspect : les conspirateurs peuvent être le seigneur des Barbares, ou le Grand Prêtre de Dragono, ou le Grand Maître des guildes de Marchands, d'Artisans ou de Guerriers. Il peut également s'agir du seigneur d'une autre ville de Dragonoland, comme le seigneur guerrier d'Alaris, ou les seigneurs de Pontcastel, du port de Dragonoville ou de Chiot-chiotville. Des espions étrangers peuvent également faire partie de l'intrigue. Toutes ces personnes seront présentes à Dragonoville pour le festival de Dragono qui aura lieu dans une semaine. Vous arrivez à Dragonoville. Quelle est la première chose que vous ferez ?")
var request3 = new XMLHttpRequest();
requestURL3 = "game/npcs_positions.json"
request3.open('GET', requestURL3);
request3.responseType = 'json';
request3.send();
request3.onload = function() {
    npcs_positions=request3.response;
    positions_day = npcs_positions["days"][current_day]
    set_popups_using_daily_position(positions_day, current_day)
}

function set_popups_using_daily_position(positions_day, current_day){
    for(location_name in positions_day){
        for(i_marker in listeMarkers){
            var marker = listeMarkers[i_marker];
            if(marker.name==location_name){
                popup = marker.getPopup();
                if(current_position == location_name){
                    print_neighborhoods(location_name, marker, popup)
                }else{
                    if(popup.getContent().includes("div_neighborhood")){
                        popup_content = popup.getContent()
                        popup_content = popup_content.split("<div class='div_neighborhood'")[0]
                        popup.setContent(popup_content)
                    }
                    if(popup.getContent().includes("div_quartier")){
                        popup_content = popup.getContent()
                        popup_content = popup_content.split("<div class='div_quartier'")[0]
                        popup.setContent(popup_content)
                    }
                    if(popup.getContent().includes("div_character")){
                        popup_content = popup.getContent()
                        popup_content = popup_content.split("<div class='div_character'")[0]
                        popup.setContent(popup_content)
                    }
                    if(!(popup.getContent().includes("button_go"))){

                        popup.setContent(
                            popup.getContent()+ "<button class='button_go'>S'y rendre</button>"
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
    travel_time = get_travel_time(current_position, location_name);
    current_day += travel_time;
    current_position = location_name;
    update_time(current_day);
    set_popups_using_daily_position(positions_day, current_day)
    marker.openPopup()

}

function get_travel_time(current_position, location_name){
    return 0.5
}

function print_neighborhoods(location_name, marker, popup){
    flavour_text = positions_day[location_name]["flavour_text"]
    neighborhoods = positions_day[location_name]["neighborhoods"]
    popup_content = popup.getContent()
    if(popup_content.includes("button_go")){
        popup_content = popup_content.split("<button class='button_go'")[0]
        popup.setContent(popup_content)
    }
    if(popup.getContent().includes("div_quartier")){
        popup_content = popup.getContent()
        popup_content = popup_content.split("<div class='div_quartier'")[0]
        popup.setContent(popup_content)
    }
    if(popup.getContent().includes("div_character")){
        popup_content = popup.getContent()
        popup_content = popup_content.split("<div class='div_character'")[0]
        popup.setContent(popup_content)
    }
    popup_content += `<div class='div_neighborhood'>
    <i>${flavour_text}</i>
    <p>Vous pouvez accéder aux quartiers suivants :</p>
    `
    for(neighborhood in neighborhoods){
        popup_content += `<button id=${neighborhood.replaceAll(" ", "_")}>${neighborhood}</button>`
    }
    popup_content += "</div>"
    popup.setContent(popup_content)
    marker.on(
        "popupopen",
        function(e){
            setTimeout(function(){
                for(neighborhood in neighborhoods){
                    document.getElementById(neighborhood.replaceAll(" ", "_")).onclick=function(){show_characters(popup, marker, neighborhoods[neighborhood])}
                }
            },1000)
        }
    )
}

function update_time(current_day){
    positions_day = npcs_positions["days"][Math.floor(current_day)]
    remaining_days = 7 - Math.ceil(current_day);
    remaining_hours = Math.round(Math.ceil(current_day)*24 - current_day*24);
    document.getElementById("remaining_time").innerHTML="Temps restant avant le festival : "+ remaining_days + " jours et "+remaining_hours+" heures";
}

function show_characters(popup, marker, neighborhood){
    console.log(neighborhood);
    current_day+=1/24;
    update_time(current_day);
    popup_content = popup.getContent()
    if(popup.getContent().includes("div_neighborhood")){
        popup_content = popup.getContent()
        popup_content = popup_content.split("<div class='div_neighborhood'")[0]
        popup.setContent(popup_content)
    }
    popup_content += `<div class='div_quartier'>
    <i>${neighborhood["description"]}</i>
    <p>Les personnages suivants sont présents :</p>
    `
    for(character in neighborhood["characters"]){
        popup_content += `<button id=${"char_"+character}>${neighborhood["characters"][character]}</button>`
    }
    popup_content += `<button id="Retour">Retour</button>`
    popup_content += "</div>"
    popup.setContent(popup_content)
    setTimeout(function(){
        for(character in neighborhood["characters"]){
            document.getElementById("char_"+character).onclick=function(){talk_character(neighborhood["characters"][character])}
        }
        document.getElementById("Retour").onclick = function(){
            print_neighborhoods(current_position, marker, popup)
            marker.closePopup();
            marker.openPopup();
        }
    },1000)
    
}

function talk_character(character){
    console.log(character)
}