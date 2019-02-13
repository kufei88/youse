<template>
  <div style="padding:20px;background:#fff;margin:10px">
    <Row>
        <Col span="6">
            <Card style="width:350px;margin-bottom:10px">
                <p slot="title">
                    <Icon type="ios-film-outline"></Icon>基础系数
                </p>
                <a href="#" slot="extra" @click.prevent="saveFactor">
                    <Icon type="ios-loop-strong"></Icon>保存
                </a>
                <Row>
                    <Col span="8">业务员</Col>
                    <Col span="8">系数</Col>
                    <Col span="8">目标业绩(万元)</Col>
                </Row>
                <Row v-for="item in factorList" v-bind:key="item.managerCode" style="margin-top:5px"> 
                    <Col span="8">{{item.name}}</Col>
                    <Col span="8"><InputNumber  v-model="item.factor" ></InputNumber ></Col>
                    <Col span="8"><InputNumber  v-model="item.target" ></InputNumber ></Col>
                </Row >
                
            </Card>
        </Col>
        <Col span="18">
            <Card style="width:550px;margin-bottom:10px">
            <p slot="title">
                <Icon type="ios-film-outline"></Icon>增长系数分档
            </p>
            <h4>公司系数分档设置</h4>
            <Button type="primary" @click="addCompanyFactor" icon="md-add" style="margin:10px 0">新增</Button>
            <Table :columns="columns1" :data="companyFactorList"></Table>
            <h4 style="margin-top:20px">小组系数分档设置</h4>
            <Button type="primary" @click="addGroupFactor" icon="md-add" style="margin:10px 0">新增</Button>
            <Table :columns="columns1" :data="groupFactorList"></Table>
            </Card>
            
        </Col>
    </Row>

    <Modal v-model="showImg" :title="state" :footerHide="true" width="400">  
      <Form ref="formItem" :rules="ruleValidate" :model="formItem" :label-width="120">
        <FormItem :label="performanceLabel" prop="performance">
          <InputNumber v-model="formItem.performance" ></InputNumber>
        </FormItem>

        <FormItem label="系数" prop="factor">
          <InputNumber v-model="formItem.factor" placeholder=""></InputNumber>
        </FormItem>

        <FormItem>
          <Button type="primary" @click="ok('formItem')">确定</Button>
          <Button type="dashed" style="margin-left: 8px" @click="showImg=false">取消</Button>
        </FormItem>
      </Form>
    </Modal>
    
    

    
  </div>
</template>
<script>
import axios from "@/libs/api.request";
export default {

    data(){
        return{
          state:'',
          showImg:false,
          type:0,
          oldId:0,
          oldPerfor:'',
          performanceLabel:'',
          formItem:{
              performance:'',
              factor:''
          },
          ruleValidate: {
            performance: [
            {
                required: true,
                message: "公司业绩不能为空",
                trigger: "blur",
                type:"number",
            }
            ],

            factor: [
            {
                required: true,
                message: "系数不能为空",
                type:"number",
                trigger: "blur"
            }
            ]
        },
          factorList:[],
          columns1:[{
                        title: '业绩',
                        key: 'performance'
                    },
                    {
                        title: '系数',
                        key: 'factor'
                    },
                    
        {
          title: "操作",
          width: 150,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.modify(params);
                    }
                  }
                },
                "修改"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.remove(params);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }],
          companyFactorList:[],
          groupFactorList:[]  
        }  
    },
    mounted:function(){
      this.getFactorList();
    },
    methods:{  
        ok(name) {
            
            this.$refs[name].validate(valid => {
                let _this = this;

                if (valid) {
                let formdate = this.formItem;
                formdate.oldId = this.oldId;
                formdate.type = this.type;
                formdate.oldPerfor = this.oldPerfor;
                let data = {
                    jsonStr: formdate,
                    state: this.state == "新增抵扣券" ? "add" : "update"
                };

                axios
                    .request({
                    url: "manager/addPerformanceFactor",
                    params: formdate,
                    method: "post"
                    })
                    .then(function(response) {
                    if (response.data.returnCode > 0 ) {
                        _this.$Message.info("保存成功");
                        _this.showImg = false;
                        _this.getFactorList();
                    } else if(response.data.returnCode == 0) {
                        _this.$Message.info("该分档已存在");
                    }   
                    });
                } else {
                this.showImg = true;
                return false;
                }
            });
            },
        addCompanyFactor(){
            this.showImg = true;
            this.state = '新增公司系数分档设置';
            this.type = 0;
            this.oldId = 0;
            this.formItem.performance = '';
            this.formItem.factor = '';
            this.performanceLabel = '公司业绩(万元)';
        },
        addGroupFactor(){
            this.showImg = true;
            this.state = '新增小组系数分档设置';
            this.type = 1;
            this.oldId = 0;
            this.formItem.performance = '';
            this.formItem.factor = '';
            this.performanceLabel = '小组业绩(万元)';
        },
        modify(params){
            console.log(params.row.id);
            this.oldId = params.row.id;
            this.showImg = true;
            this.state = '修改公司系数分档设置';
            this.formItem.performance = params.row.performance;
            this.formItem.factor = params.row.factor;
            this.oldPerfor = params.row.performance;
        },
        remove(params){
            let _this = this;
          axios
        .request({
          url: "manager/delPerformanceFactor",
          params: {oldId:params.row.id},
          method: "get"
        })
        .then(function(response) {
          if (response.data.returnCode > 0 ) {
                        _this.$Message.info("删除成功");
                       
                        _this.getFactorList();
            }
            else{
                _this.$Message.info("删除失败");
            }
        });
        },
        getFactorList(){
          let _this = this;
          axios
        .request({
          url: "manager/getManagerFactorList",
          params: {},
          method: "get"
        })
        .then(function(response) {
          _this.factorList = response.data;
        });
        axios
        .request({
          url: "manager/getPerformanceFactorList",
          params: {type:0},
          method: "get"
        })
        .then(function(response) {
          _this.companyFactorList = response.data;
        });
        axios
        .request({
          url: "manager/getPerformanceFactorList",
          params: {type:1},
          method: "get"
        })
        .then(function(response) {
          _this.groupFactorList = response.data;
        });
        },
        saveFactor(){
            let data = {
                factorList:encodeURI(JSON.stringify(this.factorList))
            }
            
            let _this = this;
            axios
            .request({
            url: "manager/saveFactorList",
            params: data,
            method: "get"
            })
            .then(function(response) {
                console.log(response);
            });
        }
    }
}
</script>


