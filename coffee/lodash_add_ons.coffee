_.isInteger = (n) -> n is n | 0

_.isPositiveNumber = (n) -> _.isNumber(n) and n > 0

_.isPositiveInteger = (n) -> _.isPositiveNumber(n) and _.isInteger(n)

_.isNonNegativeNumber = (n) -> _.isNumber(n) and n >= 0

_.isNonNegativeInteger = (n) -> _.isNonNegativeNumber(n) and _.isInteger(n)
