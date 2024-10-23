mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map", // container ID
  center: [75.34, 19.84], // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 7, // starting zoom
});
