"use strict";

const THREE = require("three");
const PointerLockControls = require('three-pointerlock');
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

const SPHERE = new THREE.Mesh(
  new THREE.SphereGeometry(1, 84, 84),
  new THREE.MeshBasicMaterial({
    map: TEXTURE,
    side: THREE.DoubleSide
  })
);

SPHERE.scale.x = -1;
SPHERE.rotation.x += 0.03;
SPHERE.rotation.y = Math.PI / 2 - 0.57;

APP.scene.add(SPHERE);
APP.renderer.uploadTexture(TEXTURE);
console.log(APP.controls.rotateLeft);
// APP.controls.r
// APP.rotateLeft = function ( angle ) {
//     if ( angle === undefined ) {
//         angle = getAutoRotationAngle();
//     }
//     console.log(angle);
//     thetaDelta -= angle; // change this to opposite
// };

const CAMERA = APP.camera;
// const CONTROLS = new PointerLockControls(CAMERA);

// APP.scene.add(CONTROLS.getObjec);
const GL = APP.renderer.getContext();
const ZOOM = Math.max(0, Math.min(3, bestZoom(GL.getParameter(GL.MAX_TEXTURE_SIZE))));

// const animate = () => {
//   // CONTROLS.update(1);
//   requestAnimationFrame(animate);
//   render();
// }

// function render() {
//     APP.renderer.render(APP.scene, CAMERA);
// }

// animate();

module.exports = {
  stitch: (view, location, transform) => {
    panoramaLocation(location, {
      source: google.maps.StreetViewSource.DEFAULT,
      preference: google.maps.StreetViewPreference.NEAREST
    }, (err, result) => {
      if (err) {
        throw err;
      }

      let texHeight;

      view.style.height = "6px";

      equirect(result.id, {
        zoom: ZOOM,
        tiles: result.tiles,
        crossOrigin: "Anonymous"
      }, transform).on("start", data => {
        texHeight = data.height;

        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, data.width, data.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
      }).on("progress", e => {
        const x = e.position[0];
        const y = texHeight - e.position[1] - e.image.height;

        GL.texSubImage2D(GL.TEXTURE_2D, 0, x, y, GL.RGBA, GL.UNSIGNED_BYTE, e.image);
      }).on("complete", () => {
        view.style.height = 0;
      });
    });
  },
  invert: (dX, dY) => {
    // const cameraRotation = CAMERA.getWorldQuaternion();
    // const { x, y, z } = cameraRotation;


    // // console.log(CAMERA_X + (CAMERA_X > 0 : x + (x > 0 ? -CAMERA_X : -CAMERA_X), y - CAMERA_Y, z - CAMERA_Z);
    // // console.log(CAMERA_X, CAMERA_Y, CAMERA_Z);

    // console.log(cameraRotation);
    // console.log("");
    // console.log(CAMERA.rotation.conjugate());
    // cameraRotation.set(CAMERA.rotation.conjugate());
  }
}