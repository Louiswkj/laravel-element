<template>
    <BaseLayout :title="title || curTabLabel" curTabName="ext" >
        <div>
            <slot name="header"></slot>
            <el-tabs type="border-card"
                    :value="tabsValue" @input="onTabInput" @tab-click="onTabChange">
                <template v-for="t in tabs">
                    <el-tab-pane v-if="isTabVisible(t)"
                                :label="t.label" :name="t.name" :key="t.key" >
                        <slot v-if="tabsValue == t.name"></slot>
                    </el-tab-pane>
                </template>
            </el-tabs>
            <slot name="footer"></slot>
        </div>
    </BaseLayout>
</template>

<script>
export default {}
</script>
