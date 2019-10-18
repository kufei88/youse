<template>
  <div>

    账期:<Select v-model="month" style="width:200px;margin:0 30px">
        <Option v-for="item in monthList" :value="item.value" :key="item.value">{{ item.value }}</Option>
    </Select>

    <Button
      type="primary"
      @click="getFactorList"
    >查询</Button>

   
    <Table
      stripe
      :loading="loading"
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
      month:"",
      loading:false,
      monthList:[{
        value:'2019-02'
      },{
        value:'2019-03'
      },{
        value:'2019-04'
      },{
        value:'2019-05'
      },{
        value:'2019-06'
      },{
        value:'2019-07'
      },{
        value:'2019-08'
      },{
        value:'2019-09'
      },{
        value:'2019-10'
      },{
        value:'2019-11'
      },{
        value:'2019-12'
      }],
      factorList:[],
      goodsColumns: [
        { title: "月份", key: "月份" },
        { title: "业务员", key: "业务员" },
        { title: "部门", key: "部门" },
        { title: "基础系数", key: "基础系数" },
        { title: "成长系数1", key: "成长系数1" },
        { title: "成长系数2", key: "成长系数2" },
        
        { title: "任务目标", key: "任务目标" },
        { title: "业绩", key: "业绩" },
        { title: "总系数", key: "总系数" },
        { title: "小组系数", key: "小组系数" },
        { title: "工资", key: "工资" },
      ]
    };
  },
  mounted: function() {
    let now = new Date();
    
    this.month = now.getFullYear()+'-'+ ((now.getMonth()+1)>10?(now.getMonth()+1):('0'+(now.getMonth()+1)));
    console.log(this.month);
    this.getFactorList();
  },
  methods: {
      getFactorList(){
          let _this = this;
        let data = {
            month:this.month
        }
        this.loading = true;
          axios
        .request({
          url: "manager/getFactorList",
          params: data,
          method: "get"
        })
        .then(function(response) {
          _this.factorList = response.data;
          _this.loading = false;
        });
      }
  }
};
</script>
