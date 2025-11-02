/*
    Pixelit - 
    Create pixel art from an image
    https://github.com/giventofly/pixelit
    
    Version: 1.2.1
    MIT License
    (c) 2021 - 2022 - giventofly
*/
class pixelit {
  constructor(config = {}) {
    //all default values
    this.config = {
      to: config.to || document.getElementById("pixelitcanvas"),
      from: config.from || document.getElementById("pixelitimg"),
      scale: config.scale || 0,
      palette: config.palette || [
        [0, 0, 0],
        [255, 255, 255],
      ],
      maxHeight: config.maxHeight || null,
      maxWidth: config.maxWidth || null,
      blockSize: config.blockSize || 5,
      draw: config.draw || true,
      save: config.save || true,
    };
    this.endColorStats = {};
    if (this.config.draw) {
      this.draw().save();
    }
  }

  //neue draw function
  draw() {
    this.from = this.config.from;
    this.to = this.config.to;
    this.to.width = this.from.width;
    this.to.height = this.from.height;
    //resize based on max width or max height
    if (this.config.maxHeight) {
      this.to.height =
        this.from.naturalHeight > this.config.maxHeight
          ? this.config.maxHeight
          : this.from.naturalHeight;
      this.to.width = parseInt(
        (this.to.height / this.from.naturalHeight) * this.from.naturalWidth
      );
    }

    if (this.config.maxWidth) {
      this.to.width =
        this.from.naturalWidth > this.config.maxWidth
          ? this.config.maxWidth
          : this.from.naturalWidth;
      this.to.height = parseInt(
        (this.to.width / this.from.naturalWidth) * this.from.naturalHeight
      );
    }
    //get image data
    this.to
      .getContext("2d")
      .drawImage(this.from, 0, 0, this.to.width, this.to.height);
    this.original = this.to
      .getContext("2d")
      .getImageData(0, 0, this.to.width, this.to.height);
    this.originalData = this.original.data;
    //set request animation frame
    //window.requestAnimationFrame(this.pixelate.bind(this));
    return this;
  }

  pixelate(blockSize = this.config.blockSize) {
    //check if image is loaded
    if(this.originalData.length == 0){
      this.draw();
      return this;
    }
    this.config.blockSize = blockSize;
    let data = this.originalData;
    let width = this.to.width;
    let height = this.to.height;
    let ctx = this.to.getContext("2d");
    let res = this.config.blockSize;
    let cols = width / res;
    let rows = height / res;
    //change rect size to a blocky one
    //this.to.width = cols * res;
    //this.to.height = rows * res;
    ctx.clearRect(0, 0, width, height);
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        var x = (j * res + (j * res + res)) / 2;
        var y = (i * res + (i * res + res)) / 2;
        var p = (Math.floor(y) * width + Math.floor(x)) * 4;
        var alpha = data[p + 3] / 255;
        //if alpha is 0, skip pixel
        if (alpha == 0) {
          continue;
        }

        ctx.fillStyle = `rgba(
                ${[data[p], data[p + 1], data[p + 2]].join(",")},
                ${alpha}
                )`;

        //draw the pixel
        ctx.fillRect(j * res, i * res, res, res);
      }
    }
    return this;
  }

  //convert to palette
  palette(palette = this.config.palette) {
    this.config.palette = palette;
    let data = this.originalData;
    let width = this.to.width;
    let height = this.to.height;
    let ctx = this.to.getContext("2d");
    let res = this.config.blockSize;
    let cols = width / res;
    let rows = height / res;

    //change rect size to a blocky one
    //this.to.width = cols * res;
    //this.to.height = rows * res;
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        var x = (j * res + (j * res + res)) / 2;
        var y = (i * res + (i * res + res)) / 2;

        var p = (Math.floor(y) * width + Math.floor(x)) * 4;
        //if alpha is 0, skip pixel
        if (data[p + 3] == 0) {
          continue;
        }
        var color = this.findClosestColor(
          [data[p], data[p + 1], data[p + 2]],
          palette
        );

        ctx.fillStyle = "rgb(" + color.join(",") + ")";
        ctx.fillRect(j * res, i * res, res, res);
      }
    }
    return this;
  }

  //find closest color from palette
  findClosestColor(color, palette) {
    let closest = 255 * 3;
    let c = 0;
    for (let i = 0; i < palette.length; i++) {
      let diff =
        Math.abs(color[0] - palette[i][0]) +
        Math.abs(color[1] - palette[i][1]) +
        Math.abs(color[2] - palette[i][2]);
      if (diff < closest) {
        closest = diff;
        c = i;
      }
    }
    return palette[c];
  }

  //color similarity
  colorSimilarity(color1, color2) {
    let r = Math.pow(color1[0] - color2[0], 2);
    let g = Math.pow(color1[1] - color2[1], 2);
    let b = Math.pow(color1[2] - color2[2], 2);
    return Math.sqrt(r + g + b);
  }

  //convert image to greyscale
  greyscale() {
    let data = this.originalData;
    let width = this.to.width;
    let height = this.to.height;
    let ctx = this.to.getContext("2d");
    let res = this.config.blockSize;
    let cols = width / res;
    let rows = height / res;
    //change rect size to a blocky one
    //this.to.width = cols * res;
    //this.to.height = rows * res;
    ctx.clearRect(0, 0, width, height);
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        var x = (j * res + (j * res + res)) / 2;
        var y = (i * res + (i * res + res)) / 2;

        var p = (Math.floor(y) * width + Math.floor(x)) * 4;
        //if alpha is 0, skip pixel
        if (data[p + 3] == 0) {
          continue;
        }
        var g = Math.round(
          data[p] * 0.2126 + data[p + 1] * 0.7152 + data[p + 2] * 0.0722
        );
        ctx.fillStyle = "rgb(" + [g, g, g].join(",") + ")";
        ctx.fillRect(j * res, i * res, res, res);
      }
    }
    return this;
  }

  //save canvas image
  save() {
    if (this.config.save) {
      this.to.toBlob(
        (blob) => {
          let url = URL.createObjectURL(blob);
          this.config.to.setAttribute("data-url", url);
        },
        "image/png",
        1
      );
    }
    return this;
  }

  //scale image
  scale(s = this.config.scale) {
    this.config.scale = s;
    if (s == 0 || s == 100) {
      return this;
    }
    //s from 0 to 100
    s = (100 - s) * 0.01;

    let data = this.originalData;
    let width = this.to.width;
    let height = this.to.height;
    let ctx = this.to.getContext("2d");
    let res = this.config.blockSize;
    let cols = width / res;
    let rows = height / res;
    //change rect size to a blocky one
    //this.to.width = cols * res;
    //this.to.height = rows * res;
    ctx.clearRect(0, 0, width, height);
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        var x = (j * res + (j * res + res)) / 2;
        var y = (i * res + (i * res + res)) / 2;
        var p = (Math.floor(y) * width + Math.floor(x)) * 4;
        //if alpha is 0, skip pixel
        if (data[p + 3] == 0) {
          continue;
        }
        var color = [data[p], data[p + 1], data[p + 2]];
        ctx.fillStyle = "rgb(" + color.join(",") + ")";
        //draw the pixel
        ctx.fillRect(j * res + res * s, i * res + res * s, res - res * s * 2, res - res * s * 2);
      }
    }
    return this;
  }
}
//for nodejs
try {
  module.exports = pixelit;
} catch (e) {}
