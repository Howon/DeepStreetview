"use strict";

const { stitch: viewLoader, invert: invertCamera } = require("./view");
const HEADING = 90;
const PITCH = 0;

const latLonGen = (lat, lon) => {
  return {
    position: {
      lat: lat,
      lng: lon
    },
    pov: {
      heading: HEADING,
      pitch: PITCH
    },
    zoom: 0.9
  };
};

(() => {
  // const socket = io();

  const [glat, glon] = [40.8058134, -73.962682];
  const view = document.getElementById("view");
  const controller = document.getElementById("control");

  // // navigator.geolocation.getCurrentPosition(pos => {
  viewLoader(view, [glat, glon], (image, cb) => cb(image));
  // // // });

  const p = new google.maps.StreetViewPanorama(controller, latLonGen(glat, glon)); //latLonGen(pos.coords.latitude, pos.coords.longitude));

  const bodyObserver = new MutationObserver((mutations, observer) => {
    mutations.forEach(mutation => {
      const canvases = document.getElementsByTagName("canvas");

      if (canvases.length === 2) {
        const [canvasA, canvasB] = canvases;

        const parent = canvasA.parentElement;

        const gMapsArea = document.querySelector("#control div").getElementsByTagName("div")[0];
        const overLay = document.getElementById("control").firstChild.firstChild.firstChild;
        const len = overLay.childNodes.length;

        parent.style = {};

        canvasB.style.top = "0";
        canvasB.style.position = "absolute";
        canvasB.setAttribute("id", canvasA.id);

        parent.removeChild(canvasA);
        parent.appendChild(canvasB);

        overLay.removeChild(overLay.childNodes[len - 1]);
        overLay.appendChild(parent);

        [controller, gMapsArea].concat(Array.from(gMapsArea.getElementsByTagName("div")))
          .forEach(x => x.style.backgroundColor = "transparent");

        observer.disconnect();
      }
    });
  });

  bodyObserver.observe(document.body, {
    childList: true
  });

  p.addListener("pano_changed", () => {
    viewLoader(view, [p.position.lat(), p.position.lng()], (image, cb) => cb(image));
  });

  p.addListener("pov_changed", () => {
    // console.log(p.getPov())
    invertCamera(0, 3);
  });
})();