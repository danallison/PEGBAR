_.isInteger = (n) -> return n is n | 0

_.isPositiveNumber = (n) -> return _.isNumber(n) and n > 0

_.isPositiveInteger = (n) -> return _.isPositiveNumber(n) and _.isInteger(n)

_.isNonNegativeNumber = (n) -> return _.isNumber(n) and n >= 0

_.isNonNegativeInteger = (n) -> return _.isNonNegativeNumber(n) and _.isInteger(n)
