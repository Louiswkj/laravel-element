import Vue from 'vue'

let bus = new Vue()

export default bus

export const $emit = bus.$emit.bind(bus)
export const $on = bus.$on.bind(bus)
export const $off = bus.$off.bind(bus)
export const $once = bus.$once.bind(bus)
