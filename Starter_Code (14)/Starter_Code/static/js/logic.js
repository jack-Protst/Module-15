const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch data and create the map
fetchEarthquakeData(url);

function fetchEarthquakeData(dataUrl) {
    d3.json(dataUrl).then(createMap);
}

function createMap(earthquakeData) {
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const map = L.map("map", {
        center: [37.7749, -122.4194],
        zoom: 5.5,
        layers: [streetLayer]
    });

    L.geoJSON(earthquakeData, {
        pointToLayer: (feature, latlng) => createCircleMarker(feature, latlng)
    }).addTo(map);

    addLegendToMap(map);
}

function createCircleMarker(feature, latlng) {
    const { mag, place } = feature.properties;
    const depth = feature.geometry.coordinates[2];
    const circleOptions = {
        radius: mag * 4,
        fillColor: getColorForDepth(depth),
        color: "white",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5
    };
    const circleMarker = L.circleMarker(latlng, circleOptions);

    circleMarker.bindTooltip('Click here for more Info')
                .on('click', () => {
                    circleMarker.bindPopup(`Magnitude: ${mag} <br> Depth: ${depth} <br> Location: ${place}`).openPopup();
                });

    return circleMarker;
}

function getColorForDepth(depth) {
    const colors = ["#006400", "#66FF33", "#CCFF66", "#FFCC66", "#FF9966", "#FF3300"];
    const thresholds = [-10, 10, 30, 50, 70, 90];
    return colors[thresholds.findIndex(threshold => depth > threshold)];
}

function addLegendToMap(map) {
  const legend = L.control({ position: 'topleft' }); // Changed position to 'topleft'

  legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [-10, 10, 30, 50, 70, 90];
      const colors = ["#006400", "#66FF33", "#CCFF66", "#FFCC66", "#FF9966", "#FF3300"];

      div.innerHTML += '<h4>Depth</h4>';
      grades.forEach((grade, index) => {
          div.innerHTML += `<i style='background: ${colors[index]}'>___</i> ${grade}${grades[index + 1] ? '&ndash;' + grades[index + 1] + '<br>' : '+'}`;
      });

      return div;
  };

  legend.addTo(map);
}
