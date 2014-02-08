PEGBAR = window.PEGBAR ||= {}

class PEGBAR.DomWrangler

  @centerCanvas: ->
    doc = window.document

    canvasContainer = doc.getElementById "canvas-container"
    
    canvasContainer.style.top  = "#{window.innerHeight / 2 - PEGBAR.CANVAS_HEIGHT / 2}px"
    canvasContainer.style.left = "#{window.innerWidth  / 2 - PEGBAR.CANVAS_WIDTH  / 2}px"

  @putControlsToTheRightOfTheCanvas: ->
    doc = window.document

    controlsContainer = doc.getElementById "controls-container"

    controlsContainer.style.top  = "#{window.innerHeight / 2 - PEGBAR.CANVAS_HEIGHT / 2}px"
    controlsContainer.style.left = "#{window.innerWidth  / 2 + PEGBAR.CANVAS_WIDTH  / 2 + 10}px"

  @addEventListenersToControls: ->
    