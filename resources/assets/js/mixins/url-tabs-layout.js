
import deepCopy from 'deep-copy'
import UrlTabs from '@/mixins/url-tabs'
import LifeLog from '@/mixins/life-log'

import View from './url-tabs-layout--view'

/**
 * Create a UrlTabsLayout
 */
export let create = (tabs, extTabs = []) => ({
    name: 'UrlTabsLayout',
    tabs,
    extTabs,

    mixins: [UrlTabs, LifeLog],

    props: {
        title: {type: String},
    },

    data () {
        return {
            tabs: deepCopy(tabs),
            tabsValue: this.curTabName
        }
    },
    methods: {

    },

    render: View.render
})
