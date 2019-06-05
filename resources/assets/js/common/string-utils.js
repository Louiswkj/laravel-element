
export function toString (x) {
    return ((x === 0 ? '0' : (x || '')) + '')
}

export function splitToArray (str, delimeter = ',') {
    return toString(str).split(delimeter)
}

export function splitToIntArray (str, delimeter = ',') {
    return splitToArray(str, delimeter).filter(x => x !== '').map(x => parseInt(x))
}

export function splitToNumberArray (str, delimeter = ',') {
    return splitToArray(str, delimeter).filter(x => x !== '').map(x => Number(x))
}
