<template>
    <div>
        <el-row>
            <el-col :span="12" style="border-right: 1px solid #ccc;padding: 20px;min-height:800px">
                <el-form ref="saveForm" :model="saveForm" label-width="120px" size="small" :rules="rulesForm">
                    <el-form-item label="名称" prop="title">
                        <el-input v-model="saveForm.title" style="width: 50%"></el-input>
                    </el-form-item>
                    <el-form-item label="路径" prop="name">
                        <el-autocomplete
                                class="inline-input"
                                v-model="saveForm.name"
                                :fetch-suggestions="querySearch"
                                placeholder="请输入路径"
                                :trigger-on-focus="false"
                                style="width: 50%"
                        ></el-autocomplete>
                    </el-form-item>

                    <el-form-item label="是否作为菜单"  prop="menu">
                        <el-radio-group v-model="saveForm.menu">
                            <el-radio  label="1">是</el-radio>
                            <el-radio  label="0" >否</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item label="状态" prop="status" >
                        <el-radio-group v-model="saveForm.status">
                            <el-radio  label="1">开启</el-radio>
                            <el-radio  label="0" >关闭</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="父级菜单" prop="pid">
                        <treeselect v-model="saveForm.pid" :multiple="false"
                                    placeholder="请选择父级菜单"
                                    :options="menusTree" :default-expand-level="1" style="width: 50%"></treeselect>
                    </el-form-item>
                    <el-form-item label="备注" prop="remark">
                        <el-input v-model="saveForm.remark" style="width: 50%"></el-input>
                    </el-form-item>
                    <el-form-item label="菜单图标" prop="icon" v-if="saveForm.menu == 1" >
                        <el-input v-model="saveForm.icon" style="width: 50%" placeholder="请输入i标签html代码"></el-input>
                        <div class="el-form-item__info">
                            图标详情请查看 <a href="http://fontawesome.dashgame.com">Font Awesome</a>
                        </div>
                    </el-form-item>
                    <el-form-item label="菜单排序" prop="icon" v-if="saveForm.menu == 1">
                        <el-input v-model="saveForm.sort" style="width: 50%"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSubmit">新增/保存</el-button>
                        <el-button  @click="resetFields">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="12" style="padding: 20px;max-height: 800px;overflow-y: scroll">
                <el-row >
                    <el-input
                            placeholder="输入关键字进行过滤"
                            v-model="filterNodeText" style="width: 250px;" size="small">
                    </el-input>
                </el-row>
                <el-row style="padding-top: 10px;">
                    <el-tree
                            :data="rulesTree"
                            :default-expanded-keys = "expandKeys"
                            node-key="id"
                            ref="tree"
                            highlight-current
                            :filter-node-method="filterNode"
                            :expand-on-click-node="false"
                            :default-expand-all="false"
                    >
                        <span class="custom-tree-node" slot-scope="{ node, data }">
                            <span>
                                <span v-if="data.menu"><i class="fa fa-list" ></i></span>
                                <span v-if="!data.menu"><i class="fa fa-file-code-o"  ></i></span>
                                <span>{{data.label}}</span>
                            </span>
                            <span>
                                <el-button type="text" size="mini" @click="() => editRule(data)" >编辑</el-button>
                                <el-button type="text" size="mini" @click="() => deleteRule(data)" >删除</el-button>
                            </span>
                        </span>
                    </el-tree>
                </el-row>

            </el-col>
        </el-row>
    </div>
</template>

<script>
    import Treeselect from '@riophae/vue-treeselect'
    // import the styles
    import '@riophae/vue-treeselect/dist/vue-treeselect.css'

    import Q from '../../common/index'
    import base from '../../pages/base'

    export default {
        mixins: [base],
        components: { Treeselect },
        watch: {
            filterNodeText(val) {
                this.$refs.tree.filter(val);
            }
        },
        mounted() {
            this.getRoutes();
            this.getMenusTree();
            this.getRulesTree();
        },
        data() {
            return {
                routes: [],
                filterNodeText:'',
                form:{},
                saveForm:{
                    title:'',
                    name:'',
                    status:"1",
                    menu:"0"
                },
                menusTree:[],
                rulesTree:[],
                auth:{},
                rulesForm:{
                    title: [
                        { required: true, message: '请输入名称', trigger: 'blur' }
                    ],
                    name: [
                        { required: true, message: '请输入路径', trigger: 'blur' }
                    ],
                    remark:[],
                    icon:[],
                    pid:[]
                },
                expandKeys:[]
            }
        },
        methods:{
            onSubmit() {
                this.$refs['saveForm'].validate((valid) => {
                    if (valid) {
                        this.$ajax({
                            type: 'POST',
                            url: '/api/rule/save',
                            data: this.saveForm,
                            fail: e => {
                                this.error = Q.formatError(e)
                            }
                        }).then(data => {
                            this.$message({
                                message: '保存成功',
                                type: 'success'
                            });
                            this.getRulesTree();
                            this.getMenusTree();
                        });
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });

            },

            filterNode(value, data) {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
            },

            querySearch(queryString, cb) {
                let restaurants = this.routes;
                let results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
                // 调用 callback 返回建议列表的数据
                cb(results);
            },
            createFilter(queryString) {
                return (restaurant) => {
                    return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
                };
            },

            getRoutes() {
                this.$ajax({
                    type: 'GET',
                    url: '/api/rule/get-all-routes',
                    data: this.form,
                    fail: e => {
                        this.error = Q.formatError(e)
                    }
                }).then(data => {
                    this.routes = data.map(function (item) {
                        return {value:item};
                    });
                })
            },
            getMenusTree() {
                this.$ajax({
                    type: 'GET',
                    url: '/api/rule/get-tree-list',
                    data: {
                        menu:1,
                        status:1
                    },
                    fail: e => {
                        this.error = Q.formatError(e)
                    }
                }).then(data => {
                    this.menusTree = data.list;
                })
            },
            getRulesTree() {
                this.$ajax({
                    type: 'GET',
                    url: '/api/rule/get-tree-list',
                    data: {},
                    fail: e => {
                        this.error = Q.formatError(e)
                    }
                }).then(data => {
                    this.rulesTree = data.list;
                    this.rulesTree.map(row => {
                        this.expandKeys.push(row.id);
                        for(let index in row.children) {
                            this.expandKeys.push(row.children[index].id);
                        }
                        return row;
                    });
                    this.auth = data.auth;
                })
            },
            resetFields() {
                if(typeof(this.$refs['saveForm']) !== 'undefined') this.$refs['saveForm'].resetFields();
                this.saveForm.id = undefined;
            },
            editRule(node) {
                if(typeof(this.$refs['saveForm']) !== 'undefined') this.$refs['saveForm'].resetFields();

                this.$ajax({
                    type: 'GET',
                    url: '/api/rule/get',
                    data: {
                        id:node.id
                    },
                    fail: e => {
                        this.error = Q.formatError(e)
                    }
                }).then(data => {
                    this.saveForm = data;
                    this.saveForm.status += '';
                    this.saveForm.menu += '';
                    this.saveForm.pid = this.saveForm.pid ? this.saveForm.pid : undefined;
                })
            },
            deleteRule(node) {
                this.$confirm('你确定删除这条记录吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$ajax({
                        type: 'POST',
                        url: '/api/rule/delete',
                        data: {
                            id:node.id
                        },
                        fail: e => {
                            this.error = Q.formatError(e)
                        }
                    }).then(data => {
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getRulesTree();
                        this.getMenusTree();
                    })
                });
            }
        }
    }
</script>
<style>
    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;
    }
</style>