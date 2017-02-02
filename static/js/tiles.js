"use strict";

const pTile = require("google-panorama-tiles");
const pUrl = require("google-panorama-url");

module.exports = (id, zoom, tiles) => {
  if (!id) {
    throw new Error("must specify panorama ID");
  }

  zoom = (typeof zoom === "number" ? zoom : 1) | 0;

  if (zoom < 0 || zoom > 5) {
    throw new Error("zoom is out of range, must be between 0 - 5 (inclusive)");
  }

  const data = pTile(zoom, tiles);

  const images = [...Array(data.columns).keys()].map(x => {
    return [...Array(data.rows).keys()].map(y => {
      return {
        "url": pUrl(id, { "x": x, "y": y, zoom: zoom }),
        "position": [x * data.tileWidth, y * data.tileHeight]
      };
    });
  }).reduce((x, y) => x.concat(y));

  data.images = images;

  return data;
};