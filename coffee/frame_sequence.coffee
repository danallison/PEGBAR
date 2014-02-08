PEGBAR = window.PEGBAR ||= {}

# the frms (frames) array contains every frame in the current animation
class PEGBAR.Frms

  constructor: ->
    frms = []

    i = 0

    frms.currentIndex = -> i

    frms.currentFrm = -> @[i]

    frms.next = -> i = (i + 1) % @length; @[i]

    frms.addFrm = (imgData) -> @push new Frm imgData

    frms.updateFrm = (imgData) -> @[i].imgData = imgData

    frms.getSaveData = -> sd = []; sd.push frm.save() for frm in @; sd

    frms.loadFromSaveData = (sd) -> @pop() while @length; @addFrm frm for frm in sd; @

    return frms
  
  class Frm
    constructor: (imgData) ->
      if imgData instanceof ImageData
        @imgData = imgData
      else
        @imgData = PEGBAR.drawingCanvas.createImageData imgData

    save: ->
      {data} = @imgData
      saveData = []
      bckgrnd = PEGBAR.BACKGROUND_COLOR.getImgDataFriendlyRGBA()

      for datum, i in data 
        saveData.push [i, datum] unless datum is bckgrnd[i % 4]
      
      return saveData
    
