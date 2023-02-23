export function toUFixString(numStr) {
  const num = Number(numStr)
  if (Number.isInteger(num)) {
    return num + '.0'
  } else {
    return num.toString()
  }
}
