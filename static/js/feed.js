"use strict";

const viewLoader = require("./view");

const latLonGen = (lat, lon) => {
  return {
    position: {
      lat: lat,
      lng: lon
    },
    pov: {
      heading: 90,
      pitch: 0
    },
    zoom: 1.5
  };
};

(() => {
  const socket = io();

  const [glat, glon] = [40.8058134, -73.962682];
  const view = document.getElementById("view");
  const controller = document.getElementById("control");

  // navigator.geolocation.getCurrentPosition(pos => {
  viewLoader(view, [glat, glon], (image, cb) => cb(image));
  // // });

  const p = new google.maps.StreetViewPanorama(controller, latLonGen(glat, glon)); //latLonGen(pos.coords.latitude, pos.coords.longitude));

  const bodyObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      const canvases = document.getElementsByTagName("canvas");

      if (canvases.length === 2) {
        // console.log(canvases)
        Array.from(canvases).forEach(canvas => {
          if (canvas.parentElement.tagName === "DIV") {
            canvas.style.display = "none";
          } else {
            canvas.style.top = "0";
            canvas.style.position = "absolute";
          }
        });

        const gMapsArea = document.querySelector("#control div").getElementsByTagName("div")[0];

        [controller, gMapsArea].concat(Array.from(gMapsArea.getElementsByTagName("div")))
          .forEach(x => x.style.backgroundColor = "transparent");

        console.log(document.getElementsByTagName("svg"));
      }
    });
  });

  const bodyObserveConf = {
    childList: true
  };

  bodyObserver.observe(document.body, bodyObserveConf);

  p.addListener("pano_changed", () => {
    console.log(p);
    viewLoader(view, [p.position.lat(), p.position.lng()]);
  });
})();