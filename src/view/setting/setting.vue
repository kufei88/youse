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
        <Button
          :type="buttonType"
          @click="closeAccountClick"
          style="margin-rignt:30px"
        >{{closeAccount}}</Button>
      </Col>
    </Row>

    <Row style="margin-top:10px">
      <div style="float:left">
        <Card style="width:350px;margin-bottom:10px">
          <p slot="title">
            <Icon type="ios-film-outline"></Icon>基础系数
          </p>
          <a href="#" slot="extra" @click.prevent="saveFactor">
            <Icon type="ios-loop-strong"></Icon>保存
          </a>
          <Row>
            <Col span="8">业务员</Col>
            <Col span="6" v-show="admin">系数</Col>
            <Col span="6">目标业绩(万元)</Col>
            <Col span="4">组长</Col>
          </Row>
          <Card
            :bordered="false"
            v-for="item in factorList"
            v-bind:key="item.dept"
            style="margin-top:5px"
          >
            <p slot="title">{{item.dept}}</p>
            <Row v-for="item1 in item.list" v-bind:key="item1.managerCode" style="margin-top:5px">
              <Col span="8">{{item1.name}}</Col>
              <Col span="6" v-show="admin">
                <InputNumber size="small" v-model="item1.factor" style="width:50px"></InputNumber>
              </Col>
              <Col span="6" v-show="item.dept!='销售经理'&&item.dept!='审核员'">
                <InputNumber size="small" v-model="item1.target" style="width:60px"></InputNumber>
              </Col>
              <Col span="4" v-show="item.dept!='销售经理'&&item.dept!='审核员'">
                <i-switch v-model="item1.leader" />
              </Col>
            </Row>
          </Card>
        </Card>
      </div>
      <div style="float:left;margin-left:20px" v-show="admin">
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
          <h4 style="margin-top:20px">经理和审核员系数分档</h4>
          <Button type="primary" @click="addManagerFactor" icon="md-add" style="margin:10px 0">新增</Button>
          <Table :columns="columns2" :data="managerFactorList"></Table>
        </Card>
      </div>
      <div style="float:left;margin-left:20px" v-show="admin">
        <Card style="width:550px;margin-bottom:10px">
          <p slot="title">
            <Icon type="ios-film-outline"></Icon>参数设置
          </p>
          <a href="#" slot="extra" @click.prevent="saveArgu">
            <Icon type="ios-loop-strong"></Icon>保存
          </a>
          <Form :model="argu" :label-width="180">
            <FormItem label="业绩第一名的小组先得:">
              <InputNumber :max="100" :min="0" v-model="argu.firstGroup"></InputNumber>%
            </FormItem>
            <FormItem label="业绩第二名的小组得:">
              <InputNumber :max="100" :min="0" v-model="argu.secondGroup"></InputNumber>%
            </FormItem>
            <FormItem label="组长先得小组系数的:">
              <InputNumber :max="100" :min="0" v-model="argu.leader"></InputNumber>%
            </FormItem>
            <FormItem label="小组系数计算基础:">
              <InputNumber :max="100" :min="0" v-model="argu.groupBase"></InputNumber>%
            </FormItem>
            <FormItem label="业绩最低完成率:">
              <InputNumber :max="100" :min="0" v-model="argu.minComplete"></InputNumber>%
            </FormItem>
            <FormItem label="达不到业绩最低完成率扣:">
              <InputNumber :max="100" :min="0" v-model="argu.deduct"></InputNumber>%
            </FormItem>
            <FormItem label="工资基准:">
              <InputNumber :min="0" v-model="argu.salary"></InputNumber>
            </FormItem>
          </Form>
        </Card>
      </div>
    </Row>

    <Modal v-model="showImg" :title="state" :footerHide="true" width="400">
      <Form ref="formItem" :rules="ruleValidate" :model="formItem" :label-width="120">
        <FormItem :label="performanceLabel" prop="performance">
          <InputNumber v-model="formItem.performance"></InputNumber>
        </FormItem>

        <FormItem :label="label1" prop="factor">
          <InputNumber v-model="formItem.factor" placeholder></InputNumber>
        </FormItem>

        <FormItem v-show="label2" :label="label2" prop="factor">
          <InputNumber v-model="formItem.factor_1" placeholder></InputNumber>
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
      label1: "系数",
      label2: "",
      month: "",
      argu: {},
      copyList: [],
      copyMonth: "",
      monthList: [],
      oldPerfor: "",
      performanceLabel: "",
      formItem: {
        performance: "",
        factor: "",
        factor_1: ""
      },
      ruleValidate: {
        performance: [
          {
            required: true,
            message: "公司业绩不能为空",
            trigger: "blur",
            type: "number"
          }
        ],

        factor: [
          {
            required: true,
            message: "系数不能为空",
            type: "number",
            trigger: "blur"
          }
        ]
      },
      factorList: [],
      managerFactorList: [],
      columns1: [
        {
          title: "业绩",
          key: "performance"
        },
        {
          title: "系数",
          key: "factor"
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
      columns2: [
        {
          title: "业绩",
          key: "performance"
        },
        {
          title: "经理系数",
          key: "factor"
        },
        {
          title: "审核系数",
          key: "factor_1"
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
      companyFactorList: [],
      groupFactorList: []
    };
  },
  mounted: function() {
    for (let i = 2019; i < 2025; i++) {
      for (let j = 1; j < 13; j++) {
        this.monthList.push({ value: i + "-" + (j < 10 ? "0" + j : j) });
      }
    }
    let now = new Date();
    this.month =
      now.getFullYear() +
      "-" +
      (now.getMonth() + 1 > 9
        ? now.getMonth() + 1
        : "0" + (now.getMonth() + 1));
    this.getFactorList();
    let token = getToken();
    console.log(token);
  },
  methods: {
    copyClick() {
      let _this = this;
      if (this.copyMonth == "") {
        this.$Message.info("复制的账期不能为空");
        return;
      }
      if (this.month == this.copyMonth) {
        this.$Message.info("不能复制自己");
        return;
      }
      axios
        .request({
          url: "manager/saveCopyFactor",
          params: {
            period: this.month,
            sourcePeriod: this.copyMonth
          },
          method: "post"
        })
        .then(function(response) {
          if (response.data > 0) {
            _this.$Message.info("复制成功");

            _this.getFactorList();
          } else {
            _this.$Message.info("复制失败");
          }
        });
    },
    ok(name) {
      this.$refs[name].validate(valid => {
        let _this = this;

        if (valid) {
          let formdate = this.formItem;
          formdate.oldId = this.oldId;
          formdate.type = this.type;
          formdate.oldPerfor = this.oldPerfor;
          formdate.period = this.month;
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
              if (response.data.returnCode > 0) {
                _this.$Message.info("保存成功");
                _this.showImg = false;
                _this.getFactorList();
              } else if (response.data.returnCode == 0) {
                _this.$Message.info("该分档已存在");
              }
            });
        } else {
          this.showImg = true;
          return false;
        }
      });
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
    addCompanyFactor() {
      this.showImg = true;
      this.state = "新增公司系数分档设置";
      this.label1 = "系数";
      this.label2 = "";
      this.type = 0;
      this.oldId = 0;
      this.formItem.performance = "";
      this.formItem.factor = "";
      this.performanceLabel = "公司业绩(万元)";
    },
    addGroupFactor() {
      this.showImg = true;
      this.state = "新增小组系数分档设置";
      this.label1 = "系数";
      this.label2 = "";
      this.type = 1;
      this.oldId = 0;
      this.formItem.performance = "";
      this.formItem.factor = "";
      this.performanceLabel = "小组业绩(万元)";
    },
    addManagerFactor() {
      this.showImg = true;
      this.state = "新增经理和审核员系数分档";
      this.label1 = "经理系数";
      this.label2 = "审核系数";
      this.type = 2;
      this.oldId = 0;
      this.formItem.performance = "";
      this.formItem.factor = "";
      this.formItem.factor_1 = "";
      this.performanceLabel = "公司业绩(万元)";
    },
    modify(params) {
      this.performanceLabel = "公司业绩(万元)";
      console.log(params.row.id);
      this.oldId = params.row.id;
      this.showImg = true;
      this.label1 = "系数";
      this.label2 = "";
      this.state = "修改公司系数分档设置";
      this.formItem.performance = params.row.performance;
      this.formItem.factor = params.row.factor;
      this.oldPerfor = params.row.performance;
    },
    modify1(params) {
      this.performanceLabel = "公司业绩(万元)";
      console.log(params.row.id);
      this.oldId = params.row.id;
      this.label1 = "经理系数";
      this.label2 = "审核系数";
      this.showImg = true;
      this.state = "修改经理和审核员系数分档";
      this.formItem.performance = params.row.performance;
      this.formItem.factor = params.row.factor;
      this.formItem.factor_1 = params.row.factor_1;
      this.oldPerfor = params.row.performance;
    },
    remove(params) {
      let _this = this;
      axios
        .request({
          url: "manager/delPerformanceFactor",
          params: { oldId: params.row.id },
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
          url: "manager/getManagerFactorList",
          params: { period: this.month },
          method: "get"
        })
        .then(function(response) {
          _this.factorList = response.data;
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
          url: "manager/getPerformanceFactorList",
          params: { type: 1, period: this.month },
          method: "get"
        })
        .then(function(response) {
          _this.groupFactorList = response.data;
        });

      axios
        .request({
          url: "manager/getPerformanceFactorList",
          params: { type: 2, period: this.month },
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
          params: { period: this.month },
          method: "get"
        })
        .then(function(response) {
          _this.argu = response.data;
        });
    },
    saveArgu() {
      this.argu.period = this.month;
      let _this = this;
      axios
        .request({
          url: "manager/saveArgu",
          params: {
            json: this.argu
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
          if (
            this.factorList[i].list[j].target > 0 &&
            this.factorList[i].list[j].target < 30
          ) {
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


