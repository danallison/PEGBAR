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
    @repaintColors()
    for div in _divStack
      div.style.width = "#{_divWidth}px"      
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
    
    i = _divStack.length
    div.addEventListener "mousedown", (evnt) =>
      evnt.preventDefault()
      _paperStack.currentIndex = i
      _paperStack.reconstruct()
      @repaintColors()

    _divStack.push div 

  incrementColors: ->
    {currentIndex} = _paperStack
    _divStack[currentIndex].style.background = "#000" 
    _divStack[(currentIndex or _divStack.length) - 1].style.background = "#ddd"

  repaintColors: ->
    {currentIndex} = _paperStack
    div.style.background = "#ddd" for div in _divStack
    _divStack[currentIndex - 1].style.background = "#999" if currentIndex > 0
    _divStack[currentIndex + 1]?.style.background = "#999"
    _divStack[currentIndex].style.background = "#000" 