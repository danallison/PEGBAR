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
    exportButton = el "export"

    {paperStack} = PEGBAR
    nextButton.addEventListener "click", ->
      paperStack.nextFrame()
      paperStack.reconstruct()

    prevButton.addEventListener "click", ->
      paperStack.prevFrame()
      paperStack.reconstruct()

    newButton.addEventListener "click", ->
      paperStack.newFrame()
      paperStack.nextFrame()
      paperStack.reconstruct()

    guideButton.addEventListener "click", ->
      paperStack.setGuideFrame()
      guideButton.textContent = "guide frame set"
      _.delay ->
        guideButton.textContent = "set guide frame"
      , 1000

    deleteButton.addEventListener "click", ->
      if confirm "are you sure?"
        paperStack.removeFrame()
        paperStack.reconstruct()

    playButton.addEventListener "click", ->
      if paperStack.play()
        playButton.textContent = "stop"
      else
        playButton.textContent = "play"

    exportButton.addEventListener "click", ->
      PEGBAR.exportGif()