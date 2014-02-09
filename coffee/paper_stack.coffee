PEGBAR = window.PEGBAR ||= {}

class PEGBAR.PaperStack
  
  el = (id) -> document.getElementById id
  canvasContainer = null
  currentFrameNumberDisplay = null
  totalFramesDisplay = null
  stack = []

  constructor: ->
    canvasContainer = el "canvas-container"
    currentFrameNumberDisplay = el "current_frame"
    totalFramesDisplay = el "total_frames"
    @onionCountBehind = 3
    @onionCountAhead = 3
    @currentIndex = 0
    @newFrame()

  getStack: -> stack.slice()

  reconstruct: ->
    currentFrame = stack[@currentIndex]
    preceedingFrames = stack.slice(Math.max(0, @currentIndex - @onionCountBehind), @currentIndex)
    proceedingFrames = stack.slice(@currentIndex + 1, Math.min(@currentIndex + 1 + @onionCountAhead, stack.length)).reverse()
    
    layerDepth = Math.max(preceedingFrames.length, proceedingFrames.length)
    if proceedingFrames.length < layerDepth
      proceedingFrames.unshift(null) until proceedingFrames.length is layerDepth
    else if preceedingFrames.length < layerDepth
      preceedingFrames.unshift(null) until preceedingFrames.length is layerDepth
    
    canvasContainer.innerHTML = ""
    layerIndex = -1
    while layerIndex++ < layerDepth
      preFrame = preceedingFrames[layerIndex]?.canvas
      proFrame = proceedingFrames[layerIndex]?.canvas
      
      if preFrame
        preFrame.style.display = "block"
        canvasContainer.appendChild preFrame
      if proFrame 
        proFrame.style.display = "block"
        canvasContainer.appendChild proFrame
      
      canvasContainer.appendChild @newOnionLayer() if preFrame or proFrame

    if @guideFrame
      canvasContainer.appendChild @guideFrame 
      canvasContainer.appendChild @newOnionLayer()

    canvasContainer.appendChild currentFrame.canvas
    currentFrameNumberDisplay.textContent = @currentIndex + 1
    totalFramesDisplay.textContent = stack.length


  newOnionLayer: ->
    onion = document.createElement "div"
    onion.className = "onion"
    onion.style.height = "#{PEGBAR.CANVAS_HEIGHT}px"
    onion.style.width = "#{PEGBAR.CANVAS_WIDTH}px"
    return onion

  prevFrame: ->
    @currentIndex = (@currentIndex - 1 + stack.length) % stack.length

  nextFrame: ->
    @currentIndex = (@currentIndex + 1) % stack.length

  newFrame: (atIndex) ->
    atIndex = @currentIndex + 1 unless atIndex?
    stack.splice atIndex, 0, new PEGBAR.DrawingCanvas

  removeFrame: (atIndex) ->
    atIndex = @currentIndex unless atIndex?
    stack.splice atIndex, 1
    stack.push new PEGBAR.DrawingCanvas unless stack.length
    @currentIndex-- if @currentIndex is stack.length

  insertTweenFrames: ->
    newStack = []
    newStack.push stack.shift(), new PEGBAR.DrawingCanvas while stack.length
    newStack.pop()
    stack = newStack
    @currentIndex = stack.length - 1

  play: ->
    return @stop() if @playing
    canvasContainer.innerHTML = ""
    for frame in stack
      frame.canvas.style.display = "none"
      canvasContainer.appendChild(frame.canvas)

    tick = =>
      stack[@currentIndex].canvas.style.display = "none"
      stack[@nextFrame()].canvas.style.display = "block"
    
    tick()
    @interval = setInterval tick, 1000 / 12
    @playing = true

  stop: ->
    clearInterval(@interval)
    @playing = false
    @reconstruct()

