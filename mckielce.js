let action="";
let map;
let btns;
let markers;
let polyline;

let greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

window.onload = function() {
    polyline=document.querySelector("#poly").checked ? L.polyline([], {
        color: "red"
    }) : L.polygon([], {
        color: "red"
    });
    document.querySelector("#poly").addEventListener("change", (e) => {
        polyline.remove();
        polyline=document.querySelector("#poly").checked ? L.polyline([], {
            color: "red"
        }) : L.polygon([], {
            color: "red"
        });
        polyline.addTo(map);
        refreshPolyline();
    });
    document.querySelector("#results").addEventListener("change", (e) => {
        refreshResult();
    });

    document.querySelector(".copyjson").addEventListener("click",(e) =>{
        exportJSON();
    });

    document.querySelector("#calculate").addEventListener("click", (e) => {
        if(action!="") {
            alert("Wyłącz najpierw narzędzie.");
            return;
        }
        document.querySelector("#output").innerHTML="";
        let latlon = getLatLon({x:document.querySelector("#x").value,y:document.querySelector("#y").value});
        addResult(latlon.lat+" "+latlon.lng);
        markers.clearLayers();
        let marker1 = L.marker(latlon,{
            draggable: false
        });
        markers.addLayer(marker1);
        map.setView(latlon,16)
    });
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
    let kielce19 = L.tileLayer("https://4d.kielce.eu/Data/u_2019/ORTO/{z}/{x}/{y}.jpg", {
        attribution: "Ortofotomapa 2019 &copy; Miasto Kielce",
        "maxZoom": 22,
        detectRetina: true
    }).addTo(map);
    //https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/REST/StandardResolution/tile/11/385/380
    let geoportal = L.tileLayer.wms("https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/StandardResolution?", {
        attribution: "&copy; geoportal.gov.pl",
        "maxZoom": 22,
        layers: 'Raster',
        detectRetina: true
    });
    let osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap Contributors",
        "maxZoom": 22,
        detectRetina: true
    })
    let img = "mckielce04072021.png";
    let bounds = [[50.79056176249292,20.5905944108963],[50.78481679439481,20.62001556158066]];
    let ov = L.imageOverlay(img, bounds, {
        opacity: .6
    });
    let baseMaps = {
        "Kielce 2019": kielce19,
        "Geoportal.gov.pl": geoportal,
        "OpenStreetMap": osm,
    };
    let overlayMaps = {
        "Minecraft 04.07.2021 20:20": ov
    }
    L.control.layers(baseMaps,overlayMaps).addTo(map);
    L.easyBar([btns.addMarker,btns.addLine]).addTo(map);
    markers=L.layerGroup().addTo(map);
    polyline.addTo(map);
    map.on("click", resolveAction);
    console.log(new L.latLng(50.88799,20.65376));
    let one = L.Projection.Mercator.project(new L.latLng(50.88799,20.65376));
    console.log(one);
    console.log(L.Projection.Mercator.unproject(one));
    document.querySelector(".showSidebar").addEventListener("click", function() {
        if(document.querySelector("aside").classList.contains("open")) {
            document.querySelector("aside").classList.remove("open");
        }else{
            document.querySelector("aside").classList.add("open");
        }
    });
    if (findGetParameter("x")!=undefined&&findGetParameter("y")!=undefined) {
        document.querySelector("#x").value=findGetParameter("x");
        document.querySelector("#y").value=findGetParameter("y");
        document.querySelector("#calculate").click();
    }
}

function addResult(text) {
    let container = document.querySelector("#output");
    let result = document.createElement("div");
    result.classList.add("result");
    result.appendChild(document.createTextNode(text));
    let copy = document.createElement("i");
    copy.addEventListener("click", (e)=>{
        navigator.clipboard.writeText(text);
        if(!e.target.classList.contains("copied")) e.target.classList.add("copied");
    })
    copy.classList.add("far");
    copy.classList.add("fa-copy");
    result.appendChild(copy);
    container.appendChild(result);
}

function exportJSON() {
    let base = {
        "version": 1,
        "coords": []
    }
    markers.eachLayer(function(l) {
        let coords = getCoords(l._latlng);
        base.coords.push(coords);
    });
    let json=JSON.stringify(base);
    navigator.clipboard.writeText(btoa(json));
    alert("Skopiowano");
}

function resolveAction(e) {
    switch(action) {
        case "addMarker":
            markers.clearLayers();
            let marker1 = L.marker(e.latlng,{
                draggable: true
            });
            marker1.on("drag", function(e) {
                refreshResult();
            });
            markers.addLayer(marker1);
            btns.addMarker.state("normal");
            action="";
            refreshResult();
            break;
        case "addLine":
            markers.eachLayer(function(l) {
                l.setIcon(new L.Icon.Default());
            })
            console.log(e.latlng);
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
    refreshResult();
    polyline.setLatLngs([]);
    markers.eachLayer(function(l) {
        polyline.addLatLng(l._latlng);
    });
}

function roundDec(num, dec) {
    //return Math.round((num+Number.EPSILON)*Math.pow(10,dec))/Math.pow(10,dec);
    return num.toFixed(dec);
}

function getCoords(pos) {
    //Zanim powiesz coś o następnych 3 linijkach kodu spróbuj zrobić to samemu lepiej, bo męczyłem się 2 godziny, żeby to gówno w ogóle zadziałało i liczyło w miarę dokładnie.
    let p = L.Projection.Mercator.project(pos);
    let x = roundDec((p.x - 2296687)/1.58,1);
    let y = roundDec((6565452 - p.y)/1.58,1);
    return {x: x, y: y}
}

function getLatLon(coords) {
    coords.x = (coords.x*1.58)+2296687
    coords.y = 6565452-(coords.y*1.58);
    let p = L.Projection.Mercator.unproject(coords);
    //let x = roundDec((p.x - 2296687)/1.58,1);
    //let y = roundDec((6565452 - p.y)/1.58,1);
    return p;
}

function refreshResult() {
    //let old = new L.latLng(0,0);
    document.querySelector("#output").innerHTML="";
    markers.eachLayer(function(l) {
        let coords = getCoords(l._latlng);
        /* niech to tu zostanie na pamiątkę
        let kurwa=old.distanceTo(l._latlng)
        console.log("KURWA",kurwa);
        let ಠ_ಠ1=Math.abs(getCoords(old).x-getCoords(l._latlng).x)
        let ಠ_ಠ2=Math.abs(getCoords(old).y-getCoords(l._latlng).y);
        console.log("MAĆ",ಠ_ಠ1,ಠ_ಠ2)
        let ಠvಠ1=ಠ_ಠ1/kurwa;
        let ಠvಠ2=ಠ_ಠ2/kurwa;
        console.log("CHUUUUJ", ಠvಠ1,ಠvಠ2)
        old=l._latlng;
        */
        
        addResult(document.querySelector("#results").checked ? "x: "+coords.x+" y: "+coords.y : "/tp "+coords.x+" 60 "+coords.y );
    });
}