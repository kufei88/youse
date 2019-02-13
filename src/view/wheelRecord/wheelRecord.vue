<template>
  <div style="padding:20px;background:#fff;margin:10px">
    <Button type="primary" @click="addWheel" icon="md-add">新增</Button>
    <Table
      stripe
      :columns="goodsColumns"
      :data="couponsList"
      style="margin-top:10px;margin-bottom:10px"
    ></Table>

    <Modal v-model="showImg" :title="state" :footerHide="true" width="700">
      <Form ref="formItem" :model="formItem" :label-width="100" style="width:570px">
        <FormItem label="礼品券名称">
          <Input v-model="formItem.couponName" placeholder="输入礼品券名称"></Input>
        </FormItem>
        <Row v-for="(item,index) in formDynamic.items">
          <Col span="12">
            <FormItem label="礼品">
              <Select v-model="item.goodscode" filterable clearable style="width:200px">
                <Option
                  v-for="item in goodsList"
                  :value="item.goodscode"
                  v-bind:key="item.goodscode"
                >{{item.goodsname}}</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="8">
            <FormItem label="数量">
              <InputNumber v-model="item.number"></InputNumber>
            </FormItem>
          </Col>
          <Col span="3" offset="1">
            <Button @click="handleRemove(index)">删除</Button>
          </Col>
        </Row>
        <FormItem>
          <Row>
            <Col span="12">
              <Button type="dashed" long @click="handleAdd" icon="md-add">新增产品</Button>
            </Col>
          </Row>
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
      index: 1,
      state: "新增抵扣券",
      goodsList: [],
      couponsList: [],
      wheelMoney: 0,
      formDynamic: {
        items: [
          {
            goodscode: "",
            number: 1,
            index: 1
          }
        ]
      },
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
          title: "礼品券名称",
          key: "couponName"
        },
        {
          title: "礼品",
          key: "goodsDef"
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
    handleAdd() {
      this.index++;
      this.formDynamic.items.push({
        goodscode: "",
        index: this.index,
        number: 1
      });
    },
    handleRemove(index) {
      console.log(index);
      this.formDynamic.items.splice(index, 1);
    },
    getGoodsList() {
      let _this = this;
      let data = {
        rows: this.pageSize,
        page: this.currentPage,
        search: this.search
      };
      axios
        .request({
          url: "getGiftGoodsList.do",
          params: data,
          method: "get"
        })
        .then(function(response) {
          _this.goodsList = response.data;
        });
      axios
        .request({
          url: "getGiftCouponList.do",
          params: {
            memName: "注册赠送券"
          },
          method: "get"
        })
        .then(function(response) {
          _this.couponsList = response.data;
        });
    },
    ok(name) {
      if (this.formItem.couponName == 0) {
        this.$Message.info("礼品卷名称不能为空");
        return;
      }
      if (this.formDynamic.items.length == 0) {
        this.$Message.info("请添加礼品");
        return;
      }

      for (let i = 0; i < this.formDynamic.items.length; i++) {
        if (
          !this.formDynamic.items[i].goodscode ||
          !this.formDynamic.items[i].number
        ) {
          this.$Message.info("请填写完整的礼品信息");
          return;
        }
      }

      let _this = this;

      let data = {
        couponName: this.formItem.couponName,
        goodsList: JSON.stringify(this.formDynamic.items)
      };

      axios
        .request({
          url: "addGiftCoupon.do",
          params: data,
          method: "post"
        })
        .then(function(response) {
          if (response.data == "success") {
            _this.$Message.info("保存成功");
            _this.showImg = false;
            _this.getGoodsList();
          } else {
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
          url: "delCouponGoods.do",
          params: { id: row.row.id },
          method: "get"
        })
        .then(function(response) {
          console.log(response);
          if (response.data == "success") {
            _this.$Message.info("删除成功");
            console.log(row.$index);
            _this.couponsList.splice(row.index, 1);
          } else if ((response.data = "failed")) {
            _this.$Message.info("该礼品券已发放,不能删除");
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
