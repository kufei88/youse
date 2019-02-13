<template>
  <div style="padding:20px;background:#fff;margin:10px">
    <Card style="width:550px;margin-bottom:10px">
      <p slot="title">
        <Icon type="ios-film-outline"></Icon>系统设置
      </p>
      <a href="#" slot="extra" @click.prevent="changeWheelMoney">
        <Icon type="ios-loop-strong"></Icon>保存
      </a>
      <Form :label-width="180">
        <FormItem label="注册赠送券">
          <Select v-model="registerCoupon" clearable style="width:200px">
            <Option
              v-for="item in couponList"
              :value="item.id"
              v-bind:key="item.id"
            >{{item.couponName}}</Option>
          </Select>
        </FormItem>
        <FormItem label="生日赠送券">
          <Select v-model="birthCoupon" clearable style="width:200px">
            <Option
              v-for="item in goodsList"
              :value="item.id"
              v-bind:key="item.id"
            >{{item.couponName}}</Option>
          </Select>
        </FormItem>
      </Form>
    </Card>
    <Button type="primary" @click="addWheel" icon="md-add">新增</Button>
    <Table
      stripe
      :columns="goodsColumns"
      :data="goodsList"
      style="margin-top:10px;margin-bottom:10px"
    ></Table>

    <Modal v-model="showImg" :title="state" :footerHide="true">
      <Form ref="formItem" :rules="ruleValidate" :model="formItem" :label-width="100">
        <FormItem label="抵扣券名称" prop="couponName">
          <Input v-model="formItem.couponName" placeholder="输入抵扣券名称"></Input>
        </FormItem>

        <FormItem label="抵扣券金额" prop="couponMoney">
          <InputNumber v-model="formItem.couponMoney"></InputNumber>
        </FormItem>

        <FormItem>
          <Button type="primary" @click="ok('formItem')">确定</Button>
          <Button type="dashed" style="margin-left: 8px" @click="cancel">取消</Button>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
<script>
import axios from "@/libs/api.request";
import Cookies from "js-cookie";
var dateFormat = require("dateformat");
var qs = require("qs");

export default {
  data() {
    return {
      showImg: false,
      imgUrl: "",
      search: "",
      registerCoupon: "",
      birthCoupon: "",
      currentPage: 1,
      currentGoodsCode: "",
      totalRecord: 0,
      pageSize: 10,
      oldId: "",
      state: "新增抵扣券",
      goodsList: [],
      couponList: [],
      wheelMoney: 0,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      formItem: {
        couponName: "",
        couponMoney: 0,
        type: "0"
      },
      ruleValidate: {
        couponName: [
          {
            required: true,
            message: "抵扣券名称不能为空",
            trigger: "blur"
          }
        ],

        couponMoney: [
          {
            required: true,
            message: "抵扣金额不能为空",
            type: "number",
            trigger: "blur"
          }
        ]
      },
      uploadParam: {
        goodsCode: "",
        type: 0
      },
      goodsColumns: [
        {
          title: "抵扣券名称",
          key: "couponName"
        },
        {
          title: "抵扣券金额",
          key: "couponMoney"
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
      ]
    };
  },
  mounted: function() {
    this.getGoodsList();
  },
  methods: {
    getGoodsList() {
      let _this = this;
      let data = {
        rows: this.pageSize,
        page: this.currentPage,
        search: this.search
      };
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
          url: "getMoneyCouponList.do",
          params: data,
          method: "get"
        })
        .then(function(response) {
          _this.goodsList = response.data;
        });
      axios
        .request({
          url: "getReigsterCoupon.do",
          params: {
            memName: "注册赠送券"
          },
          method: "get"
        })
        .then(function(response) {
          _this.registerCoupon = parseInt(response.data);
        });
      axios
        .request({
          url: "getReigsterCoupon.do",
          params: {
            memName: "生日赠送券"
          },
          method: "get"
        })
        .then(function(response) {
          _this.birthCoupon = parseInt(response.data);
        });
    },
    ok(name) {
      if (this.formItem.couponMoney == 0) {
        this.$Message.info("抵扣金额不能为0");
        return;
      }
      this.$refs[name].validate(valid => {
        let _this = this;

        if (valid) {
          let formdate = this.formItem;
          formdate.oldId = this.oldId;

          let data = {
            jsonStr: formdate,
            state: this.state == "新增抵扣券" ? "add" : "update"
          };

          axios
            .request({
              url: "addCoupon.do",
              params: data,
              method: "post"
            })
            .then(function(response) {
              if (response.data.result == "success") {
                _this.$Message.info("保存成功");
                _this.showImg = false;
                _this.getGoodsList();
              } else {
              }
            });
        } else {
          this.showImg = true;
          return false;
        }
      });
    },
    changeWheelMoney() {
      let _this = this;
      let data = {
        memValue: this.registerCoupon ? this.registerCoupon : "",
        memName: "注册赠送券"
      };
      axios
        .request({
          url: "saveRegisterCoupon.do",
          params: data,
          method: "post"
        })
        .then(function(response) {});
      data = {
        memValue: this.birthCoupon ? this.birthCoupon : "",
        memName: "生日赠送券"
      };
      axios
        .request({
          url: "saveRegisterCoupon.do",
          params: data,
          method: "post"
        })
        .then(function(response) {
          _this.$Message.info("保存成功");
        });
    },
    modify(row) {
      this.formItem.couponName = row.row.couponName;
      this.formItem.couponMoney = row.row.couponMoney;

      this.state = "修改抵扣券";
      this.showImg = true;
      this.oldId = row.row.id;
    },
    remove(row) {
      let _this = this;
      console.log(row);
      axios
        .request({
          url: "delBaseCoupon.do",
          params: { id: row.row.id },
          method: "get"
        })
        .then(function(response) {
          console.log(response);
          if (response.data == "success") {
            _this.$Message.info("删除成功");
            console.log(row.$index);
            _this.goodsList.splice(row.index, 1);
          } else if ((response.data = "failed")) {
            _this.$Message.info("该抵扣券已发放,不能删除");
          } else {
            _this.$Message.info("删除失败");
          }
        });
    },
    cancel() {
      this.showImg = false;
    },
    addWheel() {
      this.showImg = true;
      this.state = "新增抵扣券";
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
    }
  }
};
</script>
