<template>
  <div style="padding:20px;background:#fff;margin:10px">
    <Form inline label-position="right" :label-width="80">
      <FormItem label="公司">
        <Select v-model="client" filterable clearable style="width:200px">
          <Option
            v-for="item in clientList"
            :value="item.clientName"
            v-bind:key="item.client"
          >{{item.clientName}}</Option>
        </Select>
      </FormItem>

      <FormItem label="券名">
        <Select v-model="couponName" filterable clearable style="width:200px">
          <Option
            v-for="item in couponList"
            :value="item.couponName"
            v-bind:key="item.id"
          >{{item.couponName}}</Option>
        </Select>
      </FormItem>

      <FormItem label="状态">
        <Select v-model="state" style="width:200px" clearable>
          <Option value="已使用">已使用</Option>
          <Option value="未使用">未使用</Option>
        </Select>
      </FormItem>

      <FormItem label="开始日期">
        <DatePicker v-model="beginDate" placeholder="选择日期" style="width: 200px"></DatePicker>
      </FormItem>

      <FormItem label="结束日期">
        <DatePicker v-model="endDate" placeholder="选择日期" style="width: 200px"></DatePicker>
      </FormItem>

      <Button type="primary" @click="searchList" style="margin-left:10px">查询</Button>
    </Form>
    <Button type="primary" @click="addCoupon" icon="md-add">新增</Button>
    <Table
      stripe
      :columns="goodsColumns"
      :data="goodsList"
      style="margin-top:10px;margin-bottom:10px"
    >
      <div slot="footer" style="margin:20px">
        <Row>
          <Col span="6">
            <Input v-model="sum" readonly style="width:200px">
              <span slot="prepend">合计金额</span>
            </Input>
          </Col>
          <Col span="6">
            <Input v-model="totalRecord" readonly style="width:200px">
              <span slot="prepend">总人数</span>
            </Input>
          </Col>
        </Row>
      </div>
    </Table>
    <Page
      :total="totalRecord"
      :current="currentPage"
      :pageSize="pageSize"
      :page-size-opts="pageSizeOpts"
      show-sizer
      show-total
      @on-change="handleCurrentChange"
      @on-page-size-change="handleSizeChange"
    />
    <Modal v-model="modal" title="新增抵扣券" :footerHide="true">
      <Form ref="formItem" :rules="ruleValidate" :model="formItem" :label-width="100">
        <FormItem label="客户" prop="client">
          <Select v-model="formItem.client" multiple filterable style="width:400px">
            <Option value="全部">全部</Option>
            <Option
              v-for="item in clientList"
              :value="item.client"
              v-bind:key="item.client"
            >{{item.clientName}}</Option>
          </Select>
        </FormItem>
        <FormItem label="优惠券" prop="couponid">
          <Select v-model="formItem.couponid" style="width:400px">
            <Option
              v-for="item in couponList"
              :value="item.id"
              v-bind:key="item.id"
            >{{item.couponName}}</Option>
          </Select>
        </FormItem>
        <FormItem label="截止日期" prop="endDate">
          <DatePicker
            type="date"
            v-model="formItem.endDate"
            placeholder="请选择截止日期"
            style="width:400px"
          ></DatePicker>
        </FormItem>

        <FormItem>
          <Button type="primary" @click="ok('formItem')">确定</Button>
          <Button type="dashed" style="margin-left: 8px" @click="modal=false">取消</Button>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
<script>
import axios from "@/libs/api.request";
import Cookies from "js-cookie";
var qs = require("qs");
var dateFormat = require("dateformat");
export default {
  data() {
    return {
      client: "",
      couponName: "",
      state: "",
      modal: false,
      showImg: false,
      imgUrl: "",
      sum: 0,
      search: "",
      beginDate: "",
      endDate: "",
      pageSizeOpts: [10, 50, 100, 500],
      currentPage: 1,
      currentGoodsCode: "",
      totalRecord: 0,
      pageSize: 10,
      goodsList: [],
      couponList: [],
      clientList: [],
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      uploadParam: {
        goodsCode: "",
        type: 0
      },
      formItem: {
        client: [],
        couponid: "",
        endDate: ""
      },
      ruleValidate: {
        couponid: [
          {
            required: true,
            message: "抵扣券不能为空",
            type: "number",
            trigger: "blur"
          }
        ],
        endDate: [
          {
            required: true,
            message: "截止日期不能为空",
            type: "date",
            trigger: "blur"
          }
        ]
      },
      goodsColumns: [
        {
          title: "券号",
          key: "couponNumber"
        },
        {
          title: "名称",
          key: "couponName"
        },
        {
          title: "金额",
          key: "couponMoney"
        },
        {
          title: "礼品",
          key: "goodsDef"
        },
        {
          title: "客户",
          key: "client"
        },
        {
          title: "发券时间",
          key: "couponTime"
        },
        {
          title: "到期时间",
          key: "endDate"
        },
        {
          title: "状态",
          key: "state"
        },
        {
          title: "操作",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small",
                    disabled: params.row.state == "已使用"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.deleteRow(params.row);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ]
    };
  },
  mounted: function() {
    let now = new Date();
    this.beginDate = now.getFullYear() + "-" + (now.getMonth() + 1) + "-01";
    this.endDate = now.getFullYear() + "-" + (now.getMonth() + 2) + "-01";
    this.getGoodsList();
  },
  methods: {
    getGoodsList() {
      let _this = this;
      let data = {
        rows: this.pageSize,
        page: this.currentPage,
        client: this.client ? this.client : "",
        state: this.state ? this.state : "",
        couponName: this.couponName ? this.couponName : "",
        beginDate: this.beginDate
          ? dateFormat(this.beginDate, "yyyy-mm-dd")
          : "",
        endDate: this.endDate ? dateFormat(this.endDate, "yyyy-mm-dd") : ""
      };
      axios
        .request({
          url: "getAllCouponsList.do",
          params: data,
          method: "get"
        })
        .then(function(response) {
          _this.goodsList = response.data.rows;
          _this.sum = 0;
          _this.goodsList.forEach(function(item) {
            _this.sum += item.couponMoney ? item.couponMoney : 0;
          });
          _this.totalRecord = response.data.record;
        });
      axios
        .request({
          url: "getAllCouponList.do",
          params: data,
          method: "get"
        })
        .then(function(response) {
          _this.couponList = response.data;
        });
      axios
        .request({
          url: "getClientListHasWxid.do",
          params: data,
          method: "get"
        })
        .then(function(response) {
          _this.clientList = response.data;
        });
    },
    addCoupon() {
      this.modal = true;
    },
    ok(name) {
      if (!this.formItem.client) {
        this.$Message.info("请输入客户");
        return;
      }
      this.$refs[name].validate(valid => {
        let _this = this;

        if (valid) {
          let formdate = this.formItem;
          formdate.endDate = dateFormat(this.formItem.endDate, "yyyy-mm-dd");
          formdate.client = formdate.client.toString();
          let data = {
            jsonStr: formdate,
            state: this.state == "新增抵扣券" ? "add" : "update"
          };

          axios
            .request({
              url: "addClientCoupons.do",
              params: formdate,
              method: "post"
            })
            .then(function(response) {
              if (response.data == "success") {
                _this.$Message.info("保存成功");

                _this.modal = false;
                _this.getGoodsList();
              } else {
              }
            });
        } else {
          this.modal = true;
          return false;
        }
      });
    },
    handleView(url) {
      this.imgUrl = url;
      this.showImg = true;
    },
    handleCurrentChange(acurrentPage) {
      this.currentPage = acurrentPage;
      this.getGoodsList();
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.getGoodsList();
    },
    searchList() {
      this.currentPage = 1;
      this.getGoodsList();
    },
    uploadSuccess(response, file, fileList) {
      if (this.uploadParam.type == 0) {
        this.imgUrl =
          "/PSSWeb/artwork/" + this.currentGoodsCode + ".jpg?" + Math.random();
      } else {
        console.log(this.currentGoodsCode);
        this.imgUrl =
          "/PSSWeb/detailsImg/" +
          this.currentGoodsCode +
          ".jpg?" +
          Math.random();
      }

      this.getGoodsList();
    },
    deleteRow(row) {
      let _this = this;
      console.log(row);
      axios
        .request({
          url: "delCoupons.do",
          params: { id: row.id, couponNumber: row.couponNumber },
          method: "get"
        })
        .then(function(response) {
          if (response.data > 0) {
            _this.goodsList.splice(row._index, 1);
          }
        });
    },
    updateNewp(row) {}
  }
};
</script>
