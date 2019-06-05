module.exports = typeof console.warn === 'function' ? console.warn.bind(console) : console.log.bind(console)
