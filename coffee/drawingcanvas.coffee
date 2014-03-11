PEGBAR = window.PEGBAR ||= {}

class PEGBAR.DrawingCanvas
  _canvasContainer = null
  _pressureSensitive = _.isNumber(new MouseEvent('move').mozPressure)
  _baseLineWidth = 1 - (+_pressureSensitive / 2)
  _lineCap = 'round'
  _globalCompositeOp = 'source-over'
  _getLineWidth = if _pressureSensitive
    (evnt) -> _baseLineWidth + evnt.mozPressure * 2
  else
    -> _baseLineWidth

  _eventNames = 
    "mousedown" : "touchstart"
    "mousemove" : "touchmove"
    "mouseup"   : "touchend"
  
  _addListener = if 'ontouchstart' of document.body
    (dc, cnv, mouseEvent, touchEvent) ->
      cnv.addEventListener touchEvent, dc[mouseEvent], false
  else 
    (dc, cnv, mouseEvent) ->
      cnv.addEventListener mouseEvent, dc[mouseEvent], false

  _eraserActive = false
  _drawQueue = []
  _draw = do ->
    drawing = false
    newPath = if _pressureSensitive
      (ctx, x, y) ->
        ctx.beginPath()
        ctx.moveTo x, y
    else 
      _.noop
    return (ctx) ->
      return if drawing
      drawing = true
      _.defer ->
        console.log _drawQueue.length
        while _drawQueue.length
          [x, y, lineWidth] = _drawQueue.shift()
          ctx.lineTo x, y
          ctx.lineWidth = lineWidth
          ctx.stroke()
          newPath ctx, x, y
        drawing = false

  @toggleEraser: -> 
    if _eraserActive 
      _eraserActive = false
      _baseLineWidth = 1 - (+_pressureSensitive / 2)
      _globalCompositeOp = 'source-over'
    else 
      _eraserActive = true
      _baseLineWidth = 5
      _globalCompositeOp = 'destination-out'
    return

  duration: 83

  constructor: ->
    _canvasContainer ||= document.getElementById "canvas-container"
    canvas = @canvas = document.createElement "canvas"
    canvas.width  = PEGBAR.CANVAS_WIDTH
    canvas.height = PEGBAR.CANVAS_HEIGHT
    
    _addListener(@, canvas, mouseEvent, touchEvent) for mouseEvent, touchEvent of _eventNames  

    ctx = @ctx = canvas.getContext "2d"
    ctx.fillStyle = PEGBAR.BACKGROUND_COLOR.toString()
    ctx.fillRect 0, 0, canvas.width, canvas.height
    
    _canvasContainer.appendChild canvas


  mousedown: (evnt) =>
    evnt.preventDefault()
    _drawQueue = []
    {ctx} = @
    ctx.globalCompositeOperation = _globalCompositeOp
    ctx.lineCap = _lineCap
    ctx.beginPath()
    ctx.moveTo evnt.layerX, evnt.layerY
    @isDrawing = true
    return

  mousemove: (evnt) =>
    evnt.preventDefault()
    if @isDrawing
      _drawQueue.push [evnt.layerX, evnt.layerY, _getLineWidth(evnt)]
      _draw @ctx
    return    

  mouseup: (evnt) =>
    evnt.preventDefault()
    @isDrawing = false
    return

  getImageData: ->
    {width, height} = @canvas
    return @ctx.getImageData 0, 0, width, height

  toDataURL: -> return @canvas.toDataURL()

  putImageData: (imgData, x, y) ->
    # imgData ||= PEGBAR.frms.currentFrm().imgData
    @ctx.putImageData imgData, x or 0, y or 0
    return

  drawImage: (img, x, y) ->
    @ctx.drawImage img, x or 0, y or 0
    return

  clearCanvas: ->
    {canvas, ctx} = @
    {width, height} = canvas
    canvas.width = width
    ctx.fillStyle = PEGBAR.BACKGROUND_COLOR.toString()
    ctx.fillRect 0, 0, width, height
    return
  