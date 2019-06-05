import deepCopy from 'deep-copy'
import UrlTabs from '@/mixins/url-tabs'
import LifeLog from '@/mixins/life-log'

import View from './url-tabs-layout-ex--view'
/**
 * Create a UrlTabsLayoutEx
 */
export let create = (BaseLayout) => ({
    name: 'UrlTabsLayoutEx',
    mixins: [UrlTabs, LifeLog],
    components: {BaseLayout},
    props: {
        title: {type: String}
    },
    data () {
        return {
            tabs: deepCopy(BaseLayout.extTabs),
            tabsValue: this.curTabName
        }
    },
    watch: {
        curTabName () {
            console.log('watch curTabName changed to: ' + this.curTabName)
            this.tabsValue = this.curTabName
        }
    },
    render: View.render
})
