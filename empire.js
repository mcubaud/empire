///affichage de la carte
mymap = L.map('mapid').setView([0,0], 2);
mymap.setMinZoom(2);

Icone = L.Icon.extend({
    options: {
        shadowUrl: '',
        iconSize:     [42, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76]
    }
});

//group contient tous les marqueurs, avec un marqueur par unité.
group=L.featureGroup().addTo(mymap);

/*
var imageUrl = 'test.jpg',
    imageBounds = [[45.847,4.788], mymap.unproject([mymap.project([45.847,4.788]).x+2338,mymap.project([45.847,4.788]).y-1699])];
L.imageOverlay(imageUrl, imageBounds).addTo(mymap);
*/

function preloadImage(url)
{
    var img=new Image();
    img.src=url;
}


var listeCartes=[];
var requestURL = 'cartes.json';
var request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';
request.send();
request.onload = function() {
    listeCartes=request.response;
    console.log(request)
    listeCartes.forEach(function(objet){
        preloadImage(objet.nom)
    })
    mettre_a_jour_carte();
}


var listeMarkers=[];
var requestURL2 = 'label.json';
var request2 = new XMLHttpRequest();
request2.open('GET', requestURL2);
request2.responseType = 'json';
request2.send();
request2.onload = function() {
    var labels=request2.response;
    labels.forEach(function(label){
        var marker=L.marker([label.lat,label.long],{icon:L.divIcon({className: label.class ,html:"<h3>"+label.titre+"</h3>"})})
        marker.name = label.titre;
        marker.zoom_min=label.zoom_min;
        marker.zoom_max=label.zoom_max;
        if(label.descr){
            marker.bindPopup(label.descr);
        }

        listeMarkers.push(marker);
    });
    mettre_a_jour_carte();
}





function mettre_a_jour_carte(){
    //Affiche uniquement les objets presents pour lesquels le zoom minimum est inférieur au zoom de la carte
   group.clearLayers();
    listeCartes.forEach(function(objet){
        if(mymap._zoom>objet.zoom){
            L.imageOverlay(objet.nom, objet.imageBounds).addTo(group);
        }
    })
    listeMarkers.forEach(function(marker){
        if(marker.zoom_max>=mymap._zoom && mymap._zoom>=marker.zoom_min){
            marker.addTo(group);
        }
    })
}
mymap.addEventListener("zoomend",function(e){
    //Met à jour la carte en cas de zoom.
    mettre_a_jour_carte();
});

function onMapClick(e) {
    var popup = L.popup();
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}
mymap.on('click', onMapClick);

mettre_a_jour_carte();
