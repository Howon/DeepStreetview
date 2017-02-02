"use strict";

const getTiles = require("./tiles");
const loader = require("async-image-loader");
const Emitter = require("events").EventEmitter;

const ZERO = [0, 0];

module.exports = (id, opt, modifier) => {
  opt = opt || {};

  const data = getTiles(id, opt.zoom, opt.tiles);

  let canvas = opt.canvas || document.createElement("canvas");
  let context = canvas.getContext("2d");

  const images = data.images;
  const tileWidth = data.tileWidth;
  const tileHeight = data.tileHeight;
  const emitter = new Emitter();

  const start = () => {
    const imageFetcher = (image) => {
      return new Promise(resolve => {
        modifier(image, resolve);
      });
    };

    Promise.all(images.map(image => imageFetcher(image))).then(newImages => {
      emitter.emit("start", data);

      loader(newImages, {
          crossOrigin: opt.crossOrigin
        }, () => {
          emitter.emit("complete", canvas);
        })
        .on("not-found", data => {
          emitter.emit("not-found", data.url);
        })
        .on("progress", e => {
          const tile = e.data;
          const position = tile.position || ZERO;
          const [x, y] = position;
          const width = Math.min(tileWidth, data.width - x, data.width);
          const height = Math.min(tileHeight, data.height - y, data.height);

          let image = e.image;

          if (!image || width !== image.width || height !== image.height) {
            canvas.width = width;
            canvas.height = height;
            context.clearRect(0, 0, width, height);

            if (e.image) {
              context.drawImage(e.image, 0, 0);
            }

            image = canvas;
          }


          emitter.emit("progress", {
            count: e.count,
            total: e.total,
            position: position,
            image: image
          });
        });
    });
  };

  process.nextTick(start);

  return emitter;
};