"use strict";

const viewLoader = require("./view");
const HEADING = 90;
const PITCH = 0;

const latLonGen = (lat, lon) => {
  return {
    disablePanMomentum: true,
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
  const searchDom = document.getElementById('map');
  const controller = document.getElementById("control");

  // // navigator.geolocation.getCurrentPosition(pos => {
  viewLoader(view, [glat, glon], (image, cb) => cb(image));
  // // // });
  // var map = new google.maps.Map(searchDom, {
  //   center: {
  //     lat: glat,
  //     lng: glon
  //   },
  //   zoom: 13,
  //   disablePanMomentum: true
  // });

//   const inputDom = document.getElementById('pac-input');
//   const searchArea = new google.maps.places.SearchBox(inputDom);

//   map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputDom);

//   searchArea.addListener('places_changed', function() {

//     const places = searchArea.getPlaces();
// console.log(places)
//     if (places.length == 0) {
//       return;
//     }

//     // For each place, get the icon, name and location.
//     const bounds = new google.maps.LatLngBounds();
//     places.forEach(function(place) {
//       if (!place.geometry) {
//         console.log("Returned place contains no geometry");
//         return;
//       }

//       if (place.geometry.viewport) {
//         // Only geocodes have viewport.
//         bounds.union(place.geometry.viewport);
//       } else {
//         bounds.extend(place.geometry.location);
//       }
//     });

//     map.fitBounds(bounds);
//   });

  const p = new google.maps.StreetViewPanorama(controller, latLonGen(glat, glon)); //latLonGen(pos.coords.latitude, pos.coords.longitude));

  const removeUnnecessaryDoms = new MutationObserver((mutations, observer) => {
    mutations.forEach(mutation => {
      // const mapDivs = document.querySelector("#map div");

      // if (mapDivs){
      //   const mapDom = mapDivs.firstChild;

      //   searchDom.firstChild.style.backgroundColor = "transparent"

      //   if (mapDom && mapDom.childNodes.length === 11) {
      //     Array.from(mapDom.childNodes).filter(node => node.nodeName === "DIV").forEach(node => {
      //       node.parentNode.removeChild(node);
      //     })

      //     inputDom.parentNode.removeChild(inputDom);
      //     controller.appendChild(inputDom);
      //     inputDom.style.zIndex = 500;

      //     document.body.removeChild(searchDom)
      //   }
      // }

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

  removeUnnecessaryDoms.observe(document.body, {
    childList: true
  });

  p.addListener("pano_changed", () => {
    viewLoader(view, [p.position.lat(), p.position.lng()], (image, cb) => cb(image));
  });

  p.addListener("pov_changed", () => {
    console.log(p.getPov())
  });
})();