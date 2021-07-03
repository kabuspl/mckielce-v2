window.onload = function() {
    let map = L.map("map").setView([50.87161, 20.63157], 13);
    L.tileLayer("https://4d.kielce.eu/Data/u_2019/ORTO/{z}/{x}/{y}.jpg", {
        attribution: "Ortofotomapa 2019 &copy; Miasto Kielce",
        "maxZoom": 20,
    }).addTo(map);
    let poly = L.polygon([
        [50.88799,20.65376],
        [50.88799,20.65389],
        [50.88790,20.65389],
        [50.88790,20.65376]
    ]).addTo(map);
    console.log(new L.latLng(50.88799,20.65376));
    let one = L.Projection.Mercator.project(new L.latLng(50.88799,20.65376));
    console.log(one);
    console.log(L.Projection.Mercator.unproject(one));
}