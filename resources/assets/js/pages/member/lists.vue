<template>
    <div>
        <el-form :inline="true" :model="form" size="small">
            <el-form-item label="ID">
                <el-input v-model="form.id" placeholder="ID"></el-input>
            </el-form-item>
            <el-form-item label="昵称">
                <el-input v-model="form.name" placeholder="请输入昵称"></el-input>
            </el-form-item>
            <el-form-item label="手机号">
                <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onSearch">查询</el-button>
            </el-form-item>
        </el-form>

        <el-table :data="tableData">
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="name" label="昵称" ></el-table-column>
            <el-table-column prop="phone" label="手机号"></el-table-column>

            <el-table-column prop="updated_at" label="最后登录时间"></el-table-column>
            <el-table-column prop="created_at" label="创建时间"></el-table-column>

            <el-table-column
                    fixed="right"
                    label="操作"
                    width="100">
                <template slot-scope="scope">
                    <el-button type="text" size="small"  @click="getDetail(scope.row.id)">预览</el-button>
                </template>
            </el-table-column>
        </el-table>
        <br/>
        <el-row>
            <el-col :span="13" :offset="11">
                <el-pagination
                        background
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page="form.page"
                        :page-sizes="[10,25, 50, 100]"
                        :page-size="form.pageSize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="totalItems">
                </el-pagination>
            </el-col>
        </el-row>
        <br/>


        <el-dialog title="预览" :visible.sync="addNewDialog" width="35%" top="4%">
            <el-row>
                <el-col>

                    <el-card :body-style="{ padding: '0px' }" header="基本信息">
                        <div style="padding: 14px;">
                            <div class="bottom clearfix">
                                <img  :src="detail.avatar" class="avatar">
                                <div class="basic_info">
                                    <div>
                                        姓名：{{detail.name}}
                                    </div>
                                    <div>
                                        境界：{{detail.level_id}}
                                    </div>
                                    <div>
                                        肉身：{{detail.body_level_id}}
                                    </div>
                                    <div>
                                        修炼：{{detail.years}}
                                    </div>
                                    <div>
                                        飞身：{{detail.soaring_id}}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </el-card>

                    <el-card :body-style="{ padding: '0px' }" header="属性">
                        <div style="padding: 14px;">
                            <div class="bottom clearfix">
                                <div class="attribute_left">
                                    <div>
                                        真气：{{detail.vital}}
                                    </div>
                                    <div>
                                        根骨：{{detail.root_bone}}
                                    </div>
                                    <div>
                                        体魄：{{detail.physique}}
                                    </div>
                                    <div>
                                        身法：{{detail.years}}
                                    </div>
                                    <div>
                                        灵力：{{detail.mana}}
                                    </div>
                                    <div>
                                        悟性：{{detail.wuxing}}
                                    </div>
                                    <div>
                                        机缘：{{detail.soaring_id}}
                                    </div>
                                </div>
                                <div class="attribute_right">
                                    <div>
                                        攻击：{{detail.name}}
                                    </div>
                                    <div>
                                        防御：{{detail.level_id}}
                                    </div>
                                    <div>
                                        生命：{{detail.body_level_id}}
                                    </div>
                                    <div>
                                        闪避：{{detail.years}}
                                    </div>
                                    <div>
                                        暴击：{{detail.soaring_id}}
                                    </div>
                                    <div>
                                        修炼速度：{{detail.years}}
                                    </div>
                                    <div>
                                        灵力：{{detail.soaring_id}}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-card>

                    <el-card :body-style="{ padding: '0px' }" header="伤害加成">
                        <div style="padding: 14px;">
                            <div class="bottom clearfix">
                                <div class="attribute_left">
                                    <div>
                                        金系伤害：{{detail.name}}
                                    </div>
                                    <div>
                                        木系伤害：{{detail.level_id}}
                                    </div>
                                    <div>
                                        水系伤害：{{detail.body_level_id}}
                                    </div>
                                    <div>
                                        火系伤害：{{detail.years}}
                                    </div>
                                    <div>
                                        土系伤害：{{detail.soaring_id}}
                                    </div>
                                </div>
                                <div class="attribute_right">
                                    <div>
                                        对人族伤害：{{detail.name}}
                                    </div>
                                    <div>
                                        对妖族伤害：{{detail.level_id}}
                                    </div>
                                    <div>
                                        对魔族伤害：{{detail.body_level_id}}
                                    </div>
                                    <div>
                                        对兽族伤害：{{detail.years}}
                                    </div>
                                    <div>
                                        对龙族伤害：{{detail.soaring_id}}
                                    </div>
                                    <div>
                                        对仙人伤害：{{detail.soaring_id}}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-card>

                    <el-card :body-style="{ padding: '0px' }" header="人格">
                        <div style="padding: 14px;">
                            <div class="bottom clearfix">
                                <div class="attribute_left">
                                    <div>
                                        正气：{{detail.name}}
                                    </div>
                                    <div>
                                        皓玉：{{detail.level_id}}
                                    </div>
                                    <div>
                                        威望：{{detail.body_level_id}}
                                    </div>
                                </div>
                                <div class="attribute_right">
                                    <div>
                                        邪气：{{detail.name}}
                                    </div>
                                    <div>
                                        邪玉：{{detail.level_id}}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </el-dialog>
    </div>
</template>

<script>

    import Q from '../../common/index'
    import base from '../../pages/base'
    export default {
        mixins: [base],
        mounted() {
            this.getList();
        },
        data() {
            return {
                tableData: [],
                form:{
                    page:1,
                    pageSize:10
                },
                addNewDialog:false,

                totalItems:0,
                detail:{},
            }
        },
        methods:{
            onSearch() {
                this.form.page = 1;
                this.getList();
            },
            handleSizeChange(size) {
                this.form.pageSize = size;
                this.getList();
            },
            handleCurrentChange(page) {
                this.form.page = page;
                this.getList();
            },

            getDetail(id) {
                this.addNewDialog = true;
                this.$ajax({
                    type: 'GET',
                    url: '/api/member/detail',
                    data: {id:id},
                    fail: e => {
                        this.error = Q.formatError(e)
                    }
                }).then(data => {
                    this.detail = data || {};
                });
            },

            getList() {
                this.$ajax({
                    type: 'GET',
                    url: '/api/member/lists',
                    data: this.form,
                    fail: e => {
                        this.error = Q.formatError(e)
                    }
                }).then(data => {
                    this.tableData = data.data;
                    this.totalItems = data.total;
                    this.auth = data.auth;

                });
            },
        }
    }
</script>
<style>
    .avatar {
        width: 100px;
        height: 100px;
        display: block;
        float: left;
    }
    .basic_info {
        width:200px;
        padding-left: 297px;
    }
    .basic_info >div{
        padding-bottom:2px;
    }

    .attribute_left{
        width:50%;
        float: left;
    }
    .attribute_left div{
        padding-bottom:3px;
    }
    .attribute_right{
        width:50%;
        float: right;
    }
    .attribute_right div{
        padding-bottom:3px;
    }
</style>