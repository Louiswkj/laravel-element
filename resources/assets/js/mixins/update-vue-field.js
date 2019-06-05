import Vue from 'vue'
import data_get from '@/common/data-get'


/**
 * @this {Vue}
 * @param  {string} field
 * @param  {(val:any)=>any} updater
 * @return {this}
 */
export function updateVueField(field, updater){
    const value = copy(data_get(this, field))
    const res = updater.call(this, value)
    if (res === undefined){
        Vue.set(this, field, value)
    } else {
        Vue.set(this, field, res)
    }

    return this
}

export default {
    methods: {
        $update: updateVueField,
    }
}


function copy(x){
    if (!x){
        return x
    }

    if (Array.isArray(x)){
        return x.slice(0)
    }

    if (typeof x === 'object'){
        return {...x}
    }

    return x
}
