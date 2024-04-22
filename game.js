mymap.flyTo({"lat":14.203151, "lng":-54.283447},10)
current_day = 0
current_position = "Dragonoville"

alert("You are sent by the Emperor to the city of Dragonoville to secretly investigate on a possible plot against the Empire.\nEveryone is suspect: conspirators may be the lord of the Barbares, or the High-Priest of Dragono, or the Grand Master of the guilds of Merchants, of Craftmens or of Warriors. It may also be the lord of another city in Dragonoland, such as the warlike lord of Alaris, or the lords of Pontcastel, Dragonoville's port or Chiot-chiotville. Foreign spies may also be part of the plot. All these people will be in Dragonoville for the festival of Dragono that takes place in a week. You arrive in Dragonoville. What is the first thing you are doing?")
var request3 = new XMLHttpRequest();
requestURL3 = "game/npcs_positions.json"
request3.open('GET', requestURL3);
request3.responseType = 'json';
request3.send();
request3.onload = function() {
    var npcs_positions=request3.response;
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
                    if(!(popup.getContent().includes("button_go"))){

                        popup.setContent(
                            popup.getContent()+ "<button class='button_go'>S'y rendre</button>"
                        )
                        marker.on(
                            "popupopen",
                            function(e){
                                setTimeout(function(){
                            	    document.getElementsByClassName("button_go")[0].onclick=function(){go_location(location_name, e.target)}
                                },1000)
                            }
                        )
                    }
                }
                
            }
        }
    }
}

function go_location(location_name, marker){
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
    popup_content += `<div  class='div_neighborhood'>
    <i>${flavour_text}</i>
    <p>Vous pouvez accéder aux quartiers suivants :</p>
    `
    for(neighborhood in neighborhoods){
        popup_content += `<button onclick=show_characters(neighborhoods[neighborhood])>${neighborhood}</button>`
    }
    popup_content += "</div>"
    popup.setContent(popup_content)
}

function update_time(current_day){
    positions_day = npcs_positions["days"][Math.floor(current_day)]
    remaining_days = 7 - Math.floor(current_day);
    remaining_hours = 24 - (current_day*24)%24;
    document.getElementById("remaining_time").innerHtml="Temps restant avant le festival : "+ remaining_days + " jours et "+remaining_hours+" heures";
}

function show_characters(neighborhood){
    console.log(neighborhood)
}
