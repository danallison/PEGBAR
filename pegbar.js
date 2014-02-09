// Generated by CoffeeScript 1.6.3
(function() {
  var PEGBAR,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  PEGBAR = window.PEGBAR || (window.PEGBAR = {});

  PEGBAR.BACKGROUND_COLOR = {
    r: 255,
    g: 255,
    b: 255,
    a: 0.1,
    toString: function() {
      return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
    },
    getImgDataFriendlyRGBA: function() {
      return [this.r, this.g, this.b, this.a * 255 | 0];
    }
  };

  PEGBAR.CANVAS_WIDTH = 400;

  PEGBAR.CANVAS_HEIGHT = 300;

  PEGBAR.init = function() {
    this.paperStack = new this.PaperStack;
    this.controls = new this.Controls;
    this.DomWrangler.centerCanvas();
    return this.DomWrangler.putControlsToTheRightOfTheCanvas();
  };

  PEGBAR.save = function() {
    var saveData;
    saveData = {
      bckgrnd: this.BACKGROUND_COLOR.toString(),
      width: this.CANVAS_WIDTH,
      height: this.CANVAS_HEIGHT
    };
    saveData.frms = this.frms.getSaveData();
    return JSON.stringify(saveData);
  };

  PEGBAR.open = function(saveData) {
    var BC, a, b, bckgrnd, frms, g, height, r, width, _ref, _ref1;
    _ref = JSON.parse(saveData), bckgrnd = _ref.bckgrnd, width = _ref.width, height = _ref.height, frms = _ref.frms;
    BC = this.BACKGROUND_COLOR;
    _ref1 = bckgrnd.replace(/rgba\(|\)/g, '').split(', '), r = _ref1[0], g = _ref1[1], b = _ref1[2], a = _ref1[3];
    BC.r = +r;
    BC.g = +g;
    BC.b = +b;
    BC.a = +a;
    this.CANVAS_WIDTH = width;
    this.CANVAS_HEIGHT = height;
    this.frms.loadFromSaveData(frms);
    return this.drawingCanvas.putImageData();
  };

  PEGBAR.exportGif = function() {
    var frm, gif, stack, _i, _len;
    gif = new GIF({
      workers: 2,
      quality: 10,
      background: "#fff"
    });
    stack = this.paperStack.getStack();
    for (_i = 0, _len = stack.length; _i < _len; _i++) {
      frm = stack[_i];
      gif.addFrame(frm.getImageData(), {
        copy: true,
        delay: 83
      });
    }
    gif.on('finished', function(blob) {
      return window.open(URL.createObjectURL(blob));
    });
    return gif.render();
  };

  PEGBAR = window.PEGBAR || (window.PEGBAR = {});

  PEGBAR.Controls = (function() {
    var el;

    el = function(id) {
      return document.getElementById(id);
    };

    function Controls() {
      var paperStack;
      this.nextButton = el("next");
      this.prevButton = el("prev");
      this.newButton = el("new");
      this.playButton = el("play");
      this.exportButton = el("export");
      paperStack = PEGBAR.paperStack;
      this.nextButton.addEventListener("click", function() {
        paperStack.nextFrame();
        return paperStack.reconstruct();
      });
      this.prevButton.addEventListener("click", function() {
        paperStack.prevFrame();
        return paperStack.reconstruct();
      });
      this.newButton.addEventListener("click", function() {
        paperStack.newFrame();
        return paperStack.reconstruct();
      });
      this.playButton.addEventListener("click", function() {
        return paperStack.play();
      });
      this.exportButton.addEventListener("click", function() {
        return PEGBAR.exportGif();
      });
    }

    return Controls;

  })();

  PEGBAR = window.PEGBAR || (window.PEGBAR = {});

  PEGBAR.DomWrangler = (function() {
    function DomWrangler() {}

    DomWrangler.centerCanvas = function() {
      var canvasContainer, doc;
      doc = window.document;
      canvasContainer = doc.getElementById("canvas-container");
      canvasContainer.style.top = "" + (window.innerHeight / 2 - PEGBAR.CANVAS_HEIGHT / 2) + "px";
      return canvasContainer.style.left = "" + (window.innerWidth / 2 - PEGBAR.CANVAS_WIDTH / 2) + "px";
    };

    DomWrangler.putControlsToTheRightOfTheCanvas = function() {
      var controlsContainer, doc;
      doc = window.document;
      controlsContainer = doc.getElementById("controls-container");
      controlsContainer.style.top = "" + (window.innerHeight / 2 - PEGBAR.CANVAS_HEIGHT / 2) + "px";
      return controlsContainer.style.left = "" + (window.innerWidth / 2 + PEGBAR.CANVAS_WIDTH / 2 + 10) + "px";
    };

    DomWrangler.addEventListenersToControls = function() {};

    return DomWrangler;

  })();

  PEGBAR = window.PEGBAR || (window.PEGBAR = {});

  PEGBAR.DrawingCanvas = (function() {
    var canvasContainer;

    canvasContainer = null;

    function DrawingCanvas() {
      this.mouseup = __bind(this.mouseup, this);
      this.mousemove = __bind(this.mousemove, this);
      this.mousedown = __bind(this.mousedown, this);
      var canvas, ctx, evnt, _i, _len, _ref;
      canvasContainer || (canvasContainer = document.getElementById("canvas-container"));
      canvas = this.canvas = document.createElement("canvas");
      canvas.width = PEGBAR.CANVAS_WIDTH;
      canvas.height = PEGBAR.CANVAS_HEIGHT;
      _ref = ["down", "move", "up"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        evnt = _ref[_i];
        canvas.addEventListener("mouse" + evnt, this["mouse" + evnt], false);
      }
      ctx = this.ctx = canvas.getContext("2d");
      ctx.fillStyle = PEGBAR.BACKGROUND_COLOR.toString();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      canvasContainer.appendChild(canvas);
    }

    DrawingCanvas.prototype.mousedown = function(evnt) {
      var ctx;
      ctx = this.ctx;
      ctx.beginPath();
      ctx.moveTo(evnt.layerX, evnt.layerY);
      return this.isDrawing = true;
    };

    DrawingCanvas.prototype.mousemove = function(evnt) {
      var ctx;
      if (this.isDrawing) {
        ctx = this.ctx;
        ctx.lineTo(evnt.layerX, evnt.layerY);
        return ctx.stroke();
      }
    };

    DrawingCanvas.prototype.mouseup = function(evnt) {
      if (this.isDrawing) {
        this.mousemove(evnt);
        return this.isDrawing = false;
      }
    };

    DrawingCanvas.prototype.getImageData = function() {
      var height, width, _ref;
      _ref = this.canvas, width = _ref.width, height = _ref.height;
      return this.ctx.getImageData(0, 0, width, height);
    };

    DrawingCanvas.prototype.putImageData = function(imgData) {
      return this.ctx.putImageData(imgData, 0, 0);
    };

    DrawingCanvas.prototype.createImageData = function(compressedImgData) {
      var HEIGHT, WIDTH, bckgrnd, datum, i, imgData, val, _i, _j, _len, _ref;
      WIDTH = PEGBAR.WIDTH, HEIGHT = PEGBAR.HEIGHT;
      imgData = this.ctx.createImageData(WIDTH, HEIGHT);
      bckgrnd = PEGBAR.BACKGROUND_COLOR.getImgDataFriendlyRGBA();
      for (i = _i = 0, _ref = WIDTH * HEIGHT * 4; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        imgData[i] = bckgrnd[i % 4];
      }
      if (compressedImgData) {
        for (_j = 0, _len = compressedImgData.length; _j < _len; _j++) {
          datum = compressedImgData[_j];
          i = datum[0], val = datum[1];
          imgData[i] = val;
        }
      }
      return imgData;
    };

    DrawingCanvas.prototype.clearCanvas = function() {
      var canvas, ctx, height, width;
      canvas = this.canvas, ctx = this.ctx;
      width = canvas.width, height = canvas.height;
      canvas.width = width;
      ctx.fillStyle = PEGBAR.BACKGROUND_COLOR.toString();
      return ctx.fillRect(0, 0, width, height);
    };

    return DrawingCanvas;

  })();

  PEGBAR = window.PEGBAR || (window.PEGBAR = {});

  PEGBAR.Frms = (function() {
    var Frm;

    function Frms() {
      var frms, i;
      frms = [];
      i = 0;
      frms.currentIndex = function() {
        return i;
      };
      frms.currentFrm = function() {
        return this[i];
      };
      frms.next = function() {
        i = (i + 1) % this.length;
        return this[i];
      };
      frms.addFrm = function(imgData) {
        return this.push(new Frm(imgData));
      };
      frms.updateFrm = function(imgData) {
        return this[i].imgData = imgData;
      };
      frms.getSaveData = function() {
        var frm, sd, _i, _len;
        sd = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          frm = this[_i];
          sd.push(frm.save());
        }
        return sd;
      };
      frms.loadFromSaveData = function(sd) {
        var frm, _i, _len;
        while (this.length) {
          this.pop();
        }
        for (_i = 0, _len = sd.length; _i < _len; _i++) {
          frm = sd[_i];
          this.addFrm(frm);
        }
        return this;
      };
      return frms;
    }

    Frm = (function() {
      function Frm(imgData) {
        if (imgData instanceof ImageData) {
          this.imgData = imgData;
        } else {
          this.imgData = PEGBAR.drawingCanvas.createImageData(imgData);
        }
      }

      Frm.prototype.save = function() {
        var bckgrnd, data, datum, i, saveData, _i, _len;
        data = this.imgData.data;
        saveData = [];
        bckgrnd = PEGBAR.BACKGROUND_COLOR.getImgDataFriendlyRGBA();
        for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
          datum = data[i];
          if (datum !== bckgrnd[i % 4]) {
            saveData.push([i, datum]);
          }
        }
        return saveData;
      };

      return Frm;

    })();

    return Frms;

  })();

  PEGBAR = window.PEGBAR || (window.PEGBAR = {});

  PEGBAR.PaperStack = (function() {
    var canvasContainer, currentFrameNumberDisplay, el, stack, totalFramesDisplay;

    el = function(id) {
      return document.getElementById(id);
    };

    canvasContainer = null;

    currentFrameNumberDisplay = null;

    totalFramesDisplay = null;

    stack = [];

    function PaperStack() {
      canvasContainer = el("canvas-container");
      currentFrameNumberDisplay = el("current_frame");
      totalFramesDisplay = el("total_frames");
      this.currentIndex = 0;
      this.newFrame();
    }

    PaperStack.prototype.getStack = function() {
      return stack.slice();
    };

    PaperStack.prototype.reconstruct = function() {
      var currentFrame, layerDepth, layerIndex, preFrame, preceedingFrames, proFrame, proceedingFrames, _ref, _ref1;
      currentFrame = stack[this.currentIndex];
      preceedingFrames = stack.slice(Math.max(0, this.currentIndex - 5), this.currentIndex);
      proceedingFrames = stack.slice(this.currentIndex + 1, Math.min(this.currentIndex + 6, stack.length)).reverse();
      layerDepth = Math.max(preceedingFrames.length, proceedingFrames.length);
      if (proceedingFrames.length < layerDepth) {
        while (proceedingFrames.length !== layerDepth) {
          proceedingFrames.unshift(null);
        }
      } else if (preceedingFrames.length < layerDepth) {
        while (preceedingFrames.length !== layerDepth) {
          preceedingFrames.unshift(null);
        }
      }
      canvasContainer.innerHTML = "";
      layerIndex = -1;
      while (layerIndex++ < layerDepth) {
        preFrame = (_ref = preceedingFrames[layerIndex]) != null ? _ref.canvas : void 0;
        proFrame = (_ref1 = proceedingFrames[layerIndex]) != null ? _ref1.canvas : void 0;
        if (preFrame) {
          preFrame.style.display = "block";
          canvasContainer.appendChild(preFrame);
          canvasContainer.appendChild(this.newOnionLayer());
        }
        if (proFrame) {
          proFrame.style.display = "block";
          canvasContainer.appendChild(proFrame);
          canvasContainer.appendChild(this.newOnionLayer());
        }
      }
      if (this.guideFrame) {
        canvasContainer.appendChild(this.guideFrame);
        canvasContainer.appendChild(this.newOnionLayer());
      }
      canvasContainer.appendChild(currentFrame.canvas);
      currentFrameNumberDisplay.textContent = this.currentIndex + 1;
      return totalFramesDisplay.textContent = stack.length;
    };

    PaperStack.prototype.newOnionLayer = function() {
      var onion;
      onion = document.createElement("div");
      onion.className = "onion";
      onion.style.height = "" + PEGBAR.CANVAS_HEIGHT + "px";
      onion.style.width = "" + PEGBAR.CANVAS_WIDTH + "px";
      return onion;
    };

    PaperStack.prototype.prevFrame = function() {
      return this.currentIndex = (this.currentIndex - 1 + stack.length) % stack.length;
    };

    PaperStack.prototype.nextFrame = function() {
      return this.currentIndex = (this.currentIndex + 1) % stack.length;
    };

    PaperStack.prototype.newFrame = function(atIndex) {
      if (atIndex == null) {
        atIndex = this.currentIndex + 1;
      }
      return stack.splice(atIndex, 0, new PEGBAR.DrawingCanvas);
    };

    PaperStack.prototype.removeFrame = function(atIndex) {
      if (atIndex == null) {
        atIndex = this.currentIndex;
      }
      stack.splice(atIndex, 1);
      if (this.currentIndex === stack.length) {
        return this.currentIndex--;
      }
    };

    PaperStack.prototype.insertTweenFrames = function() {
      var newStack;
      newStack = [];
      while (stack.length) {
        newStack.push(stack.shift(), new PEGBAR.DrawingCanvas);
      }
      newStack.pop();
      stack = newStack;
      return this.currentIndex = stack.length - 1;
    };

    PaperStack.prototype.play = function() {
      var frame, tick, _i, _len,
        _this = this;
      if (this.playing) {
        return this.stop();
      }
      canvasContainer.innerHTML = "";
      for (_i = 0, _len = stack.length; _i < _len; _i++) {
        frame = stack[_i];
        frame.canvas.style.display = "none";
        canvasContainer.appendChild(frame.canvas);
      }
      tick = function() {
        stack[_this.currentIndex].canvas.style.display = "none";
        return stack[_this.nextFrame()].canvas.style.display = "block";
      };
      tick();
      this.interval = setInterval(tick, 1000 / 12);
      return this.playing = true;
    };

    PaperStack.prototype.stop = function() {
      clearInterval(this.interval);
      this.playing = false;
      return this.reconstruct();
    };

    return PaperStack;

  })();

  PEGBAR = window.PEGBAR || (window.PEGBAR = {});

  PEGBAR.Timeline = (function() {
    function Timeline() {}

    return Timeline;

  })();

}).call(this);
