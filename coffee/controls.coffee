PEGBAR = window.PEGBAR ||= {}

class PEGBAR.Controls
  el = (id) -> document.getElementById id

  constructor: ->
    @nextButton = el "next"
    @prevButton = el "prev"
    @newButton  = el "new"
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
      paperStack.reconstruct()

    @playButton.addEventListener "click", ->
      paperStack.play()

    @exportButton.addEventListener "click", ->
      PEGBAR.exportGif()