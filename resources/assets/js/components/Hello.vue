<template>
    <div>
        <h1>Hello, Larvuent!</h1>
        <el-button @click="visible = true">按钮</el-button>
        <el-dialog :visible.sync="visible">
            <p>欢迎使用 Element</p>
        </el-dialog>
        <el-row>
            <el-col :span="24">
                <div class="grid-content bg-purple-dark">
                    <el-radio v-model="radio" label="1">备选项</el-radio>
                    <el-radio v-model="radio" label="2">备选项</el-radio>
                </div>
            </el-col>
        </el-row>
        <i class="el-icon-edit"></i>
        <i class="el-icon-share"></i>
        <i class="el-icon-delete"></i>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                visible: false,
                radio: '1'
            }
        }
    }
</script>

<style>
    .hello {
        font-size: 2em;
        color: green;
    }
</style>