PEGBAR = window.PEGBAR ||= {}

class PEGBAR.PaperStack
  _singleton = null  
  _el = (id) -> document.getElementById id
  _canvasContainer = null
  _currentFrameNumberDisplay = null
  _totalFramesDisplay = null
  _showOnions = true
  _showGuideFrame = true
  _onionCountBehind = 1
  _onionCountAhead = 1
  _playing = false
  _timeout = null
  
  __stack__ = []

  currentIndex: 0

  constructor: ->
    return _singleton if _singleton
    _singleton = @
    _canvasContainer = _el "canvas-container"
    _currentFrameNumberDisplay = _el "current_frame"
    _totalFramesDisplay = _el "total_frames"
    @newFrame()

  clearStack: ->
    __stack__ = []
    @currentIndex = 0
    return

  rebuildStack: (pngDataArray) ->
    @clearStack()
    for frm, i in pngDataArray
      img = document.createElement 'img'
      img.src = frm 
      img.style.display = "none"
      document.body.appendChild img # Firefox requires the element to be in the dom for this to work
      @newFrame i, img
      _.defer (img) -> 
        document.body.removeChild img
      , img
    @reconstruct()
    return

  getStack: -> return __stack__.slice()

  getCurrentFrame: -> return __stack__[@currentIndex]

  getFrameCount: -> return __stack__.length

  setGuideFrame: (frameIndex = @currentIndex) ->
    if _.isNonNegativeInteger frameIndex
      @guideFrame = __stack__[frameIndex].canvas 
    else if _.isElement frameIndex
      @guideFrame = frameIndex
    else
      throw "expecting a positive integer or DOM element, instead got #{frameIndex}"
    return

  setFrameDuration: (newDuration, index = @currentIndex) ->
    throw "new duration must be a positive number" unless _.isPositiveNumber newDuration
    throw "index must be a non-negative integer" unless _.isNonNegativeInteger index
    __stack__[index].duration = newDuration
    return

  setOnionCount: (behindCount, aheadCount) ->
    throw "must provide a non-negative integer" unless _.isNonNegativeInteger(behindCount)
    behindCount = Math.min behindCount, 5
    aheadCount = if _.isNonNegativeInteger(aheadCount) then Math.min(aheadCount, 5) else behindCount
    _onionCountAhead = aheadCount
    _onionCountBehind = behindCount
    @reconstruct()
    return

  hideOnions: ->
    _showOnions = false
    @reconstruct()
    return

  showOnions: ->
    _showOnions = true
    @reconstruct()
    return

  toggleOnions: ->
    _showOnions = not _showOnions
    @reconstruct()
    return

  hideGuideFrame: ->
    _showGuideFrame = false
    @reconstruct()
    return

  showGuideFrame: ->
    _showGuideFrame = true
    @reconstruct()
    return

  toggleGuideFrame: ->
    _showGuideFrame = not _showGuideFrame
    @reconstruct()
    return

  reconstruct: ->
    currentFrame = __stack__[@currentIndex]
    _canvasContainer.innerHTML = ""
    if _showOnions and _onionCountBehind + _onionCountAhead > 0
      preceedingFrames = __stack__.slice(Math.max(0, @currentIndex - _onionCountBehind), @currentIndex)
      proceedingFrames = __stack__.slice(@currentIndex + 1, Math.min(@currentIndex + 1 + _onionCountAhead, __stack__.length)).reverse()
      
      layerDepth = Math.max(preceedingFrames.length, proceedingFrames.length)
      if proceedingFrames.length < layerDepth
        proceedingFrames.unshift(null) until proceedingFrames.length is layerDepth
      else if preceedingFrames.length < layerDepth
        preceedingFrames.unshift(null) until preceedingFrames.length is layerDepth
      
      layerIndex = -1
      while layerIndex++ < layerDepth
        preFrame = preceedingFrames[layerIndex]?.canvas
        proFrame = proceedingFrames[layerIndex]?.canvas
        
        if preFrame
          preFrame.style.display = "block"
          _canvasContainer.appendChild preFrame
        if proFrame 
          proFrame.style.display = "block"
          _canvasContainer.appendChild proFrame
        
        _canvasContainer.appendChild @newOnionLayer() if preFrame or proFrame

    if _showGuideFrame and @guideFrame
      _canvasContainer.appendChild @guideFrame 
      _canvasContainer.appendChild @newOnionLayer()

    currentFrame.canvas.style.display = "block"
    _canvasContainer.appendChild currentFrame.canvas
    _currentFrameNumberDisplay.textContent = @currentIndex + 1
    _totalFramesDisplay.textContent = __stack__.length
    PEGBAR.timeline.reconstruct()
    return


  newOnionLayer: ->
    onion = document.createElement "div"
    onion.className = "onion"
    onion.style.height = "#{PEGBAR.CANVAS_HEIGHT}px"
    onion.style.width = "#{PEGBAR.CANVAS_WIDTH}px"
    return onion

  prevFrame: ->
    return @currentIndex = (@currentIndex - 1 + __stack__.length) % __stack__.length

  nextFrame: ->
    return @currentIndex = (@currentIndex + 1) % __stack__.length

  newFrame: (atIndex, img) ->
    atIndex = @currentIndex + 1 unless _.isNonNegativeInteger atIndex
    frame = new PEGBAR.DrawingCanvas
    frame.drawImage(img) if _.isElement img
    __stack__.splice atIndex, 0, frame
    return frame

  removeFrame: (atIndex) ->
    atIndex = @currentIndex unless _.isNonNegativeInteger atIndex
    [removedFrame] = __stack__.splice atIndex, 1
    __stack__.push new PEGBAR.DrawingCanvas unless __stack__.length
    @currentIndex-- if @currentIndex is __stack__.length
    return removedFrame

  insertTweenFrames: ->
    newStack = []
    newStack.push __stack__.shift(), new PEGBAR.DrawingCanvas while __stack__.length
    newStack.pop()
    __stack__ = newStack
    @currentIndex = __stack__.length - 1
    return

  play: ->
    return @stop() if _playing or __stack__.length is 1
    _canvasContainer.innerHTML = ""
    for frame in __stack__
      frame.canvas.style.display = "none"
      _canvasContainer.appendChild(frame.canvas)

    tick = =>
      __stack__[@currentIndex].canvas.style.display = "none"
      nextFrame = __stack__[@nextFrame()]
      nextFrame.canvas.style.display = "block"
      _currentFrameNumberDisplay.textContent = @currentIndex + 1
      PEGBAR.timeline.incrementColors()
      _timeout = _.delay tick, nextFrame.duration
    
    tick()
    return _playing = true

  stop: ->
    clearTimeout(_timeout)
    @reconstruct()
    return _playing = false

  getBoundingRectangle: ->
    minXs = []; maxXs = []
    minYs = []; maxYs = []
    for frame in __stack__
      {x, y, width, height} = frame.getBoundingRectangle()
      minXs.push x; maxXs.push x + width
      minYs.push y; maxYs.push y + height

    x = _.min(minXs) - 2
    y = _.min(minYs) - 2
    width  = _.max(maxXs) - x + 2
    height = _.max(maxYs) - y + 2
    return {
      x: x
      y: y
      width: width
      height: height
    } 
    

