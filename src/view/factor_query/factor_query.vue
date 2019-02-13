<template>
  <div>

    开始日期:<DatePicker
      type="date"
      style="margin:0 10px"
      v-model="beginDate"
    ></DatePicker>
    结束日期:<DatePicker
      type="date"
      style="margin:0 10px"
      v-model="endDate"
    ></DatePicker>

    <Button
      type="primary"
      @click="getFactorList"
    >查询</Button>

    </Form>
    <Table
      stripe
      :columns="goodsColumns"
      :data="factorList"
      style="margin-top:10px;margin-bottom:10px"
    ></Table>
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
      factorList:[],
      goodsColumns: [
        { title: "姓名", key: "employee" },
        { title: "部门", key: "depart" },
        { title: "基础系数", key: "base_factor" },
        { title: "增长系数1", key: "growth_factor" },
        { title: "增长系数2", key: "growth_factor_2" },
        { title: "总系数", key: "factor" },
        { title: "目标业绩", key: "targetperformance" },
        { title: "完成业绩", key: "performance" },
        { title: "部门系数", key: "group_factor" }
      ]
    };
  },
  mounted: function() {
    let now = new Date();
    this.beginDate = now.getFullYear()+'-'+(now.getMonth()+1)+'-01';
    this.endDate = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
    this.getFactorList();
  },
  methods: {
      getFactorList(){
          let _this = this;
        let data = {
            beginDate:this.beginDate,
            endDate:this.endDate
        }
          axios
        .request({
          url: "manager/getFactorList",
          params: data,
          method: "get"
        })
        .then(function(response) {
          _this.factorList = response.data;
        });
      }
  }
};
</script>
