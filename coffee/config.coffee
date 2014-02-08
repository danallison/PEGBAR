PEGBAR = window.PEGBAR ||= {}

PEGBAR.BACKGROUND_COLOR = 
  r: 255
  g: 255
  b: 255
  a: 0.1
  toString: -> "rgba(#{@r}, #{@g}, #{@b}, #{@a})"
  getImgDataFriendlyRGBA: -> [@r, @g, @b, (@a * 255 | 0)]

PEGBAR.CANVAS_WIDTH  = 400
PEGBAR.CANVAS_HEIGHT = 300

PEGBAR.init = ->
  @paperStack = new @PaperStack
  @controls = new @Controls  
  @DomWrangler.centerCanvas()
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

PEGBAR.exportGif = ->
  gif = new GIF {
    workers: 2
    quality: 10
    background: "#fff"
  }

  stack = @paperStack.getStack()
  for frm in stack 
    gif.addFrame frm.getImageData(), {copy: true, delay: 83} 

  gif.on 'finished', (blob) ->
    window.open(URL.createObjectURL(blob))

  gif.render();

