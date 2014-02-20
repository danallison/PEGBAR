PEGBAR = window.PEGBAR ||= {}

class PEGBAR.DrawingCanvas
  canvasContainer = null

  duration: 83

  constructor: ->
    canvasContainer ||= document.getElementById "canvas-container"
    canvas = @canvas = document.createElement "canvas"
    canvas.width  = PEGBAR.CANVAS_WIDTH
    canvas.height = PEGBAR.CANVAS_HEIGHT
    eventNames = {
      "mousedown" : "touchstart"
      "mousemove" : "touchmove"
      "mouseup"   : "touchend"
    }
    for mouseEvent, touchEvent of eventNames
      canvas.addEventListener mouseEvent, @[mouseEvent], false
      canvas.addEventListener touchEvent, @[mouseEvent], false

    ctx = @ctx = canvas.getContext "2d"
    ctx.fillStyle = PEGBAR.BACKGROUND_COLOR.toString()
    ctx.fillRect 0, 0, canvas.width, canvas.height
    
    canvasContainer.appendChild canvas


  mousedown: (evnt) =>
    evnt.preventDefault()
    {ctx} = @
    ctx.beginPath()
    ctx.moveTo evnt.layerX, evnt.layerY
    @isDrawing = true
    # canvasContainer.style.cursor = "none"

  mousemove: (evnt) =>
    evnt.preventDefault()
    if @isDrawing
      {ctx} = @
      ctx.lineTo evnt.layerX, evnt.layerY
      ctx.lineCap = "round"
      ctx.lineWidth = 1
      ctx.stroke()

  mouseup: (evnt) =>
    evnt.preventDefault()
    if @isDrawing
      # @mousemove evnt 
      @isDrawing = false
      # canvasContainer.style.cursor = "crosshair"

  getImageData: ->
    {width, height} = @canvas
    @ctx.getImageData 0, 0, width, height

  toDataURL: ->
    @canvas.toDataURL()

  # getBlob: ->
  #   @canvas.toBlob()

  putImageData: (imgData, x, y) ->
    # imgData ||= PEGBAR.frms.currentFrm().imgData
    @ctx.putImageData imgData, x or 0, y or 0

  drawImage: (img, x, y) ->
    @ctx.drawImage img, x or 0, y or 0

  createImageData: (compressedImgData) ->
    {WIDTH, HEIGHT} = PEGBAR
    imgData = @ctx.createImageData WIDTH, HEIGHT
    bckgrnd = PEGBAR.BACKGROUND_COLOR.getImgDataFriendlyRGBA()
    imgData[i] = bckgrnd[i % 4] for i in [0...WIDTH * HEIGHT * 4]
    if compressedImgData
      for datum in compressedImgData
        [i, val] = datum
        imgData[i] = val
    return imgData


  clearCanvas: ->
    {canvas, ctx} = @
    {width, height} = canvas
    canvas.width = width
    ctx.fillStyle = PEGBAR.BACKGROUND_COLOR.toString()
    ctx.fillRect 0, 0, width, height
  