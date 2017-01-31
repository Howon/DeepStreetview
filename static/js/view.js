"use strict";

const THREE = require("three");
const equirect = require("./equirect.js");
const panoramaLocation = require("google-panorama-by-location");
const bestZoom = require("google-panorama-zoom-level");

const APP = require("three-orbit-viewer")(THREE)({
  clearColor: 0xffffff,
  clearAlpha: 1.0,
  fov: 70,
  position: new THREE.Vector3(0, 0, -0.1)
});

const TEXTURE = new THREE.DataTexture(null, 1, 1, THREE.RGBAFormat);

TEXTURE.minFilter = THREE.LinearFilter;
TEXTURE.magFilter = THREE.LinearFilter;
TEXTURE.generateMipmaps = false;

const SPHERE = new THREE.Mesh(new THREE.SphereGeometry(1, 84, 84), new THREE.MeshBasicMaterial({
  map: TEXTURE,
  side: THREE.DoubleSide
}));

SPHERE.scale.x = -1;
SPHERE.rotation.y = Math.PI / 2 - 0.5;

APP.scene.add(SPHERE);
APP.renderer.uploadTexture(TEXTURE);

const GL = APP.renderer.getContext();
const ZOOM = Math.max(0, Math.min(3, bestZoom(GL.getParameter(GL.MAX_TEXTURE_SIZE))));

module.exports = (view, location, modifier) => {
  panoramaLocation(location, {
    source: google.maps.StreetViewSource.DEFAULT,
    preference: google.maps.StreetViewPreference.NEAREST
  }, (err, result) => {
    if (err)
      throw err;

    let texHeight;

    view.style.height = "6px";

    equirect(result.id, {
      zoom: ZOOM,
      tiles: result.tiles,
      crossOrigin: "Anonymous"
    }, modifier).on("start", data => {
      texHeight = data.height;

      GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, data.width, data.height,
        0, GL.RGBA, GL.UNSIGNED_BYTE, null);
    }).on("progress", e => {
      const x = e.position[0];
      const y = texHeight - e.position[1] - e.image.height;

      GL.texSubImage2D(GL.TEXTURE_2D, 0, x, y, GL.RGBA, GL.UNSIGNED_BYTE, e.image);
    }).on("complete", () => {
      view.style.height = 0;
    });
  });
};