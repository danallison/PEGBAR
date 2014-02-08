PEGBAR = window.PEGBAR ||= {}

class PEGBAR.PaperStack
  
  canvasContainer = null
  stack = []

  constructor: ->
    canvasContainer ||= document.getElementById "canvas-container"
    @currentIndex = 0
    @newFrame()

  getStack: -> stack.slice()

  reconstruct: ->
    currentFrame = stack[@currentIndex]
    preceedingFrames = stack.slice(0, @currentIndex)
    proceedingFrames = stack.slice(@currentIndex + 1, stack.length).reverse()
    
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

      canvasContainer.appendChild @newOnionLayer()

    canvasContainer.appendChild currentFrame.canvas


  newOnionLayer: ->
    onion = document.createElement "div"
    onion.className = "onion"
    onion.style.height = "#{PEGBAR.CANVAS_HEIGHT}px"
    onion.style.width = "#{PEGBAR.CANVAS_WIDTH}px"
    return onion

  nextFrame: ->
    @currentIndex = (@currentIndex + 1) % stack.length

  newFrame: ->
    stack.push new PEGBAR.DrawingCanvas
    @currentIndex = stack.length - 1

  prevFrame: ->
    @currentIndex = (@currentIndex - 1 + stack.length) % stack.length

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

