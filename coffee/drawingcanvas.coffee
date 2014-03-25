PEGBAR = window.PEGBAR ||= {}

class PEGBAR.DrawingCanvas
  _canvasContainer = null
  _pressureSensitive = _.isNumber(new MouseEvent('move').mozPressure)
  _baseLineWidth = 0
  _lineCap = 'round'
  _globalCompositeOp = 'source-over'

  _eraserActive = false

  @pressureWeight: 2
  @toggleEraser: -> 
    if _eraserActive 
      _eraserActive = false
      _baseLineWidth = 0
      _globalCompositeOp = 'source-over'
    else 
      _eraserActive = true
      _baseLineWidth = 5
      _globalCompositeOp = 'destination-out'
    return

  duration: 83

  constructor: (width, height) ->
    _canvasContainer ||= document.getElementById "canvas-container"
    canvas = @canvas = document.createElement "canvas"
    canvas.width  = width  or PEGBAR.CANVAS_WIDTH
    canvas.height = height or PEGBAR.CANVAS_HEIGHT
    
    ctx = @ctx = canvas.getContext "2d"
    ctx.fillStyle = PEGBAR.BACKGROUND_COLOR.toString()
    ctx.fillRect 0, 0, canvas.width, canvas.height

    sp = @sp = new SignaturePad canvas
    sp.minWidth = 0.01
    sp.maxWidth = 2.5
    sp.velocityFilterWeight = 1
    sp.onBegin = (evt) ->
      ctx.globalCompositeOperation = _globalCompositeOp
      sp.onMove evt
      return
    sp.onMove = (evt) ->
      return unless _pressureSensitive
      {mozPressure} = evt
      width = (mozPressure * DrawingCanvas.pressureWeight) or 1
      sp.minWidth = _baseLineWidth + width
      sp.maxWidth = _baseLineWidth + width * 2
      return
    sp.onEnd = (evt) ->
      sp.minWidth = 0.01
      sp.maxWidth = 2.5
      return
    
    _canvasContainer.appendChild canvas

  getImageData: (x = 0, y = 0, width = @canvas.width, height = @canvas.height) ->
    return @ctx.getImageData x, y, width, height

  toDataURL: -> return @canvas.toDataURL()

  putImageData: (imgData, x, y) ->
    # imgData ||= PEGBAR.frms.currentFrm().imgData
    @ctx.putImageData imgData, x or 0, y or 0
    return

  drawImage: (img, x, y) ->
    @ctx.drawImage img, x or 0, y or 0
    return

  getBoundingRectangle: ->
    {width, height} = @canvas
    imgData = @getImageData().data
    xs = []; ys = []
    for y in [0..height]
      for x in [0..width]
        i = (y * width + x) * 4
        if imgData[i + 3] > 0
          xs.push x
          ys.push y

    x = _.min xs
    y = _.min ys
    width = _.max(xs) - x
    height = _.max(ys) - y
    return { 
      x: x
      y: y
      width: width
      height: height
    }


  clearCanvas: ->
    {canvas, ctx} = @
    {width, height} = canvas
    canvas.width = width
    ctx.fillStyle = PEGBAR.BACKGROUND_COLOR.toString()
    ctx.fillRect 0, 0, width, height
    return
  