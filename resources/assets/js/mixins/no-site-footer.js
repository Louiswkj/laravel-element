
export default {
    mounted () {
        $('body').addClass('no-footer')
    },
    destroyed () {
        $('body').removeClass('no-footer')
    }
}
