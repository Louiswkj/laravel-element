export function toDateString (date) {
    if (date instanceof Date) {
        date.setTime(date.getTime() + 8 * 3600 * 1000) // 加上时区
        return date.toISOString().replace(/T.*$/, '')
    }

    return date
}

export function toDateTimeString (date) {
    if (date instanceof Date) {
        date.setTime(date.getTime() + 8 * 3600 * 1000) // 加上时区
        return date.toISOString().replace(/T/, ' ').replace(/\.\d+Z$/, '')
    }

    return date
}

export function toTimeString (date) {
    if (date instanceof Date) {
        date.setTime(date.getTime() + 8 * 3600 * 1000) // 加上时区
        return date.toISOString().replace(/^.*T/, '')
    }

    return date
}
