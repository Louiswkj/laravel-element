import ajax from '@/common/ajax'

export function load () {
    return ajax({
        type: 'GET',
        url: '/api/mainaeross/vservice/userparam',
        cache: true
    })
}

export default function () {
    return load().then(data => {
        let res = {}
        if (!data) {
            return res
        }

        for (let k in data) {
            if (data.hasOwnProperty(k)) {
                res[k] = data[k].map(x => ({
                    id: x.id === 0 ? '0' : ((x.id || x.title) + ''),
                    title: x.title + ''
                }))
            }
        }

        return res
    })
}
