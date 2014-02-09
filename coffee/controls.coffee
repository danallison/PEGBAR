PEGBAR = window.PEGBAR ||= {}

class PEGBAR.Controls
  el = (id) -> document.getElementById id

  constructor: ->
    @nextButton = el "next"
    @prevButton = el "prev"
    @newButton  = el "new"
    @deleteButton  = el "delete"
    @playButton = el "play"
    @exportButton = el "export"

    {paperStack} = PEGBAR
    @nextButton.addEventListener "click", ->
      paperStack.nextFrame()
      paperStack.reconstruct()

    @prevButton.addEventListener "click", ->
      paperStack.prevFrame()
      paperStack.reconstruct()

    @newButton.addEventListener "click", ->
      paperStack.newFrame()
      paperStack.nextFrame()
      paperStack.reconstruct()

    @deleteButton.addEventListener "click", =>
      if confirm "are you sure?"
        paperStack.removeFrame()
        paperStack.reconstruct()

    @playButton.addEventListener "click", =>
      if paperStack.playing
        paperStack.stop()
        @playButton.textContent = "play"
      else
        paperStack.play()
        @playButton.textContent = "stop"

    @exportButton.addEventListener "click", ->
      PEGBAR.exportGif()