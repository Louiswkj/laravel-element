export default function (receiver) {
    receiver = receiver || {}

    for (var i = 1; i < arguments.length; i++) {
        var arg = arguments[i]
        if (!arg) {
            continue
        }

        for (var k in arg) {
            if (arg.hasOwnProperty(k)) {
                receiver[k] = arg[k]
            }
        }
    }

    return receiver
}
