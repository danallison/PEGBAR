PEGBAR = window.PEGBAR ||= {}

class PEGBAR.DomWrangler

  @centerCanvasAndTimeline: ->
    doc = window.document

    canvasContainer = doc.getElementById "canvas-container"
    timelineContainer = doc.getElementById "timeline-container"
    
    canvasContainer.style.top  = "#{window.innerHeight / 2 - PEGBAR.CANVAS_HEIGHT / 2}px"
    timelineContainer.style.left = canvasContainer.style.left = "#{window.innerWidth  / 2 - PEGBAR.CANVAS_WIDTH  / 2}px"
    timelineContainer.style.top = "#{window.innerHeight / 2 + PEGBAR.CANVAS_HEIGHT / 2 + 2}px"
    return

  @putControlsToTheRightOfTheCanvas: ->
    doc = window.document

    controlsContainer = doc.getElementById "controls-container"

    controlsContainer.style.top  = "#{window.innerHeight / 2 - PEGBAR.CANVAS_HEIGHT / 2}px"
    controlsContainer.style.left = "#{window.innerWidth  / 2 + PEGBAR.CANVAS_WIDTH  / 2 + 10}px"
    return

  @addEventListenersToControls: ->
    