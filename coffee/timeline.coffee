PEGBAR = window.PEGBAR ||= {}

class PEGBAR.Timeline
  _paperStack = null
  _timelineContainer = null
  _divStack = []
  _divWidth = 10

  constructor: ->
    _paperStack = PEGBAR.paperStack
    _timelineContainer = document.getElementById "timeline-container"

  reconstruct: ->
    frameCount = _paperStack.getFrameCount()
    _divWidth = Math.max PEGBAR.CANVAS_WIDTH / frameCount - 2, 16
    diff = _divStack.length - frameCount
    if diff < 0
      @addDiv() while diff++
    else if diff > 0
      _divStack.pop() while diff--

    _timelineContainer.innerHTML = ""
    currentFrame = _paperStack.currentIndex
    for div, i in _divStack
      div.style.width = "#{_divWidth}px"      
      div.style.background = if currentFrame is i then "#999" else "#ddd"
      _timelineContainer.appendChild div

    timelineWidth = frameCount * _divWidth
    if timelineWidth > PEGBAR.CANVAS_WIDTH
      _timelineContainer.style.left = "#{window.innerWidth  / 2 - timelineWidth / 2}px"

  addDiv: ->
    div = document.createElement "div"
    div.style[attr] = val for attr, val of {
      height: "15px"
      display: "inline-block"
      border: "solid 1px #fff"
    }
    _divStack.push div 

  incrementColors: ->
    currentFrame = _paperStack.currentIndex
    _divStack[currentFrame].style.background = "#999" 
    _divStack[(currentFrame or _divStack.length) - 1].style.background = "#ddd"
