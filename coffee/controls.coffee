PEGBAR = window.PEGBAR ||= {}

class PEGBAR.Controls
  el = (id) -> document.getElementById id

  constructor: ->
    @nextButton = el "next"
    @prevButton = el "prev"
    @newButton  = el "new"
    @playButton = el "play"

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