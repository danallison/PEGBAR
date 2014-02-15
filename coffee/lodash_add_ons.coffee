_.isInteger = (n) -> n is n | 0

_.isPositiveNumber = (n) -> _.isNumber(n) and n > 0

_.isPositiveInteger = (n) -> _.isPositiveNumber(n) and _.isInteger(n)

_.isNonNegativeNumber = (n) -> _.isNumber(n) and n >= 0

_.isNonNegativeInteger = (n) -> _.isNonNegativeNumber(n) and _.isInteger(n)

_.removeAt = (array, indexesToRemove) ->
  if typeof indexesToRemove is 'number'
    indexesToRemove = [].slice.call(arguments, 1).sort()
  else
    indexesToRemove = indexesToRemove.slice().sort()
  
  slideBack = 0
  while indexesToRemove.length
    index = indexesToRemove.shift() - slideBack
    array.splice index, 1
    slideBack++

  return array