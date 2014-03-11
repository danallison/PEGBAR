PEGBAR = window.PEGBAR ||= {}

class PEGBAR.Controls
  el = (id) -> document.getElementById id
  durationObj = { duration: 300 }

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
      return

    prevButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      paperStack.prevFrame()
      paperStack.reconstruct()
      timeline.reconstruct()
      return

    newButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      paperStack.newFrame()
      paperStack.nextFrame()
      paperStack.reconstruct()
      timeline.reconstruct()
      return

    guideButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      paperStack.setGuideFrame()
      textFrames = [
        "set guide frame"
        "et guide frame s"
        "t guide frame se"
        "guide frame set"
      ]
      atc(guideButton)
        .frameByFrame(textFrames, {duration:500})
        .go()
      _.delay ->
        atc(guideButton)
          .frameByFrame(textFrames.reverse().concat(
              ["nset guide frame", "unset guide frame"]
            ), {duration:500})
          .go()
      , 1500
      return

    deleteButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      if confirm "are you sure?"
        paperStack.removeFrame()
        paperStack.reconstruct()
        timeline.reconstruct()
      return

    playButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      if paperStack.play()
        atc(playButton)
          .typeOver("stop", durationObj)
          .go()
      else
        atc(playButton)
          .typeOver("play", durationObj)
          .go()
      return

    exportGifButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      PEGBAR.exportGif()
      return

    exportSpriteButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      PEGBAR.exportPNGSpriteSheet()
      return

    drawEraseText = { "draw" : "erase", "erase" : "draw" }
    drawEraseButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      PEGBAR.DrawingCanvas.toggleEraser()
      atc(drawEraseButton)
        .typeOver(drawEraseText[drawEraseButton.textContent], durationObj)
        .go()
      return


    borderNone = ["red", "#ddd"]
    saveButton.addEventListener "click", (evt) ->
      evt.preventDefault()
      evt.stopPropagation()
      projName = projNameInput.value.replace(/\s/g, "_")
      unless projName

        # projNameInput.style.border = "2px solid red"
        interval = setInterval ->
          borderNone.push projNameInput.style.borderColor = borderNone.shift()
        , 100
        _.delay ->
          clearInterval interval
        , 1000
        return
      PEGBAR.save true, projName
      return




