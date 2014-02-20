PEGBAR = window.PEGBAR ||= {}

PEGBAR.BACKGROUND_COLOR = 
  r: 255
  g: 255
  b: 255
  a: 0.1
  toString: -> "rgba(#{@r}, #{@g}, #{@b}, #{@a})"
  getImgDataFriendlyRGBA: -> [@r, @g, @b, (@a * 255 | 0)]

PEGBAR.CANVAS_WIDTH  = +localStorage.canvas_width  or 400
PEGBAR.CANVAS_HEIGHT = +localStorage.canvas_height or 300

PEGBAR.init = ->
  @paperStack = new @PaperStack
  @timeline = new @Timeline
  @controls = new @Controls  
  @DomWrangler.centerCanvasAndTimeline()
  @DomWrangler.putControlsToTheRightOfTheCanvas()

PEGBAR.save = ->
  saveData = 
    bckgrnd: @BACKGROUND_COLOR.toString()
    width: @CANVAS_WIDTH
    height: @CANVAS_HEIGHT
  
  saveData.frms = @frms.getSaveData()
  JSON.stringify saveData

PEGBAR.open = (saveData) ->
  {bckgrnd, width, height, frms} = JSON.parse saveData
  BC = @BACKGROUND_COLOR
  [r, g, b, a] = bckgrnd.replace(/rgba\(|\)/g, '').split ', '
  BC.r = +r; BC.g = +g; BC.b = +b; BC.a = +a
  @CANVAS_WIDTH = width 
  @CANVAS_HEIGHT = height 
  @frms.loadFromSaveData frms 
  @drawingCanvas.putImageData()

do ->
  _exportingGif = false

  PEGBAR.exportGif = ->
    return if _exportingGif
    _exportingGif = true
    gif = new GIF {
      workers: 2
      quality: 10
      background: "#fff"
    }

    stack = @paperStack.getStack()
    for frm in stack 
      gif.addFrame frm.getImageData(), {copy: true, delay: frm.duration} 

    gif.on 'finished', (blob) =>
      _exportingGif = false
      window.open(URL.createObjectURL(blob))

    gif.render()

PEGBAR.exportPNGSpriteSheet = ->
  scratchCanvas = document.createElement 'canvas'
  scratchCanvas.height = @CANVAS_HEIGHT

  stack = @paperStack.getStack()
  scratchCanvas.width = @CANVAS_WIDTH * stack.length

  scratchCtx = scratchCanvas.getContext '2d'
  for frm, i in stack 
    scratchCtx.putImageData frm.getImageData(), @CANVAS_WIDTH * i, 0

  window.open scratchCanvas.toDataURL()

PEGBAR.loadImageFile = (event) ->
  input = event.target

  reader = new FileReader
  reader.onload = (event) =>
    dataURL = event.target.result
    img = document.createElement 'img'
    img.src = dataURL
    @paperStack.getCurrentFrame().drawImage img

  reader.readAsDataURL(input.files[0]);
