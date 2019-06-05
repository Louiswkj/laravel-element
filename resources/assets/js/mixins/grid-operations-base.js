
import AjaxButton from '@/components/ajax-button'

export default {
    components: { AjaxButton },
    methods: {
        reloadGrid () {
            this.grid.refreshDataAndView()
        },
        notifySuccess (msg) {
            this.$notify({
                type: 'success',
                title: '提示',
                message: msg,
                duration: 5000
            })
        },
        notifyFail(msg){
            this.$notify({
                type:'error',
                title:'提示',
                message:msg,
                duration:5000
            })
        }
    }
}
