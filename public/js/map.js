mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map", // container ID
  center: [55.297557, 25.25809], // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 8, // starting zoom
});
