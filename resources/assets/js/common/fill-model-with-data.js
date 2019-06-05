import toArray from './to-array'

export default function fillModelWithData({model, data}){
    if (!model || typeof model !== 'object'){
        return model
    }

    if (Array.isArray(model)){
        return toArray(data)
    }

    if (!data){
        return model
    }

    Object.keys(model).forEach(k => {
        const defaultValue = model[k]
        const dataValue = data[k]

        // data没有值，则取默认值
        if (dataValue === undefined || dataValue === null){
            return
        }

        // data有值，则转换为同样类型的值
        switch (typeof defaultValue){
            case 'string':
                model[k] = dataValue + ''
                break
            case 'number':
                model[k] = +dataValue || defaultValue
                break
            case 'boolean':
                model[k] = !!dataValue
                break
            case 'object':
                model[k] = fillModelWithData({model: defaultValue, data: dataValue})
                break
            default:
                model[k] = dataValue
                break
        }
    })

    return model
}