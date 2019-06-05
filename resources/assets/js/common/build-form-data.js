import isPlainObject from 'is-plain-obj'

const isArray = Array.isArray

/**
 * PHP style build querystring
 * @param queryParams {Object|array}
 * @returns {String}
 */
export default function (queryParams) {
    let formData = new FormData()

    if (!queryParams) {
        return formData
    }

    if (typeof queryParams === 'string') {
        formData.append('_', queryParams)
        return formData
    }

    let addQueryParam = (key, val) => {
        if (!val && val !== 0) {
            formData.append(key, '')
            return
        }

        switch (typeof val) {
            case 'object':
                if (val instanceof Date) {
                    formData.append(key, val.toISOString())
                } else if ((val instanceof File) || (val instanceof Blob)) {
                    formData.append(key, val)
                } else if (isArray(val)) {
                    for (let i = 0, n = val.length; i < n; i++) {
                        addQueryParam(`${key}[${i}]`, val[i])
                    }
                } else if (isPlainObject(val)) {
                    for (let k in val) {
                        if (val.hasOwnProperty(k)) {
                            addQueryParam(`${key}[${k}]`, val[k])
                        }
                    }
                } else {
                    formData.append(key, val + '')
                }
                break
            default: // string, number, undefined ...
                formData.append(key, val + '')
                break
        }
    }

    for (let key in queryParams) {
        if (queryParams.hasOwnProperty(key)) {
            addQueryParam(key, queryParams[key])
        }
    }

    return formData
}
