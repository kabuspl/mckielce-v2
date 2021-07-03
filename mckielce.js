let action="";
let map;
let btns;
let markers;
let polyline=L.polygon([], {
    color: "red"
})

let greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

window.onload = function() {
    btns = {
        addMarker: L.easyButton({
            states: [
                {
                    stateName: "normal",
                    icon: "fa-map-marker-alt",
                    title: "Konwertuj pozycję punktu",
                    onClick: function(btn, map) {
                        btn.state("cancel");
                        markers.clearLayers();
                        action="addMarker";
                    }
                },
                {
                    stateName: "cancel",
                    icon: "fa-times",
                    title: "Anuluj dodawanie punktu",
                    onClick: function(btn, map) {
                        btn.state("normal");
                        action="";
                    }
                }
            ]
        }),
        addLine: L.easyButton({
            states: [
                {
                    stateName: "normal",
                    icon: "fa-draw-polygon",
                    title: "Konwertuj linię",
                    onClick: function(btn, map) {
                        btn.state("cancel");
                        markers.clearLayers();
                        action="addLine";
                        refreshPolyline();
                    }
                },
                {
                    stateName: "cancel",
                    icon: "fa-times",
                    title: "Anuluj tworzenie linii",
                    onClick: function(btn, map) {
                        btn.state("normal");
                        action="";
                    }
                }
            ]
        })
    };
    map = L.map("map").setView([50.87161, 20.63157], 13);
    L.tileLayer("https://4d.kielce.eu/Data/u_2019/ORTO/{z}/{x}/{y}.jpg", {
        attribution: "Ortofotomapa 2019 &copy; Miasto Kielce",
        "maxZoom": 22,
    }).addTo(map);
    L.easyBar([btns.addMarker,btns.addLine]).addTo(map);
    markers=L.layerGroup().addTo(map);
    polyline.addTo(map);
    map.on("click", resolveAction);
    console.log(new L.latLng(50.88799,20.65376));
    let one = L.Projection.Mercator.project(new L.latLng(50.88799,20.65376));
    console.log(one);
    console.log(L.Projection.Mercator.unproject(one));
}

function resolveAction(e) {
    switch(action) {
        case "addMarker":
            markers.clearLayers();
            markers.addLayer(L.marker(e.latlng,{
                draggable: true
            }));
            btns.addMarker.state("normal");
            action="";
            break;
        case "addLine":
            markers.eachLayer(function(l) {
                l.setIcon(new L.Icon.Default());
            })
            let marker=L.marker(e.latlng,{
                draggable: true,
                icon: greenIcon,
                contextmenu: true,
                contextmenuItems: [
                    {
                        text: "Usuń punkt",
                        callback: function(e) {
                            console.log(e);
                            e.relatedTarget.removeFrom(markers);
                            refreshPolyline();
                        },
                        index: 0
                    }
                ]
            });
            marker.on("drag", function(e) {
                refreshPolyline();
            });
            markers.addLayer(marker);
            refreshPolyline();
            break;
    }
}

function refreshPolyline() {
    polyline.setLatLngs([]);
    markers.eachLayer(function(l) {
        polyline.addLatLng(l._latlng);
    });
}