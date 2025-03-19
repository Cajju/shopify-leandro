export default function money(
  priceAmount,
  currencyFormat = '¤{{amount}}',
  { round = false, isPriceInCents = false } = {}
) {
  if (priceAmount === '') {
    return currencyFormat.replace(/\{\{.*?\}\}/, '').trim()
  }

  if (priceAmount < 0) {
    return NaN
  }

  if (isPriceInCents) {
    priceAmount = Number(priceAmount) / 100
  }

  let formattedPrice = priceAmount !== undefined && priceAmount !== null ? Math.round(priceAmount * 100) / 100 : 0
  const currencyFormatCleanFromWhitespace = currencyFormat.replace(/\s/g, '')
  if (currencyFormatCleanFromWhitespace.indexOf('{{amount}}') > -1) {
    formattedPrice = numberWithCommas(formattedPrice.toFixed(2))
  }

  if (currencyFormatCleanFromWhitespace.indexOf('{{amount_with_comma_separator}}') > -1) {
    formattedPrice = numberWithDots((formattedPrice.toFixed(2) + '').replace('.', ','))
  }

  if (currencyFormatCleanFromWhitespace.indexOf('{{amount_no_decimals}}') > -1) {
    formattedPrice = numberWithCommas(Math.floor(priceAmount))
  }

  if (currencyFormatCleanFromWhitespace.indexOf('{{amount_no_decimals_with_comma_separator}}') > -1) {
    formattedPrice = numberWithDots(Math.floor(priceAmount) + '')
  }

  if (currencyFormatCleanFromWhitespace.indexOf('{{amount_no_decimals_with_space_separator}}') > -1) {
    formattedPrice = numberWithDots(Math.floor(priceAmount) + '')
    formattedPrice = formattedPrice.replace(/\./g, ' ')
  }

  if (round) {
    formattedPrice =
      formattedPrice.split(currencyFormat.includes('comma') ? ',' : '.')[0] +
      (currencyFormat.includes('comma') ? round.replace('.', ',') : round)
  }

  if (priceAmount === 0) {
    formattedPrice = '0.00'
  }

  const price = currencyFormat.replace(/\{\{.*?\}\}/, formattedPrice).replace(/<[^>]*>/g, '')
  return price
}

function numberWithDots(x) {
  const parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return parts.join('.')
}

function numberWithCommas(x) {
  const parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}
