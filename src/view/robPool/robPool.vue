<template>
  <div>
    <Table
      :loading="loading"
      :columns="goodsColumns"
      :data="factorList"
      style="margin-top:10px;margin-bottom:10px"
    ></Table>
    <Modal v-model="rob" title="请输入竞标金额" :footerHide="true" width="400">
      <Form ref="formItem" :label-width="100">
        <FormItem label="竞标金额">
          <InputNumber v-model="rob_money" style="width:200px"></InputNumber>
        </FormItem>

        <FormItem>
          <Button type="primary" @click="saveRob">确定</Button>
          <Button type="dashed" style="margin-left: 8px" @click="rob=false">取消</Button>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
<script>
import axios from "@/libs/api.request";
import {
  setToken,
  getToken,
  getAccess
} from '@/libs/util'

var dateFormat = require("dateformat");
export default {
  data() {
    return {
      beginDate: "",
      endDate: "",
      totalRecord: 0,
      pageSize: 10,
      loading: false,
      current: 1,
      handler: getToken(),
      access:getAccess(),
      old_handler:'',
      currentClient:'',
      current_period:'',
      handlerList: [],
      factorList: [],
      rob_money: 0,
      rob: false,
      dept:'',
      min_money:0,
      resur_money:0,
      factor:0,
      accountState:false,
      goodsColumns: [
        { title: "客户", key: "client" },
        { title: "业务员", key: "handler" },
        { title: "部门", key: "dept" },
        { title: "考核第一个月", key: "first_month" },
        { title: "考核第二个月", key: "second_month" },
        { title: "考核第三个月", key: "third_month" },
        { title: "考核第四个月", key: "forth_month" },
        { title: "复活值", key: "resurgence" },
        { title: "系数", key: "factor" },
        { title: "我的竞标", key: "robmoney" },
        {
          title: "操作",
          key: "action",
          width: 150,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small",
                    disabled: params.row.robmoney||params.row.dept==this.dept || ! this.accountState
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.currentClient = params.row.client;
                      this.min_money = params.row.resurgence;
                      this.resur_money = params.row.resurgence;
                      this.factor = params.row.factor;
                      this.old_handler = params.row.handler;
                      this.current_period = params.row.period;
                      console.log(params.row.client);
                      console.log(this.handler);
                      console.log(this.access);
                      this.rob = true;
                    }
                  }
                },
                "抢"
              ),h(
                "Button",
                {
                  props: {
                    type: "warning",
                    size: "small",

                  },
                  style: {
                    marginRight: "5px",
                    display:this.access=='2'?"":"none"
                  },
                  on:{
                    click:()=>{
                      let _this = this;
                      axios.request({
                        url: "manager/insert_tclient",
                        params: {client:params.row.client,handler:this.handler},
                        method: "post"
                      })
                      .then(function(response) {
                        if(response.data > 0){
                          _this.$Message.info("特批成功");
                          _this.getFactorList();
                        }
                        
                      });
                    }
                  }
                },
                "特批"
              )
            ]);
          }
        }
      ]
    };
  },
  mounted: function() {
    this.getFactorList();
    this.getHandlerList();
    this.getAccountState();
    this.getHandlerDept();
  },
  methods: {
    saveRob() {
      if(!this.rob_money){
        this.$Message.info("请输入竞标金额");
        return;
      }
      if(this.rob_money < this.min_money){
        this.$Message.info("竞标金额不能小于复活值");
        return;
      }
      let _this = this;
      let data = {
        client:this.currentClient,
        robmoney:this.rob_money,
        operator:this.handler,
        resur_money:this.resur_money,
        factor:this.factor,
        handler:this.old_handler,
        period:this.current_period
      }
      axios.request({
          url: "manager/insert_rob",
          params: data,
          method: "post"
        })
        .then(function(response) {
          if(response.data > 0){
            _this.rob = false;
            _this.getFactorList();
            this.$Message.info("竞标已上报");
          }
          
        });
    },
    getFactorList() {
      let _this = this;
      let data = {
        handler: this.handler ? this.handler : "",
        pageSize: this.pageSize,
        current: this.current
      };
      this.loading = true;
      axios
        .request({
          url: "manager/getRobPool",
          params: data,
          method: "get"
        })
        .then(function(response) {
          _this.factorList = response.data;
          _this.loading = false;
        });
    },
    getAccountState(){
      let _this = this;
      axios
        .request({
          url: "manager/getMemValueByName",
          params: { memName: "closeAccount" },
          method: "get"
        })
        .then(function(response) {
          if (response.data.memValue == "true") {
            _this.accountState = true;
          }
          else{
            _this.accountState = false;
          }
        });
    },
    getHandlerList() {
      let _this = this;

      axios
        .request({
          url: "manager/getHandlerList",
          params: {},
          method: "get"
        })
        .then(function(response) {
          _this.handlerList = response.data;
        });
    },
    getHandlerDept(){
      let _this = this;

      axios
        .request({
          url: "manager/getDeptByHandler",
          params: {handler:getToken()},
          method: "get"
        })
        .then(function(response) {
          _this.dept = response.data;
        });
    }
  }
};
</script>
<style >
.ivu-table .demo-table-info-row td {
  background-color: #ffd306;
}
.ivu-table .demo-table-error-row td {
  background-color: #ff0000;
  color: #fff;
}
</style>

