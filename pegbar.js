// Generated by CoffeeScript 1.7.0
(function() {
  var PEGBAR;

  PEGBAR = window.PEGBAR || (window.PEGBAR = {});

  PEGBAR.BACKGROUND_COLOR = {
    r: 255,
    g: 255,
    b: 255,
    a: 0,
    toString: function() {
      return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
    },
    toStringOpaque: function() {
      return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", 1)";
    },
    getImgDataFriendlyRGBA: function() {
      return [this.r, this.g, this.b, this.a * 255 | 0];
    }
  };

  PEGBAR.CANVAS_WIDTH = +localStorage.canvas_width || 400;

  PEGBAR.CANVAS_HEIGHT = +localStorage.canvas_height || 300;

  PEGBAR.init = function() {
    atc.frameRate(1000 / 12);
    this.atcTitle = atc("#pegbar_title");
    this.paperStack = new this.PaperStack;
    this.timeline = new this.Timeline;
    this.controls = new this.Controls;
    this.DomWrangler.centerCanvasAndTimeline();
    this.DomWrangler.putControlsToTheRightOfTheCanvas();
  };

  (function() {
    var _exportingGif;
    _exportingGif = false;
    PEGBAR.exportGif = function() {
      var frm, gif, height, opaqueBackground, scratchCanvas, scratchContext, stack, width, x, y, _i, _len, _ref;
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
      _ref = this.paperStack.getBoundingRectangle(), x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height;
      scratchCanvas = document.createElement('canvas');
      scratchCanvas.width = width;
      scratchCanvas.height = height;
      scratchContext = scratchCanvas.getContext('2d');
      opaqueBackground = PEGBAR.BACKGROUND_COLOR.toStringOpaque();
      for (_i = 0, _len = stack.length; _i < _len; _i++) {
        frm = stack[_i];
        scratchCanvas.width = width;
        scratchContext.fillStyle = opaqueBackground;
        scratchContext.fillRect(0, 0, width, height);
        scratchContext.globalCompositeOperation = 'source-over';
        scratchContext.drawImage(frm.canvas, -x, -y);
        gif.addFrame(scratchContext.getImageData(0, 0, width, height), {
          copy: true,
          delay: frm.duration
        });
      }
      gif.on('finished', (function(_this) {
        return function(blob) {
          _exportingGif = false;
          return window.open(URL.createObjectURL(blob));
        };
      })(this));
      gif.render();
    };
  })();

  PEGBAR.exportPNGSpriteSheet = function() {
    var frm, i, spriteCanvas, spriteCtx, stack, _i, _len;
    spriteCanvas = document.createElement('canvas');
    spriteCanvas.height = this.CANVAS_HEIGHT;
    stack = this.paperStack.getStack();
    spriteCanvas.width = this.CANVAS_WIDTH * stack.length;
    spriteCtx = spriteCanvas.getContext('2d');
    for (i = _i = 0, _len = stack.length; _i < _len; i = ++_i) {
      frm = stack[i];
      spriteCtx.putImageData(frm.getImageData(), this.CANVAS_WIDTH * i, 0);
    }
    window.open(spriteCanvas.toDataURL());
  };

  PEGBAR.exportTrimmedPNGSpriteSheet = function() {
    var frm, height, i, spriteCanvas, spriteCtx, stack, width, x, y, _i, _len, _ref;
    _ref = this.paperStack.getBoundingRectangle(), x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height;
    stack = this.paperStack.getStack();
    spriteCanvas = document.createElement('canvas');
    spriteCanvas.height = height;
    spriteCanvas.width = width * stack.length;
    spriteCtx = spriteCanvas.getContext('2d');
    for (i = _i = 0, _len = stack.length; _i < _len; i = ++_i) {
      frm = stack[i];
      spriteCtx.putImageData(frm.getImageData(x, y, width, height), width * i, 0);
    }
    window.open(spriteCanvas.toDataURL());
  };

  PEGBAR.loadFile = function(evnt) {
    var file, fileExtension, fileName, input, projName, reader;
    input = evnt.target;
    file = input.files[0];
    fileName = file.name.split('.');
    fileExtension = fileName.pop();
    projName = fileName.join('.');
    reader = new FileReader;
    if (fileExtension === 'pegbar') {
      reader.onload = (function(_this) {
        return function(e) {
          _this.open(e.target.result);
        };
      })(this);
      return reader.readAsText(file);
    } else {
      reader.onload = (function(_this) {
        return function(e) {
          var dataURL, img;
          dataURL = e.target.result;
          img = document.createElement('img');
          img.src = dataURL;
          _this.paperStack.getCurrentFrame().drawImage(img);
        };
      })(this);
      reader.readAsDataURL(file);
    }
  };

  (function() {
    var _docTemplate, _frameTemplate;
    _docTemplate = _.template("<!doctype html>\n<head>\n  <meta charset=\"utf-8\">\n  <title><%= projName %></title>\n</head>\n<body>\n  <div>\n    This is a <a href=\"https://github.com/danallison/PEGBAR\">*PEG*BAR*</a> project file, created <%= new Date().toString() %>.\n  </div>\n  <hr>\n  <div>\n    project name: <%= projName %> <br>\n    dimensions: <%= dimensions[0] %> x <%= dimensions[1] %> <br>\n    frame count: <%= frameCount %> <br>\n    duration: <%= totalDuration %> milliseconds\n  </div>\n<%= frames %>\n</body>");
    _frameTemplate = _.template("<hr>\n<div> \n  frame <%= frameNumber %> <br> \n  duration: <%= duration %> milliseconds <br>\n  <img src=\"<%= dataURL %>\">\n</div>");
    PEGBAR.save = function(download, fileName) {
      var a, blob, dataString, dataURLs, durations, frameCount, frames, height, stack, totalDuration, width, _ref;
      if (fileName == null) {
        fileName = 'unnamed_project';
      }
      stack = this.paperStack.getStack();
      dataURLs = _.invoke(stack, 'toDataURL');
      durations = _.pluck(stack, 'duration');
      totalDuration = _.reduce(durations, (function(d, m) {
        return d + m;
      }), 0);
      if (download) {
        _ref = stack[0].canvas, width = _ref.width, height = _ref.height;
        frameCount = stack.length;
        frames = dataURLs.map(function(dataURL, i) {
          return _frameTemplate({
            dataURL: dataURL,
            frameNumber: i + 1,
            duration: durations[i]
          });
        }).join('');
        dataString = _docTemplate({
          projName: fileName,
          dimensions: [width, height],
          frameCount: frameCount,
          totalDuration: totalDuration,
          frames: frames
        });
        blob = new Blob([dataString], {
          type: 'text/plain'
        });
        a = document.createElement('a');
        a.download = "" + fileName + ".pegbar";
        a.href = URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        a.dataset.disabled = true;
        setTimeout(function() {
          return URL.revokeObjectURL(a.href);
        }, 1500);
      } else {
        localStorage.project = dataURLs.join('\n');
      }
    };
    PEGBAR.open = function(dataString) {
      var frames;
      if (dataString) {
        frames = dataString.match(/data\:image\/png.+?\"/g).map(function(str) {
          return str.substring(0, str.length - 1);
        });
      } else if (dataString = localStorage.project) {
        frames = dataString.split('\n');
      } else {
        throw 'nothing to open';
      }
      this.paperStack.rebuildStack(frames);
    };
  })();

  PEGBAR = window.PEGBAR || (window.PEGBAR = {});

  PEGBAR.Controls = (function() {
    var durationObj, el;

    el = function(id) {
      return document.getElementById(id);
    };

    durationObj = {
      duration: 300
    };

    function Controls() {
      var borderNone, deleteButton, drawEraseButton, drawEraseText, exportGifButton, exportSpriteButton, guideButton, newButton, nextButton, paperStack, playButton, prevButton, projNameInput, saveButton, timeline;
      nextButton = el("next");
      prevButton = el("prev");
      newButton = el("new");
      guideButton = el("guide");
      deleteButton = el("delete");
      playButton = el("play");
      exportGifButton = el("export_gif");
      exportSpriteButton = el("export_sprite");
      drawEraseButton = el("draw_erase");
      saveButton = el("save_proj");
      projNameInput = el("proj_name");
      paperStack = PEGBAR.paperStack, timeline = PEGBAR.timeline;
      nextButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        paperStack.nextFrame();
        paperStack.reconstruct();
        timeline.reconstruct();
      });
      prevButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        paperStack.prevFrame();
        paperStack.reconstruct();
        timeline.reconstruct();
      });
      newButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        paperStack.newFrame();
        paperStack.nextFrame();
        paperStack.reconstruct();
        timeline.reconstruct();
      });
      guideButton.addEventListener("click", function(evt) {
        var textFrames;
        evt.preventDefault();
        evt.stopPropagation();
        paperStack.setGuideFrame();
        textFrames = ["set guide frame", "et guide frame s", "t guide frame se", "guide frame set"];
        atc(guideButton).frameByFrame(textFrames, {
          duration: 500
        }).go();
        _.delay(function() {
          return atc(guideButton).frameByFrame(textFrames.reverse().concat(["nset guide frame", "unset guide frame"]), {
            duration: 500
          }).go();
        }, 1500);
      });
      deleteButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (confirm("are you sure?")) {
          paperStack.removeFrame();
          paperStack.reconstruct();
          timeline.reconstruct();
        }
      });
      playButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (paperStack.play()) {
          atc(playButton).typeOver("stop", durationObj).go();
        } else {
          atc(playButton).typeOver("play", durationObj).go();
        }
      });
      exportGifButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        PEGBAR.exportGif();
      });
      exportSpriteButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        PEGBAR.exportTrimmedPNGSpriteSheet();
      });
      drawEraseText = {
        "draw": "erase",
        "erase": "draw"
      };
      drawEraseButton.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        PEGBAR.DrawingCanvas.toggleEraser();
        atc(drawEraseButton).typeOver(drawEraseText[drawEraseButton.textContent], durationObj).go();
      });
      borderNone = ["red", "#ddd"];
      saveButton.addEventListener("click", function(evt) {
        var interval, projName;
        evt.preventDefault();
        evt.stopPropagation();
        projName = projNameInput.value.replace(/\s/g, "_");
        if (!projName) {
          interval = setInterval(function() {
            return borderNone.push(projNameInput.style.borderColor = borderNone.shift());
          }, 100);
          _.delay(function() {
            return clearInterval(interval);
          }, 1000);
          return;
        }
        PEGBAR.save(true, projName);
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
      timelineContainer.style.top = "" + (window.innerHeight / 2 + PEGBAR.CANVAS_HEIGHT / 2 + 2) + "px";
    };

    DomWrangler.putControlsToTheRightOfTheCanvas = function() {
      var controlsContainer, doc;
      doc = window.document;
      controlsContainer = doc.getElementById("controls-container");
      controlsContainer.style.top = "" + (window.innerHeight / 2 - PEGBAR.CANVAS_HEIGHT / 2) + "px";
      controlsContainer.style.left = "" + (window.innerWidth / 2 + PEGBAR.CANVAS_WIDTH / 2 + 10) + "px";
    };

    DomWrangler.addEventListenersToControls = function() {};

    return DomWrangler;

  })();

  PEGBAR = window.PEGBAR || (window.PEGBAR = {});

  PEGBAR.DrawingCanvas = (function() {
    var _baseLineWidth, _canvasContainer, _eraserActive, _globalCompositeOp, _lineCap, _pressureSensitive;

    _canvasContainer = null;

    _pressureSensitive = _.isNumber(new MouseEvent('move').mozPressure);

    _baseLineWidth = 0;

    _lineCap = 'round';

    _globalCompositeOp = 'source-over';

    _eraserActive = false;

    DrawingCanvas.pressureWeight = 2;

    DrawingCanvas.toggleEraser = function() {
      if (_eraserActive) {
        _eraserActive = false;
        _baseLineWidth = 0;
        _globalCompositeOp = 'source-over';
      } else {
        _eraserActive = true;
        _baseLineWidth = 5;
        _globalCompositeOp = 'destination-out';
      }
    };

    DrawingCanvas.prototype.duration = 83;

    function DrawingCanvas(width, height) {
      var canvas, ctx, sp;
      _canvasContainer || (_canvasContainer = document.getElementById("canvas-container"));
      canvas = this.canvas = document.createElement("canvas");
      canvas.width = width || PEGBAR.CANVAS_WIDTH;
      canvas.height = height || PEGBAR.CANVAS_HEIGHT;
      ctx = this.ctx = canvas.getContext("2d");
      ctx.fillStyle = PEGBAR.BACKGROUND_COLOR.toString();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      sp = this.sp = new SignaturePad(canvas);
      sp.minWidth = 0.01;
      sp.maxWidth = 2.5;
      sp.velocityFilterWeight = 1;
      sp.onBegin = function(evt) {
        ctx.globalCompositeOperation = _globalCompositeOp;
        sp.onMove(evt);
      };
      sp.onMove = function(evt) {
        var mozPressure;
        if (!_pressureSensitive) {
          return;
        }
        mozPressure = evt.mozPressure;
        width = (mozPressure * DrawingCanvas.pressureWeight) || 1;
        sp.minWidth = _baseLineWidth + width;
        sp.maxWidth = _baseLineWidth + width * 2;
      };
      sp.onEnd = function(evt) {
        sp.minWidth = 0.01;
        sp.maxWidth = 2.5;
      };
      _canvasContainer.appendChild(canvas);
    }

    DrawingCanvas.prototype.getImageData = function(x, y, width, height) {
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      if (width == null) {
        width = this.canvas.width;
      }
      if (height == null) {
        height = this.canvas.height;
      }
      return this.ctx.getImageData(x, y, width, height);
    };

    DrawingCanvas.prototype.toDataURL = function() {
      return this.canvas.toDataURL();
    };

    DrawingCanvas.prototype.putImageData = function(imgData, x, y) {
      this.ctx.putImageData(imgData, x || 0, y || 0);
    };

    DrawingCanvas.prototype.drawImage = function(img, x, y) {
      this.ctx.drawImage(img, x || 0, y || 0);
    };

    DrawingCanvas.prototype.getBoundingRectangle = function() {
      var height, i, imgData, width, x, xs, y, ys, _i, _j, _ref;
      _ref = this.canvas, width = _ref.width, height = _ref.height;
      imgData = this.getImageData().data;
      xs = [];
      ys = [];
      for (y = _i = 0; 0 <= height ? _i <= height : _i >= height; y = 0 <= height ? ++_i : --_i) {
        for (x = _j = 0; 0 <= width ? _j <= width : _j >= width; x = 0 <= width ? ++_j : --_j) {
          i = (y * width + x) * 4;
          if (imgData[i + 3] > 0) {
            xs.push(x);
            ys.push(y);
          }
        }
      }
      x = _.min(xs);
      y = _.min(ys);
      width = _.max(xs) - x;
      height = _.max(ys) - y;
      return {
        x: x,
        y: y,
        width: width,
        height: height
      };
    };

    DrawingCanvas.prototype.clearCanvas = function() {
      var canvas, ctx, height, width;
      canvas = this.canvas, ctx = this.ctx;
      width = canvas.width, height = canvas.height;
      canvas.width = width;
      ctx.fillStyle = PEGBAR.BACKGROUND_COLOR.toString();
      ctx.fillRect(0, 0, width, height);
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

    _onionCountBehind = 1;

    _onionCountAhead = 1;

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

    PaperStack.prototype.clearStack = function() {
      __stack__ = [];
      this.currentIndex = 0;
    };

    PaperStack.prototype.rebuildStack = function(pngDataArray) {
      var frm, i, img, _i, _len;
      this.clearStack();
      for (i = _i = 0, _len = pngDataArray.length; _i < _len; i = ++_i) {
        frm = pngDataArray[i];
        img = document.createElement('img');
        img.src = frm;
        img.style.display = "none";
        document.body.appendChild(img);
        this.newFrame(i, img);
        _.defer(function(img) {
          return document.body.removeChild(img);
        }, img);
      }
      this.reconstruct();
    };

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
        this.guideFrame = __stack__[frameIndex].canvas;
      } else if (_.isElement(frameIndex)) {
        this.guideFrame = frameIndex;
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
      __stack__[index].duration = newDuration;
    };

    PaperStack.prototype.setOnionCount = function(behindCount, aheadCount) {
      if (!_.isNonNegativeInteger(behindCount)) {
        throw "must provide a non-negative integer";
      }
      behindCount = Math.min(behindCount, 5);
      aheadCount = _.isNonNegativeInteger(aheadCount) ? Math.min(aheadCount, 5) : behindCount;
      _onionCountAhead = aheadCount;
      _onionCountBehind = behindCount;
      this.reconstruct();
    };

    PaperStack.prototype.hideOnions = function() {
      _showOnions = false;
      this.reconstruct();
    };

    PaperStack.prototype.showOnions = function() {
      _showOnions = true;
      this.reconstruct();
    };

    PaperStack.prototype.toggleOnions = function() {
      _showOnions = !_showOnions;
      this.reconstruct();
    };

    PaperStack.prototype.hideGuideFrame = function() {
      _showGuideFrame = false;
      this.reconstruct();
    };

    PaperStack.prototype.showGuideFrame = function() {
      _showGuideFrame = true;
      this.reconstruct();
    };

    PaperStack.prototype.toggleGuideFrame = function() {
      _showGuideFrame = !_showGuideFrame;
      this.reconstruct();
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
      _totalFramesDisplay.textContent = __stack__.length;
      PEGBAR.timeline.reconstruct();
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

    PaperStack.prototype.newFrame = function(atIndex, img) {
      var frame;
      if (!_.isNonNegativeInteger(atIndex)) {
        atIndex = this.currentIndex + 1;
      }
      frame = new PEGBAR.DrawingCanvas;
      if (_.isElement(img)) {
        frame.drawImage(img);
      }
      __stack__.splice(atIndex, 0, frame);
      return frame;
    };

    PaperStack.prototype.removeFrame = function(atIndex) {
      var removedFrame;
      if (!_.isNonNegativeInteger(atIndex)) {
        atIndex = this.currentIndex;
      }
      removedFrame = __stack__.splice(atIndex, 1)[0];
      if (!__stack__.length) {
        __stack__.push(new PEGBAR.DrawingCanvas);
      }
      if (this.currentIndex === __stack__.length) {
        this.currentIndex--;
      }
      return removedFrame;
    };

    PaperStack.prototype.insertTweenFrames = function() {
      var newStack;
      newStack = [];
      while (__stack__.length) {
        newStack.push(__stack__.shift(), new PEGBAR.DrawingCanvas);
      }
      newStack.pop();
      __stack__ = newStack;
      this.currentIndex = __stack__.length - 1;
    };

    PaperStack.prototype.play = function() {
      var frame, tick, _i, _len;
      if (_playing || __stack__.length === 1) {
        return this.stop();
      }
      _canvasContainer.innerHTML = "";
      for (_i = 0, _len = __stack__.length; _i < _len; _i++) {
        frame = __stack__[_i];
        frame.canvas.style.display = "none";
        _canvasContainer.appendChild(frame.canvas);
      }
      tick = (function(_this) {
        return function() {
          var nextFrame;
          __stack__[_this.currentIndex].canvas.style.display = "none";
          nextFrame = __stack__[_this.nextFrame()];
          nextFrame.canvas.style.display = "block";
          _currentFrameNumberDisplay.textContent = _this.currentIndex + 1;
          PEGBAR.timeline.incrementColors();
          return _timeout = _.delay(tick, nextFrame.duration);
        };
      })(this);
      tick();
      return _playing = true;
    };

    PaperStack.prototype.stop = function() {
      clearTimeout(_timeout);
      this.reconstruct();
      return _playing = false;
    };

    PaperStack.prototype.getBoundingRectangle = function() {
      var frame, height, maxXs, maxYs, minXs, minYs, width, x, y, _i, _len, _ref;
      minXs = [];
      maxXs = [];
      minYs = [];
      maxYs = [];
      for (_i = 0, _len = __stack__.length; _i < _len; _i++) {
        frame = __stack__[_i];
        _ref = frame.getBoundingRectangle(), x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height;
        minXs.push(x);
        maxXs.push(x + width);
        minYs.push(y);
        maxYs.push(y + height);
      }
      x = _.min(minXs) - 2;
      y = _.min(minYs) - 2;
      width = _.max(maxXs) - x + 2;
      height = _.max(maxYs) - y + 2;
      return {
        x: x,
        y: y,
        width: width,
        height: height
      };
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
      var diff, div, frameCount, timelineWidth, _i, _len;
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
      this.repaintColors();
      for (_i = 0, _len = _divStack.length; _i < _len; _i++) {
        div = _divStack[_i];
        div.style.width = "" + _divWidth + "px";
        _timelineContainer.appendChild(div);
      }
      timelineWidth = frameCount * _divWidth;
      if (timelineWidth > PEGBAR.CANVAS_WIDTH) {
        _timelineContainer.style.left = "" + (window.innerWidth / 2 - timelineWidth / 2) + "px";
      }
    };

    Timeline.prototype.addDiv = function() {
      var attr, div, i, val, _ref;
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
      i = _divStack.length;
      div.addEventListener("mousedown", (function(_this) {
        return function(evnt) {
          evnt.preventDefault();
          _paperStack.currentIndex = i;
          _paperStack.reconstruct();
          return _this.repaintColors();
        };
      })(this));
      _divStack.push(div);
    };

    Timeline.prototype.incrementColors = function() {
      var currentIndex;
      currentIndex = _paperStack.currentIndex;
      _divStack[currentIndex].style.background = "#000";
      _divStack[(currentIndex || _divStack.length) - 1].style.background = "#ddd";
    };

    Timeline.prototype.repaintColors = function() {
      var currentIndex, div, _i, _len, _ref;
      currentIndex = _paperStack.currentIndex;
      for (_i = 0, _len = _divStack.length; _i < _len; _i++) {
        div = _divStack[_i];
        div.style.background = "#ddd";
      }
      if (currentIndex > 0) {
        _divStack[currentIndex - 1].style.background = "#999";
      }
      if ((_ref = _divStack[currentIndex + 1]) != null) {
        _ref.style.background = "#999";
      }
      _divStack[currentIndex].style.background = "#000";
    };

    return Timeline;

  })();

}).call(this);
