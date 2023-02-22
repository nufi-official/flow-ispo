export function toUFixString(numStr) {
  const num = Number(numStr)
  if (Number.isInteger(num)) {
    return num + '.0'
  } else {
    return num.toString()
  }
}

export const formatCompactAmount = (amount) => {
  if (!(typeof amount === 'string' || typeof amount === 'number')) return null
  // TODO consider parseFloat & form validation to use '.' for decimals
  const number = typeof amount === 'string' ? parseInt(amount) : amount
  const formatter = Intl.NumberFormat('en', {notation: 'compact'})
  return formatter.format(number)
}
