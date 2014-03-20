PEGBAR = window.PEGBAR ||= {}

PEGBAR.BACKGROUND_COLOR = 
  r: 255
  g: 255
  b: 255
  a: 0
  toString: -> "rgba(#{@r}, #{@g}, #{@b}, #{@a})"
  toStringOpaque: ->  "rgba(#{@r}, #{@g}, #{@b}, 1)"
  getImgDataFriendlyRGBA: -> [@r, @g, @b, (@a * 255 | 0)]

PEGBAR.CANVAS_WIDTH  = +localStorage.canvas_width  or 400
PEGBAR.CANVAS_HEIGHT = +localStorage.canvas_height or 300

PEGBAR.init = ->
  atc.frameRate 1000 / 12
  @atcTitle = atc "#pegbar_title"
  @paperStack = new @PaperStack
  @timeline = new @Timeline
  @controls = new @Controls  
  @DomWrangler.centerCanvasAndTimeline()
  @DomWrangler.putControlsToTheRightOfTheCanvas()

  # document.getElementById("pegbar_title").addEventListener "mouseover", ->
  #   spclChars = _.shuffle '. , / ? : | = + - _ * & ^ % $ # @ ! ~ `'.split ' '
  #   charToTitle = (c) -> "#{c}PEG#{c}BAR#{c}"
  #   titleFrames = (charToTitle(chr) for chr in _.first spclChars, 20)
  #   PEGBAR.atcTitle.clearTimeline()
  #     .frameByFrame(titleFrames, { loops: 1, duration: 1200 })
  #     .go()
  return

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
    scratchFrm = new @DrawingCanvas
    {width, height} = scratchFrm.canvas
    opaqueBackground = PEGBAR.BACKGROUND_COLOR.toStringOpaque()
    for frm in stack 
      scratchFrm.clearCanvas()
      scratchFrm.ctx.fillStyle = opaqueBackground
      scratchFrm.ctx.fillRect 0, 0, width, height
      scratchFrm.ctx.globalCompositeOperation = 'source-over'
      scratchFrm.drawImage frm.canvas
      gif.addFrame scratchFrm.getImageData(), {copy: true, delay: frm.duration} 

    gif.on 'finished', (blob) =>
      _exportingGif = false
      window.open(URL.createObjectURL(blob))

    gif.render()
    return
  return

PEGBAR.exportPNGSpriteSheet = ->
  spriteCanvas = document.createElement 'canvas'
  spriteCanvas.height = @CANVAS_HEIGHT

  stack = @paperStack.getStack()
  spriteCanvas.width = @CANVAS_WIDTH * stack.length

  spriteCtx = spriteCanvas.getContext '2d'
  for frm, i in stack 
    spriteCtx.putImageData frm.getImageData(), @CANVAS_WIDTH * i, 0

  window.open spriteCanvas.toDataURL()
  return

PEGBAR.exportTrimmedPNGSpriteSheet = ->
  {x, y} = @paperStack.getBoundingRectangle()
  [minX, maxX] = x
  [minY, maxY] = y
  width = maxX - minX
  height = maxY - minY

  stack = @paperStack.getStack()
  spriteCanvas = document.createElement 'canvas'
  spriteCanvas.height = height
  spriteCanvas.width = width * stack.length

  spriteCtx = spriteCanvas.getContext '2d'
  for frm, i in stack 
    spriteCtx.putImageData frm.getImageData(minX, minY, width, height), width * i, 0

  window.open spriteCanvas.toDataURL()
  return

PEGBAR.loadFile = (evnt) ->
  input = evnt.target
  # console.log event
  file = input.files[0]
  fileName = file.name.split '.'
  fileExtension = fileName.pop()
  projName = fileName.join '.'
  reader = new FileReader
  if fileExtension is 'pegbar'
    reader.onload = (e) => @open e.target.result; return
    reader.readAsText file
  else
    reader.onload = (e) =>
      dataURL = e.target.result
      img = document.createElement 'img'
      img.src = dataURL
      @paperStack.getCurrentFrame().drawImage img
      return

    reader.readAsDataURL file
    return

do ->
  _docTemplate = _.template """
    <!doctype html>
    <head>
      <meta charset=\"utf-8\">
      <title><%= projName %></title>
    </head>
    <body>
      <div>
        This is a <a href=\"https://github.com/danallison/-PEG-BAR-\">*PEG*BAR*</a> project file, created <%= new Date().toString() %>.
      </div>
      <hr>
      <div>
        project name: <%= projName %> <br>
        dimensions: <%= dimensions[0] %> x <%= dimensions[1] %> <br>
        frame count: <%= frameCount %> <br>
        duration: <%= totalDuration %> milliseconds
      </div>
    <%= frames %>
    </body>
    """
  
  _frameTemplate = _.template """
    <hr>
    <div> 
      frame <%= frameNumber %> <br> 
      duration: <%= duration %> milliseconds <br>
      <img src=\"<%= dataURL %>\">
    </div>
    """

  PEGBAR.save = (download, fileName = 'unnamed_project') ->
    stack = @paperStack.getStack()
    dataURLs = _.invoke stack, 'toDataURL'
    durations = _.pluck stack, 'duration'
    totalDuration = _.reduce durations, ((d, m) -> d + m), 0
    
    # guideFrameStack
    if download
      {width, height} = stack[0].canvas
      frameCount = stack.length
      frames = dataURLs.map((dataURL, i) -> 
        _frameTemplate { 
          dataURL: dataURL
          frameNumber: i + 1 
          duration: durations[i] 
        }
      ).join ''
      dataString = _docTemplate { 
        projName: fileName
        dimensions: [width, height]
        frameCount: frameCount
        totalDuration: totalDuration
        frames: frames 
      }
      blob = new Blob([dataString], {type: 'text/plain'})
      a = document.createElement 'a'
      a.download = "#{fileName}.pegbar"
      a.href = URL.createObjectURL(blob)
      a.dataset.downloadurl = ['text/plain', a.download, a.href].join ':'

      a.style.display = "none"
      document.body.appendChild a # Firefox requires the element to be in the dom for this to work
      a.click()
      document.body.removeChild a

      a.dataset.disabled = true

      # Need a small delay for the revokeObjectURL to work properly.
      setTimeout ->
        URL.revokeObjectURL a.href
      , 1500
    else
      localStorage.project = dataURLs.join '\n'
    return

  PEGBAR.open = (dataString) ->
    if dataString
      frames = dataString.match(/data\:image\/png.+?\"/g).map((str) -> str.substring(0, str.length - 1) )
    else if dataString = localStorage.project
      frames = dataString.split '\n'
    else
      throw 'nothing to open'

    @paperStack.rebuildStack frames
    return
  return
      


