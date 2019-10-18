<template>
  <div style="padding:20px;background:#fff;margin:10px">
    <Row>
      <Col span="8">
        账期:
        <Select v-model="month" style="width:200px;margin:0 30px" @on-change="getFactorList">
          <Option
            v-for="(item,index) in monthList"
            :value="item.value"
            :key="index"
          >{{ item.value }}</Option>
        </Select>
      </Col>
      <Col span="8">
        <Button :type="buttonType" @click="copy=true" style="margin-right:30px">复制参数</Button>
        
      </Col>
      
    </Row>

    <Row style="margin-top:10px">
      
      <div style="float:left;margin-left:20px" v-show="admin">
        <Card style="width:550px;margin-bottom:10px">
          <p slot="title">
            <Icon type="ios-film-outline"></Icon>分组分档设置
          </p>
          <Card>
          <h4>分组分档设置</h4>
          <Button type="primary" @click="addGroupDeduct" icon="md-add" style="margin:10px 0">新增</Button>
          <Table :columns="columns1" :data="groupDeductList"></Table>
          </Card>
          <Card style="margin-top:10px">
          <h4 style="margin-top:20px">分组基准毛利率</h4>
          <Button type="primary" @click="addGroupFactor" icon="md-add" style="margin:10px 0">新增</Button>
          <Table :columns="columns3" :data="groupFactorList"></Table>
          </Card>
          <Card style="margin-top:10px">
          <h4 style="margin-top:20px">特定人员管理的部门</h4>
          <Button type="primary" @click="addManagerFactor" icon="md-add" style="margin:10px 0">新增</Button>
          <Table :columns="columns2" :data="managerFactorList"></Table>
          </Card>
          
        </Card>
      </div>
      
    </Row>

    <Modal v-model="showImg" :title="state" :footerHide="true" width="400">
      <Form ref="formItem"  :model="formItem" :label-width="120">
        <FormItem :label="label3" prop="performance" v-show="label3">
          <Select v-model="formItem.handler"  >
          <Option
            v-for="(item,index) in handlerList "
            :value="item.name"
            :key="index"
          >{{ item.name }}</Option>
        </Select>
        </FormItem>
        <FormItem :label="performanceLabel" prop="performance">
          <Select v-model="formItem.groupname"  >
          <Option
            v-for="(item,index) in groupList"
            :value="item"
            :key="index"
          >{{ item }}</Option>
        </Select>
        </FormItem>

        <FormItem v-show="label1" :label="label1" prop="factor">
          <InputNumber v-model="formItem.sale" placeholder></InputNumber>
        </FormItem>

        <FormItem v-show="label2" :label="label2" prop="factor">
          <InputNumber v-model="formItem.deduct" placeholder></InputNumber>
        </FormItem>

        <FormItem>
          <Button type="primary" @click="ok('formItem')">确定</Button>
          <Button type="dashed" style="margin-left: 8px" @click="showImg=false">取消</Button>
        </FormItem>
      </Form>
    </Modal>
    <Modal v-model="copy" title="复制参数" width="400" @on-ok="copyClick">
      账期:
      <Select v-model="copyMonth" style="width:200px;margin:0 30px">
        <Option v-for="(item,index) in copyList" :value="item.period" :key="index">{{ item.period }}</Option>
      </Select>
    </Modal>
  </div>
</template>
<script>
import axios from "@/libs/api.request";
import { getToken, getAdmin } from "@/libs/util";
export default {
  data() {
    return {
      closeAccount: "关帐",
      buttonType: "error",
      state: "",
      copy: false,
      admin: getAdmin(),
      showImg: false,
      type: 0,
      oldId: 0,
      label1:'系数',
      label2:'',
      month: "",
      argu:{},
      copyList: [],
      copyMonth: "",
      label3:"",
      monthList: [
        
      ],
      handlerList:[],
      groupList:[],
      oldPerfor: "",
      performanceLabel: "",
      formItem: {
        groupname: "",
        sale: "",
        deduct:"",
        period:"",
        handler:""
      },
      
      groupDeductList: [],
      managerFactorList:[],
      columns1: [
        {
          title: "小组",
          key: "groupname"
        },
        {
          title: "业绩(万元)",
          key: "sale"
        },
        {
          title: "提成(%)",
          key: "deduct"
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
        }
      ],
      columns3: [
        {
          title: "小组",
          key: "groupname"
        },
        {
          title: "基准毛利率(%)",
          key: "standard"
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
                      this.modify3(params);
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
                      this.remove3(params);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      columns2: [
        {
          title: "业务员",
          key: "handler"
        },
        {
          title: "小组",
          key: "groupname"
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
                      this.modify1(params);
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
                      this.remove1(params);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      companyFactorList: [],
      groupFactorList: []
    };
  },
  mounted: function() {
    for(let i=2019;i<2025;i++){
      for(let j=1;j<13;j++){
        this.monthList.push({value:i+"-"+(j<10?'0'+j:j)})
      }
    }
    let now = new Date();
    
    this.month =
      now.getFullYear() +
      "-" +
      (now.getMonth() + 1 > 10
        ? now.getMonth() + 1
        : "0" + (now.getMonth() + 1));
    this.getFactorList();
    let token = getToken();
    console.log(token);
  },
  methods: {
    copyClick(){
      let _this = this;
      if(this.copyMonth == ''){
        this.$Message.info("复制的账期不能为空");
        return;
      }
      if(this.month == this.copyMonth){
        this.$Message.info("不能复制自己");
        return;
      }
      axios
            .request({
              url: "manager/saveCopyFactor",
              params: {
                period:this.month,
                sourcePeriod:this.copyMonth
              },
              method: "post"
            })
            .then(function(response) {
              if (response.data > 0) {
                _this.$Message.info("复制成功");
                
                _this.getFactorList();
              } else  {
                _this.$Message.info("复制失败");
              }
            });
    },
    ok(name) {
          
          if(this.type == 0){
            let _this = this;
            let formdate = this.formItem;
            formdate.id = this.oldId;
            formdate.type = this.type;
            formdate.oldPerfor = this.oldPerfor;
            formdate.period = this.month;
            let data = {
              groupDeduceStr: JSON.stringify(formdate),
              state: this.state == "新增抵扣券" ? "add" : "update"
            };

            axios
              .request({
                url: "default/addGroupDudect",
                params: data,
                method: "post"
              })
              .then(function(response) {
                if (response.data.returnCode > 0) {
                  _this.$Message.info("保存成功");
                  _this.showImg = false;
                  _this.getFactorList();
                } else if (response.data.returnCode == 0) {
                  _this.$Message.info("该分档已存在");
                }
              });
          }
          else if (this.type == 1){
            let _this = this;
            let formdate = {};
            formdate.standard = this.formItem.sale;
            formdate.groupname = this.formItem.groupname;
            formdate.id = this.oldId;
            formdate.type = this.type;
            formdate.oldPerfor = this.oldPerfor;
            formdate.period = this.month;
            let data = {
              groupDeduceStr: JSON.stringify(formdate),
              state: this.state == "新增抵扣券" ? "add" : "update"
            };

            axios
              .request({
                url: "default/addGroupStand",
                params: data,
                method: "post"
              })
              .then(function(response) {
                if (response.data.returnCode > 0) {
                  _this.$Message.info("保存成功");
                  _this.showImg = false;
                  _this.getFactorList();
                } else if (response.data.returnCode == 0) {
                  _this.$Message.info("该分档已存在");
                }
              });
          }
          else if (this.type == 2){
            let _this = this;
            let formdate = this.formItem;
            
            formdate.id = this.oldId;
            formdate.type = this.type;
            formdate.oldPerfor = this.oldPerfor;
            formdate.period = this.month;
            let data = {
              groupDeduceStr: JSON.stringify(formdate),
              state: this.state == "新增抵扣券" ? "add" : "update"
            };

            axios
              .request({
                url: "default/addHandlerGroup",
                params: data,
                method: "post"
              })
              .then(function(response) {
                if (response.data.returnCode > 0) {
                  _this.$Message.info("保存成功");
                  _this.showImg = false;
                  _this.getFactorList();
                } else if (response.data.returnCode == 0) {
                  _this.$Message.info("该分档已存在");
                }
              });
          }
        
      
    },
    closeAccountClick() {
      let _this = this;
      this.$Modal.confirm({
        title: "提示",
        content: "<p>是否确认要进行" + this.closeAccount + "</p>",
        onOk: () => {
          axios
            .request({
              url: "manager/saveMemValue",
              params: {
                memName: "closeAccount",
                memValue: this.closeAccount == "关帐" ? "true" : "false"
              },
              method: "post"
            })
            .then(function(response) {
              if (response.data > 0) {
                _this.$Message.info(_this.closeAccount + "成功");
                _this.closeAccount =
                  _this.closeAccount == "关帐" ? "开帐" : "关帐";
                _this.buttonType =
                  _this.closeAccount == "关帐" ? "error" : "primary";
              }
            });
        },
        onCancel: () => {}
      });
    },
    addGroupDeduct() {
      this.showImg = true;
      this.state = "新增分组分档提成";
      this.label1 = "业绩(万元)";
      this.label2 = "提成(%)";
      this.label3 = "";
      this.type = 0;
      this.oldId = 0;
      this.formItem.groupname = "";
      this.formItem.sale = "";
      this.formItem.deduct = "";
      this.performanceLabel = "小组";
    },
    addGroupFactor() {
      this.showImg = true;
      this.state = "新增分组基准毛利率";
      this.label1 = "毛利率";
      this.label3 = "";
      this.label2 = "";
      this.type = 1;
      this.oldId = 0;
      this.formItem.performance = "";
      this.formItem.factor = "";
      this.performanceLabel = "小组";
    },
    addManagerFactor() {
      this.showImg = true;
      this.state = "新增特定人员管理部门";
      this.label1 = "";
      this.label2 = "";
      this.label3 = "业务员";
      this.type = 2;
      this.oldId = 0;
      this.formItem.performance = "";
      this.formItem.factor = "";
      this.formItem.factor_1 = "";
      this.performanceLabel = "小组";
    },
    modify(params) {
      this.performanceLabel = "小组";
      this.type = 0;
      console.log(params.row.id);
      this.oldId = params.row.id;
      this.showImg = true;
      this.label1 = "业绩(万元)";
      this.label2 = "提成(%)";
      this.state = "修改分组分档提成";
      this.formItem.groupname = params.row.groupname;
      this.formItem.sale = params.row.sale;
      this.formItem.deduct = params.row.deduct;
    },
    modify3(params) {
      this.type = 1;
      this.performanceLabel = "小组";
      console.log(params.row.id);
      this.oldId = params.row.id;
      this.showImg = true;
      this.label1 = "毛利率";
      this.label2 = "";
      this.state = "修改分组基准毛利率";
      this.formItem.groupname = params.row.groupname;
      this.formItem.sale = params.row.standard;
      this.formItem.deduct = params.row.deduct;
    },
    modify1(params) {
      this.performanceLabel = "小组";
      console.log(params.row.id);
      this.oldId = params.row.id;
      this.label1 = "";
      this.label2 = "";
      this.label3 = "业务员";
      this.showImg = true;
      this.state = "修改特定人员管理部门";
      this.type = 2;
      this.formItem.groupname = params.row.groupname;
      this.formItem.handler = params.row.handler;
      
    },
    remove(params) {
      let _this = this;
      axios
        .request({
          url: "default/delGroupDudect",
          params: { id: params.row.id },
          method: "get"
        })
        .then(function(response) {
          if (response.data.returnCode > 0) {
            _this.$Message.info("删除成功");

            _this.getFactorList();
          } else {
            _this.$Message.info("删除失败");
          }
        });
    },
    remove3(params) {
      let _this = this;
      axios
        .request({
          url: "default/delGroupStand",
          params: { id: params.row.id },
          method: "get"
        })
        .then(function(response) {
          if (response.data.returnCode > 0) {
            _this.$Message.info("删除成功");

            _this.getFactorList();
          } else {
            _this.$Message.info("删除失败");
          }
        });
    },
    getFactorList() {
      console.log(123);
      let _this = this;
      axios
        .request({
          url: "default/getGroupDeductList",
          params: { period: this.month },
          method: "get"
        })
        .then(function(response) {
          _this.groupDeductList = response.data;
        });
      axios
        .request({
          url: "default/getGroupList",
          params: {  },
          method: "get"
        })
        .then(function(response) {
          _this.groupList = response.data;
        });
      axios
        .request({
          url: "default/getHandlerList",
          params: {  },
          method: "get"
        })
        .then(function(response) {
          _this.handlerList = response.data;
        });
      axios
        .request({
          url: "manager/getPerformanceFactorList",
          params: { type: 0, period: this.month },
          method: "get"
        })
        .then(function(response) {
          _this.companyFactorList = response.data;
        });
      axios
        .request({
          url: "default/getGroupStandList",
          params: {  period: this.month },
          method: "get"
        })
        .then(function(response) {
          _this.groupFactorList = response.data;
        });

      axios
        .request({
          url: "default/getHandlerGroupList",
          params: {  period: this.month },
          method: "get"
        })
        .then(function(response) {
          _this.managerFactorList = response.data;
        });

      axios
        .request({
          url: "manager/getMemValueByName",
          params: { memName: "closeAccount" },
          method: "get"
        })
        .then(function(response) {
          if (response.data.memValue == "true") {
            _this.closeAccount = "开帐";
            _this.buttonType = "primary";
          }
        });
      axios
        .request({
          url: "manager/getCopyPeroidList",
          params: {},
          method: "get"
        })
        .then(function(response) {
          _this.copyList = response.data;
        });
      axios
        .request({
          url: "manager/getArguByPeriod",
          params: {period:this.month},
          method: "get"
        })
        .then(function(response) {

          _this.argu = response.data;
        });
    },
    saveArgu(){
      this.argu.period = this.month;
      let _this = this;
      axios
        .request({
          url: "manager/saveArgu",
          params: {
            json:this.argu
          },
          method: "post"
        })
        .then(function(response) {
          _this.$Message.info("保存成功");
          console.log(response);
        });
    },
    saveFactor() {
      console.log(this.factorList);
      for (let i = 0; i < this.factorList.length - 2; i++) {
        let count = 0;
        for (let j = 0; j < this.factorList[i].list.length; j++) {
          if (this.factorList[i].list[j].target > 0&&this.factorList[i].list[j].target < 30) {
            this.$Message.info(
              this.factorList[i].list[j].name + "的任务目标不能小于30w"
            );
            return;
          }
          if (this.factorList[i].list[j].leader) {
            count++;
          }
        }
        if (count == 0) {
          this.$Message.info(this.factorList[i].dept + "没有选择组长");
          return;
        } else if (count > 1) {
          this.$Message.info(this.factorList[i].dept + "只能有一个组长");
          return;
        }
      }
      let data = {
        factorList: encodeURI(JSON.stringify(this.factorList)),
        period: this.month
      };

      let _this = this;
      axios
        .request({
          url: "manager/saveFactorList",
          params: data,
          method: "get"
        })
        .then(function(response) {
          _this.$Message.info("保存成功");
          console.log(response);
        });
    }
  }
};
</script>


