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
  const socket = io();
  // const tfSocket = io('jibben');

  const [glat, glon] = [40.8058134, -73.962682];
  const view = document.getElementById("view");
  const controller = document.getElementById("control");
  const searchDom = document.getElementById('map');

  // // navigator.geolocation.getCurrentPosition(pos => {
  viewLoader(view, [glat, glon], (image, cb) => {
  //   socket.emit("", image)

  //   // tfSocket.on("transformed", )
    cb(image)
  });
  // // // });
  var map = new google.maps.Map(searchDom, {
    center: {
      lat: glat,
      lng: glon
    },
    zoom: 13,
    disablePanMomentum: true
  });

  const inputDom = document.getElementById('pac-input');
  const searchArea = new google.maps.places.SearchBox(inputDom);

  const p = new google.maps.StreetViewPanorama(controller, latLonGen(glat, glon)); //latLonGen(pos.coords.latitude, pos.coords.longitude));

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputDom);

  searchArea.addListener('places_changed', function() {

    const places = searchArea.getPlaces();
    if (places.length == 0) {
      return;
    }

    const newLat = places[0].geometry.location.lat();
    const newLong = places[0].geometry.location.lng();

    viewLoader(view, [newLat, newLong], (image, cb) => cb(image));
  });

  const removeUnnecessaryDoms = new MutationObserver((mutations, observer) => {
    mutations.forEach(mutation => {
      const mapDivs = document.querySelector("#map div");

      if (mapDivs){
        const mapDom = mapDivs.firstChild;

        searchDom.firstChild.style.backgroundColor = "transparent";

        if (mapDom && mapDom.childNodes.length === 11) {
          Array.from(mapDom.childNodes).filter(node => node.nodeName === "DIV").forEach(node => {
            node.parentNode.removeChild(node);
          })

          inputDom.parentNode.removeChild(inputDom);
          document.body.appendChild(inputDom);
          inputDom.style.zIndex = 500;

          document.body.removeChild(searchDom);
        }
      }

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

  // p.addListener("pano_changed", () => {
  //   viewLoader(view, [p.position.lat(), p.position.lng()], (image, cb) => cb(image));
  // });

  // p.addListener("pov_changed", () => {
  //   // console.log(p.getPov())
  // });
})();