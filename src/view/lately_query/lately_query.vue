<template>
  <div>

    <Form
      inline
      :label-width="80"
    >
      <FormItem
        label="业务员"
        style="width:300px"
      >
        <Select
          v-model="handler"
          clearable
          style="width:200px"
        >
          <Option
            v-for="item in handlerList"
            :value="item.name"
            :key="item.name"
          >{{ item.name }}</Option>
        </Select>
      </FormItem>

      <Button
        type="primary"
        @click="getFactorList"
      >搜索</Button>
      </FormItem>
    </Form>
    <Table
      :row-class-name="rowClassName"
      :loading="loading"
      :columns="goodsColumns"
      :data="factorList"
      style="margin-top:10px;margin-bottom:10px"
    ></Table>
    <Page :total="totalRecord" :pageSize="pageSize" :current="current" show-sizer />
  </div>
</template>
<script>
import axios from "@/libs/api.request";
var dateFormat = require("dateformat");
export default {
  data() {
    return {
      beginDate: "",
      endDate: "",
      totalRecord: 0,
      pageSize: 10,
      loading:false,
      current: 1,
      handler: "",
      handlerList: [],
      factorList: [],
      goodsColumns: [
        { title: "客户", key: "client" },
        { title: "业务员", key: "handler" },
        { title: "考核第一个月", key: "first_month" },
        { title: "考核第二个月", key: "second_month" },
        { title: "考核第三个月", key: "third_month" },
        { title: "考核第四个月", key: "forth_month" }
      ]
    };
  },
  mounted: function() {
    this.getFactorList();
    this.getHandlerList();
  },
  methods: {
    rowClassName(row, index) {
      
      if (row.forth_month<row.third_month&&row.third_month<row.second_month&&row.second_month<row.first_month&&row.forth_month<row.first_month*0.65) {
        return "demo-table-error-row";
      } else if (row.third_month<row.second_month&&row.forth_month<row.third_month) {
        return "demo-table-info-row";
      }
      return "";
    },
    getFactorList() {
      let _this = this;
      let data = {
        handler: this.handler ? this.handler : "",
        pageSize:this.pageSize,
        current:this.current
      };
      this.loading = true;
      axios
        .request({
          url: "manager/getLastThreeMonthPer",
          params: data,
          method: "get"
        })
        .then(function(response) {
          _this.factorList = response.data;
          _this.loading = false;
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

