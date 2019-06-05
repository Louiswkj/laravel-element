export default function findVueInstance (test, $from) {
    if (test($from)) {
        return $from
    }

    let found = null
    let i = 0
    let n
    if ($from.$children && ((n = $from.$children.length) > 0)) {
        for (; i < n; i++) {
            found = findVueInstance(test, $from.$children[i])
            if (found) {
                return found
            }
        }
    }

    return null
}
