<template>
  <div>
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
      monthList: [],
      month: "",
      beginDate: "",
      endDate: "",
      totalRecord: 0,
      pageSize: 10,
      loading: false,
      current: 1,
      handler: "",
      handlerList: [],
      factorList: [],
      goodsColumns: [
        { title: "业务员", key: "handler" },
        { title: "部门", key: "dept" },
        {
          title: "工资",
          key: "salary",
          render: (h, params) => {
            if (params.row.$isEdit) {
              return h("input", {
                domProps: {
                  value: params.row.salary
                },
                on: {
                  input: function(event) {
                    params.row.salary = event.target.value;
                  }
                }
              });
            } else {
              return h("div", params.row.salary);
            }
          }
        },
        {
          title: "操作",
          key: "action",
          render: (h, params) => {
            return h(
              "Button",
              {
                props: {
                  type: "text",
                  size: "small"
                },
                on: {
                  click: () => {
                    if (params.row.$isEdit) {
                      this.handleSave(params.row);
                    } else {
                      this.handleEdit(params.row);
                    }
                  }
                }
              },
              params.row.$isEdit ? "保存" : "编辑"
            );
          }
        }
      ]
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
    this.getHandlerList();
  },
  methods: {
    handleEdit(row) {
      this.$set(row, "$isEdit", true);
    },
    handleSave(row) {
      this.$set(row, "$isEdit", false);
      let data = {
        period: this.month,
        handler: row.handler,
        salary: row.salary
      };
      axios
        .request({
          url: "default/updateHandlerSalary",
          params: data,
          method: "post"
        })
        .then(response => {});
    },

    getFactorList() {
      let _this = this;
      let data = {
        period: this.month
      };
      this.loading = true;
      axios
        .request({
          url: "default/getHandlerSalary",
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

