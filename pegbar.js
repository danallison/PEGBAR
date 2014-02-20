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

  PEGBAR.CANVAS_WIDTH = +localStorage.canvas_width || 400;

  PEGBAR.CANVAS_HEIGHT = +localStorage.canvas_height || 300;

  PEGBAR.init = function() {
    this.paperStack = new this.PaperStack;
    this.timeline = new this.Timeline;
    this.controls = new this.Controls;
    this.DomWrangler.centerCanvasAndTimeline();
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

  (function() {
    var _exportingGif;
    _exportingGif = false;
    return PEGBAR.exportGif = function() {
      var frm, gif, stack, _i, _len,
        _this = this;
      if (_exportingGif) {
        return;
      }
      _exportingGif = true;
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
          delay: frm.duration
        });
      }
      gif.on('finished', function(blob) {
        _exportingGif = false;
        return window.open(URL.createObjectURL(blob));
      });
      return gif.render();
    };
  })();

  PEGBAR.exportPNGSpriteSheet = function() {
    var frm, i, scratchCanvas, scratchCtx, stack, _i, _len;
    scratchCanvas = document.createElement('canvas');
    scratchCanvas.height = this.CANVAS_HEIGHT;
    stack = this.paperStack.getStack();
    scratchCanvas.width = this.CANVAS_WIDTH * stack.length;
    scratchCtx = scratchCanvas.getContext('2d');
    for (i = _i = 0, _len = stack.length; _i < _len; i = ++_i) {
      frm = stack[i];
      scratchCtx.putImageData(frm.getImageData(), this.CANVAS_WIDTH * i, 0);
    }
    return window.open(scratchCanvas.toDataURL());
  };

  PEGBAR.loadImageFile = function(event) {
    var input, reader,
      _this = this;
    input = event.target;
    reader = new FileReader;
    reader.onload = function(event) {
      var dataURL, img;
      dataURL = event.target.result;
      img = document.createElement('img');
      img.src = dataURL;
      return _this.paperStack.getCurrentFrame().drawImage(img);
    };
    return reader.readAsDataURL(input.files[0]);
  };

  PEGBAR = window.PEGBAR || (window.PEGBAR = {});

  PEGBAR.Controls = (function() {
    var el;

    el = function(id) {
      return document.getElementById(id);
    };

    function Controls() {
      var deleteButton, exportGifButton, exportSpriteButton, guideButton, newButton, nextButton, paperStack, playButton, prevButton, timeline;
      nextButton = el("next");
      prevButton = el("prev");
      newButton = el("new");
      guideButton = el("guide");
      deleteButton = el("delete");
      playButton = el("play");
      exportGifButton = el("export_gif");
      exportSpriteButton = el("export_sprite");
      paperStack = PEGBAR.paperStack, timeline = PEGBAR.timeline;
      nextButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        paperStack.nextFrame();
        paperStack.reconstruct();
        return timeline.reconstruct();
      });
      prevButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        paperStack.prevFrame();
        paperStack.reconstruct();
        return timeline.reconstruct();
      });
      newButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        paperStack.newFrame();
        paperStack.nextFrame();
        paperStack.reconstruct();
        return timeline.reconstruct();
      });
      guideButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        paperStack.setGuideFrame();
        guideButton.textContent = "guide frame set";
        return _.delay(function() {
          return guideButton.textContent = "set guide frame";
        }, 1000);
      });
      deleteButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (confirm("are you sure?")) {
          paperStack.removeFrame();
          paperStack.reconstruct();
          return timeline.reconstruct();
        }
      });
      playButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (paperStack.play()) {
          return playButton.textContent = "stop";
        } else {
          return playButton.textContent = "play";
        }
      });
      exportGifButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        return PEGBAR.exportGif();
      });
      exportSpriteButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        return PEGBAR.exportPNGSpriteSheet();
      });
    }

    return Controls;

  })();

  PEGBAR = window.PEGBAR || (window.PEGBAR = {});

  PEGBAR.DomWrangler = (function() {
    function DomWrangler() {}

    DomWrangler.centerCanvasAndTimeline = function() {
      var canvasContainer, doc, timelineContainer;
      doc = window.document;
      canvasContainer = doc.getElementById("canvas-container");
      timelineContainer = doc.getElementById("timeline-container");
      canvasContainer.style.top = "" + (window.innerHeight / 2 - PEGBAR.CANVAS_HEIGHT / 2) + "px";
      timelineContainer.style.left = canvasContainer.style.left = "" + (window.innerWidth / 2 - PEGBAR.CANVAS_WIDTH / 2) + "px";
      return timelineContainer.style.top = "" + (window.innerHeight / 2 + PEGBAR.CANVAS_HEIGHT / 2 + 2) + "px";
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

    DrawingCanvas.prototype.duration = 83;

    function DrawingCanvas() {
      this.mouseup = __bind(this.mouseup, this);
      this.mousemove = __bind(this.mousemove, this);
      this.mousedown = __bind(this.mousedown, this);
      var canvas, ctx, eventNames, mouseEvent, touchEvent;
      canvasContainer || (canvasContainer = document.getElementById("canvas-container"));
      canvas = this.canvas = document.createElement("canvas");
      canvas.width = PEGBAR.CANVAS_WIDTH;
      canvas.height = PEGBAR.CANVAS_HEIGHT;
      eventNames = {
        "mousedown": "touchstart",
        "mousemove": "touchmove",
        "mouseup": "touchend"
      };
      for (mouseEvent in eventNames) {
        touchEvent = eventNames[mouseEvent];
        canvas.addEventListener(mouseEvent, this[mouseEvent], false);
        canvas.addEventListener(touchEvent, this[mouseEvent], false);
      }
      ctx = this.ctx = canvas.getContext("2d");
      ctx.fillStyle = PEGBAR.BACKGROUND_COLOR.toString();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      canvasContainer.appendChild(canvas);
    }

    DrawingCanvas.prototype.mousedown = function(evnt) {
      var ctx;
      evnt.preventDefault();
      ctx = this.ctx;
      ctx.beginPath();
      ctx.moveTo(evnt.layerX, evnt.layerY);
      return this.isDrawing = true;
    };

    DrawingCanvas.prototype.mousemove = function(evnt) {
      var ctx;
      evnt.preventDefault();
      if (this.isDrawing) {
        ctx = this.ctx;
        ctx.lineTo(evnt.layerX, evnt.layerY);
        ctx.lineCap = "round";
        ctx.lineWidth = 1;
        return ctx.stroke();
      }
    };

    DrawingCanvas.prototype.mouseup = function(evnt) {
      evnt.preventDefault();
      if (this.isDrawing) {
        return this.isDrawing = false;
      }
    };

    DrawingCanvas.prototype.getImageData = function() {
      var height, width, _ref;
      _ref = this.canvas, width = _ref.width, height = _ref.height;
      return this.ctx.getImageData(0, 0, width, height);
    };

    DrawingCanvas.prototype.toDataURL = function() {
      return this.canvas.toDataURL();
    };

    DrawingCanvas.prototype.putImageData = function(imgData, x, y) {
      return this.ctx.putImageData(imgData, x || 0, y || 0);
    };

    DrawingCanvas.prototype.drawImage = function(img, x, y) {
      return this.ctx.drawImage(img, x || 0, y || 0);
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

  _.isInteger = function(n) {
    return n === n | 0;
  };

  _.isPositiveNumber = function(n) {
    return _.isNumber(n) && n > 0;
  };

  _.isPositiveInteger = function(n) {
    return _.isPositiveNumber(n) && _.isInteger(n);
  };

  _.isNonNegativeNumber = function(n) {
    return _.isNumber(n) && n >= 0;
  };

  _.isNonNegativeInteger = function(n) {
    return _.isNonNegativeNumber(n) && _.isInteger(n);
  };

  _.removeAt = function(array, indexesToRemove) {
    var index, slideBack;
    if (typeof indexesToRemove === 'number') {
      indexesToRemove = [].slice.call(arguments, 1).sort();
    } else {
      indexesToRemove = indexesToRemove.slice().sort();
    }
    slideBack = 0;
    while (indexesToRemove.length) {
      index = indexesToRemove.shift() - slideBack;
      array.splice(index, 1);
      slideBack++;
    }
    return array;
  };

  PEGBAR = window.PEGBAR || (window.PEGBAR = {});

  PEGBAR.PaperStack = (function() {
    var __stack__, _canvasContainer, _currentFrameNumberDisplay, _el, _onionCountAhead, _onionCountBehind, _playing, _showGuideFrame, _showOnions, _singleton, _timeout, _totalFramesDisplay;

    _singleton = null;

    _el = function(id) {
      return document.getElementById(id);
    };

    _canvasContainer = null;

    _currentFrameNumberDisplay = null;

    _totalFramesDisplay = null;

    _showOnions = true;

    _showGuideFrame = true;

    _onionCountBehind = 2;

    _onionCountAhead = 2;

    _playing = false;

    _timeout = null;

    __stack__ = [];

    PaperStack.prototype.currentIndex = 0;

    function PaperStack() {
      if (_singleton) {
        return _singleton;
      }
      _singleton = this;
      _canvasContainer = _el("canvas-container");
      _currentFrameNumberDisplay = _el("current_frame");
      _totalFramesDisplay = _el("total_frames");
      this.newFrame();
    }

    PaperStack.prototype.getStack = function() {
      return __stack__.slice();
    };

    PaperStack.prototype.getCurrentFrame = function() {
      return __stack__[this.currentIndex];
    };

    PaperStack.prototype.getFrameCount = function() {
      return __stack__.length;
    };

    PaperStack.prototype.setGuideFrame = function(frameIndex) {
      if (frameIndex == null) {
        frameIndex = this.currentIndex;
      }
      if (_.isNonNegativeInteger(frameIndex)) {
        return this.guideFrame = __stack__[frameIndex].canvas;
      } else if (_.isElement(frameIndex)) {
        return this.guideFrame = frameIndex;
      } else {
        throw "expecting a positive integer or DOM element, instead got " + frameIndex;
      }
    };

    PaperStack.prototype.setFrameDuration = function(newDuration, index) {
      if (index == null) {
        index = this.currentIndex;
      }
      if (!_.isPositiveNumber(newDuration)) {
        throw "new duration must be a positive number";
      }
      if (!_.isNonNegativeInteger(index)) {
        throw "index must be a non-negative integer";
      }
      return __stack__[index].duration = newDuration;
    };

    PaperStack.prototype.setOnionCount = function(behindCount, aheadCount) {
      if (!_.isNonNegativeInteger(behindCount)) {
        throw "must provide a non-negative integer";
      }
      behindCount = Math.min(behindCount, 5);
      aheadCount = _.isNonNegativeInteger(aheadCount) ? Math.min(aheadCount, 5) : behindCount;
      _onionCountAhead = aheadCount;
      _onionCountBehind = behindCount;
      return this.reconstruct();
    };

    PaperStack.prototype.hideOnions = function() {
      _showOnions = false;
      return this.reconstruct();
    };

    PaperStack.prototype.showOnions = function() {
      _showOnions = true;
      return this.reconstruct();
    };

    PaperStack.prototype.toggleOnions = function() {
      _showOnions = !_showOnions;
      return this.reconstruct();
    };

    PaperStack.prototype.hideGuideFrame = function() {
      _showGuideFrame = false;
      return this.reconstruct();
    };

    PaperStack.prototype.showGuideFrame = function() {
      _showGuideFrame = true;
      return this.reconstruct();
    };

    PaperStack.prototype.toggleGuideFrame = function() {
      _showGuideFrame = !_showGuideFrame;
      return this.reconstruct();
    };

    PaperStack.prototype.reconstruct = function() {
      var currentFrame, layerDepth, layerIndex, preFrame, preceedingFrames, proFrame, proceedingFrames, _ref, _ref1;
      currentFrame = __stack__[this.currentIndex];
      _canvasContainer.innerHTML = "";
      if (_showOnions && _onionCountBehind + _onionCountAhead > 0) {
        preceedingFrames = __stack__.slice(Math.max(0, this.currentIndex - _onionCountBehind), this.currentIndex);
        proceedingFrames = __stack__.slice(this.currentIndex + 1, Math.min(this.currentIndex + 1 + _onionCountAhead, __stack__.length)).reverse();
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
        layerIndex = -1;
        while (layerIndex++ < layerDepth) {
          preFrame = (_ref = preceedingFrames[layerIndex]) != null ? _ref.canvas : void 0;
          proFrame = (_ref1 = proceedingFrames[layerIndex]) != null ? _ref1.canvas : void 0;
          if (preFrame) {
            preFrame.style.display = "block";
            _canvasContainer.appendChild(preFrame);
          }
          if (proFrame) {
            proFrame.style.display = "block";
            _canvasContainer.appendChild(proFrame);
          }
          if (preFrame || proFrame) {
            _canvasContainer.appendChild(this.newOnionLayer());
          }
        }
      }
      if (_showGuideFrame && this.guideFrame) {
        _canvasContainer.appendChild(this.guideFrame);
        _canvasContainer.appendChild(this.newOnionLayer());
      }
      currentFrame.canvas.style.display = "block";
      _canvasContainer.appendChild(currentFrame.canvas);
      _currentFrameNumberDisplay.textContent = this.currentIndex + 1;
      return _totalFramesDisplay.textContent = __stack__.length;
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
      return this.currentIndex = (this.currentIndex - 1 + __stack__.length) % __stack__.length;
    };

    PaperStack.prototype.nextFrame = function() {
      return this.currentIndex = (this.currentIndex + 1) % __stack__.length;
    };

    PaperStack.prototype.newFrame = function(atIndex) {
      if (!_.isNonNegativeInteger(atIndex)) {
        atIndex = this.currentIndex + 1;
      }
      return __stack__.splice(atIndex, 0, new PEGBAR.DrawingCanvas);
    };

    PaperStack.prototype.removeFrame = function(atIndex) {
      if (!_.isNonNegativeInteger(atIndex)) {
        atIndex = this.currentIndex;
      }
      __stack__.splice(atIndex, 1);
      if (!__stack__.length) {
        __stack__.push(new PEGBAR.DrawingCanvas);
      }
      if (this.currentIndex === __stack__.length) {
        return this.currentIndex--;
      }
    };

    PaperStack.prototype.insertTweenFrames = function() {
      var newStack;
      newStack = [];
      while (__stack__.length) {
        newStack.push(__stack__.shift(), new PEGBAR.DrawingCanvas);
      }
      newStack.pop();
      __stack__ = newStack;
      return this.currentIndex = __stack__.length - 1;
    };

    PaperStack.prototype.play = function() {
      var frame, tick, _i, _len,
        _this = this;
      if (_playing || __stack__.length === 1) {
        return this.stop();
      }
      _canvasContainer.innerHTML = "";
      for (_i = 0, _len = __stack__.length; _i < _len; _i++) {
        frame = __stack__[_i];
        frame.canvas.style.display = "none";
        _canvasContainer.appendChild(frame.canvas);
      }
      tick = function() {
        var nextFrame;
        __stack__[_this.currentIndex].canvas.style.display = "none";
        nextFrame = __stack__[_this.nextFrame()];
        nextFrame.canvas.style.display = "block";
        _currentFrameNumberDisplay.textContent = _this.currentIndex + 1;
        return _timeout = _.delay(tick, nextFrame.duration);
      };
      tick();
      return _playing = true;
    };

    PaperStack.prototype.stop = function() {
      clearTimeout(_timeout);
      this.reconstruct();
      return _playing = false;
    };

    return PaperStack;

  })();

  PEGBAR = window.PEGBAR || (window.PEGBAR = {});

  PEGBAR.Timeline = (function() {
    var _divStack, _divWidth, _paperStack, _timelineContainer;

    _paperStack = null;

    _timelineContainer = null;

    _divStack = [];

    _divWidth = 10;

    function Timeline() {
      _paperStack = PEGBAR.paperStack;
      _timelineContainer = document.getElementById("timeline-container");
    }

    Timeline.prototype.reconstruct = function() {
      var currentFrame, diff, div, frameCount, i, timelineWidth, _i, _len;
      frameCount = _paperStack.getFrameCount();
      _divWidth = Math.max(PEGBAR.CANVAS_WIDTH / frameCount - 2, 16);
      diff = _divStack.length - frameCount;
      if (diff < 0) {
        while (diff++) {
          this.addDiv();
        }
      } else if (diff > 0) {
        while (diff--) {
          _divStack.pop();
        }
      }
      _timelineContainer.innerHTML = "";
      currentFrame = _paperStack.currentIndex;
      for (i = _i = 0, _len = _divStack.length; _i < _len; i = ++_i) {
        div = _divStack[i];
        div.style.width = "" + _divWidth + "px";
        div.style.background = currentFrame === i ? "#999" : "#ddd";
        _timelineContainer.appendChild(div);
      }
      timelineWidth = frameCount * _divWidth;
      if (timelineWidth > PEGBAR.CANVAS_WIDTH) {
        return _timelineContainer.style.left = "" + (window.innerWidth / 2 - timelineWidth / 2) + "px";
      }
    };

    Timeline.prototype.addDiv = function() {
      var attr, div, val, _ref;
      div = document.createElement("div");
      _ref = {
        height: "15px",
        display: "inline-block",
        border: "solid 1px #fff"
      };
      for (attr in _ref) {
        val = _ref[attr];
        div.style[attr] = val;
      }
      return _divStack.push(div);
    };

    Timeline.prototype.incrementColors = function() {
      var currentFrame;
      currentFrame = _paperStack.currentIndex;
      _divStack[currentFrame].style.background = "#999";
      return _divStack[(currentFrame || _divStack.length) - 1].style.background = "#ddd";
    };

    return Timeline;

  })();

}).call(this);
