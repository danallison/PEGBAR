PEGBAR = window.PEGBAR ||= {}

class PEGBAR.Controls
  el = (id) -> document.getElementById id

  constructor: ->
    nextButton = el "next"
    prevButton = el "prev"
    newButton  = el "new"
    guideButton = el "guide"
    deleteButton  = el "delete"
    playButton = el "play"
    exportGifButton = el "export_gif"
    exportSpriteButton = el "export_sprite"
    drawEraseButton = el "draw_erase"
    saveButton = el "save_proj"

    projNameInput = el "proj_name"

    {paperStack, timeline} = PEGBAR
    nextButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      paperStack.nextFrame()
      paperStack.reconstruct()
      timeline.reconstruct()

    prevButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      paperStack.prevFrame()
      paperStack.reconstruct()
      timeline.reconstruct()

    newButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      paperStack.newFrame()
      paperStack.nextFrame()
      paperStack.reconstruct()
      timeline.reconstruct()

    guideButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      paperStack.setGuideFrame()
      guideButton.textContent = "guide frame set"
      _.delay ->
        guideButton.textContent = "set guide frame"
      , 1000

    deleteButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      if confirm "are you sure?"
        paperStack.removeFrame()
        paperStack.reconstruct()
        timeline.reconstruct()

    playButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      if paperStack.play()
        playButton.textContent = "stop"
      else
        playButton.textContent = "play"

    exportGifButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      PEGBAR.exportGif()

    exportSpriteButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      PEGBAR.exportPNGSpriteSheet()

    drawEraseText = { "draw" : "erase", "erase" : "draw" }
    drawEraseButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      PEGBAR.DrawingCanvas.toggleEraser()
      drawEraseButton.textContent = drawEraseText[drawEraseButton.textContent]      

    saveButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      projName = projNameInput.value.replace(/\s/g, "_") or "unnamed_project"
      PEGBAR.save true, projName
