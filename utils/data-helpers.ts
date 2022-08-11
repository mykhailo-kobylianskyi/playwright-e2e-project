export function removeSpaces(string) {
  return string.replace(/\s+/g, '')
}
export function getCurrentTimeFormated(hoursInFuture) {
  let time = new Date()
  let hour = (time.getHours() + hoursInFuture) % 24
  let minute = time.getMinutes()
  minute = 15 * Math.floor(minute / 15)
  if (minute < 10) {
    return `${hour.toString()}:0${minute.toString()}`
  } else {
    return `${hour.toString()}:${minute.toString()}`
  }
}

export function mapCurrencyWithIndex(currency) {
  switch (currency) {
    case '$ (AUD)': {
      return 1
    }
    case 'Fr. (CHF)': {
      return 2
    }
    case '€ (EUR)': {
      return 3
    }
    case '£ (GBP)': {
      return 4
    }
    case '¥ (JPY)': {
      return 5
    }
    default: {
      return 6
    }
  }
}

export function formatDate(option: string, { dd, mm, yyyy }) {
  let apendix = 'th'
  if (dd[1] == '1') {
    apendix = 'st'
  }
  if (dd[1] == '2') {
    apendix = 'nd'
  }
  if (dd[1] == '3') {
    apendix = 'rd'
  }
  let month
  switch (mm) {
    case '01': {
      month = 'January'
      break
    }
    case '02': {
      month = 'February'
      break
    }
    case '03': {
      month = 'March'
      break
    }
    case '04': {
      month = 'April'
      break
    }
    case '05': {
      month = 'May'
      break
    }
    case '06': {
      month = 'June'
      break
    }
    case '07': {
      month = 'July'
      break
    }
    case '08': {
      month = 'August'
      break
    }
    case '09': {
      month = 'September'
      break
    }
    case '10': {
      month = 'October'
      break
    }
    case '11': {
      month = 'November'
      break
    }
    case '12': {
      month = 'December'
      break
    }
    default: {
      month = 'not found'
      break
    }
  }

  if (option == 'datepicker') {
    return `${dd}${apendix} ${month} ${yyyy}`
  } else {
    if (dd[0] == '0') {
      dd = dd.substring(1)
    }
    return `${dd} ${month} ${yyyy}`
  }
}

export function getCurrentDay() {
  let today = new Date()
  let dd = String(today.getDate()).padStart(2, '0')
  let mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
  let yyyy = today.getFullYear()
  return formatDate('default', { dd, mm, yyyy })
}
export function getCurrentDayForDatepicker() {
  let today = new Date()
  let dd = String(today.getDate()).padStart(2, '0')
  let mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
  let yyyy = today.getFullYear()
  return formatDate('datepicker', { dd, mm, yyyy })
}
