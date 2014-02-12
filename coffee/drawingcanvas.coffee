PEGBAR = window.PEGBAR ||= {}

class PEGBAR.DrawingCanvas
  canvasContainer = null

  duration: 83

  constructor: ->
    canvasContainer ||= document.getElementById "canvas-container"
    canvas = @canvas = document.createElement "canvas"
    canvas.width  = PEGBAR.CANVAS_WIDTH
    canvas.height = PEGBAR.CANVAS_HEIGHT
    for evnt in ["down", "move", "up"]
      canvas.addEventListener "mouse#{evnt}", @["mouse#{evnt}"], false

    ctx = @ctx = canvas.getContext "2d"
    ctx.fillStyle = PEGBAR.BACKGROUND_COLOR.toString()
    ctx.fillRect 0, 0, canvas.width, canvas.height
    
    canvasContainer.appendChild canvas


  mousedown: (evnt) =>
    {ctx} = @
    ctx.beginPath()
    ctx.moveTo evnt.layerX, evnt.layerY
    @isDrawing = true
    # canvasContainer.style.cursor = "none"

  mousemove: (evnt) =>
    if @isDrawing
      {ctx} = @
      ctx.lineTo evnt.layerX, evnt.layerY
      ctx.stroke()

  mouseup: (evnt) =>
    if @isDrawing
      @mousemove evnt 
      @isDrawing = false
      # canvasContainer.style.cursor = "crosshair"

  getImageData: ->
    {width, height} = @canvas
    @ctx.getImageData 0, 0, width, height

  putImageData: (imgData) ->
    # imgData ||= PEGBAR.frms.currentFrm().imgData
    @ctx.putImageData imgData, 0, 0

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
  