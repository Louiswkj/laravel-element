import Q from '@/common'

/**
 * 使用前提：
 * 存在 this.curTabName 代表当前tab的标签
 * 存在 this.tabs  结构如 [{label: 'xxx', name: 'yyy', url: 'zz/zz'},...]
 */
export default {
    props: {
        curTabName: {type: String},
        params: {type: Object, default: () => ({})}
    },

    data () {
        return {
            tabsValue: this.curTabName
        }
    },
    methods: {
        onTabInput (value) {
            if (this.tabsValue === value){
                return
            }

            this.tabsValue = value

            console.log('url-tabs:onTabInput: ' + value)

            // navigate to currentTabUrl
            let tabData = this.findTab(value) || {}
            let url = this.getTabUrl(tabData)
            if (!url) {
                console.error(`Failed to get tab ${value}'s URL: ` + url)
                return
            }

            url = ('/admin/' + url.replace(/^\/+/, '')).replace(/^(\/admin){2,}/, '/admin')
            Q.navigateTo(url)
        },
        onTabChange (tab, e) {
            this.$emit('tab-change', tab, e)
        },
        findTab (tabName) {
            let name = tabName

            for (let t of this.tabs) {
                if (t.name === name) {
                    return t
                }
            }

            return null
        },
        getCurTab () {
            return this.findTab(this.curTabName)
        },
        getTabUrl (tab) {
            switch (typeof tab.url) {
                case 'string':
                    return tab.url
                case 'function':
                    return tab.url(this.params)
                default:
                    return (tab.url || '') + ''
            }
        },
        isTabVisible (tab) {
            switch (typeof tab.isVisible) {
                case 'undefined':
                    return true
                case 'function':
                    return tab.isVisible(this.params)
                default:
                    return !!tab.isVisible
            }
        }
    },
    computed: {
        curTabLabel () {
            return (this.getCurTab() || {}).label || ''
        },
        curTabUrl () {
            return this.getTabUrl(this.getCurTab() || {})
        }
    },
    watch: {
        curTabName () {
            // console.log('!!!!!!!!!!!!!!!watch curTabName changed to: ' + this.curTabName)
            this.tabsValue = this.curTabName
        }
    },
    activated () {
        // console.log('activated: tabsValue: %s, curTabName: %s', this.tabsValue , this.curTabName)
        this.tabsValue = this.curTabName
    }
}
