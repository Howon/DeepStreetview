const [glat, glon] = [40.8058134, -73.962682];


const latLonGen = (lat, lon) => {
  return {
    position: {
      lat: lat,
      lng: lon
    },
    pov: {
      heading: 270,
      pitch: 0
    },
    zoom: 1
  }
};

(() => {
      let canvas;
      const socket = io();
  // if (navigator.geolocation) {
  //   navigator.geolocation.getCurrentPosition(pos => {
      const panorama = new google.maps.StreetViewPanorama(
        document.getElementById('street-view'), latLonGen(glat, glon));//latLonGen(pos.coords.latitude, pos.coords.longitude));

      const restyleCanvas = (img) => {
        socket.emit("req_style_transfer", img);

        // socket.on('imageStylized', newImg => {
        //   $("#img").attr("src","data:image/png;base64," + b64(newImg.buffer));
        // });
      }

      panorama.addListener('pano_changed', function() {
        canvas = document.getElementsByTagName("canvas")[0];
        canvas.img
        restyleCanvas(canvas.toDataURL());
      });

      // panorama.addListener('links_changed', function() {
      //   console.log('2')
      //   restyleCanvas(canvas.toDataURL("image/jpeg", 0.5));
      // });

      // panorama.addListener('position_changed', function() {
      //   console.log('3')

      // });

      // panorama.addListener('pov_changed', function() {

      // });
    // });
  // }
})()