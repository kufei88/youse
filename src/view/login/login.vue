<style lang="less">
@import "./login.less";
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit"></login-form>
          <p class="login-tip"></p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import LoginForm from "_c/login-form";
import { mapActions } from "vuex";
export default {
  components: {
    LoginForm
  },
  methods: {
    ...mapActions(["handleLogin", "getUserInfo"]),
    handleSubmit({ userName, password }) {
      let _this = this;
      this.handleLogin({ userName, password }).then(res => {
        console.log(res);
        if (res.returnCode == 404) {
          this.$Message.error("用户名不存在");
        } else if (res.returnCode == 500) {
          this.$Message.error("密码错误");
        } else if (res.returnCode == 100) {
          console.log(111);
          _this.$store.commit("setToken", userName);
          _this.$store.commit("setAccess", res.msg);
          _this.$store.commit(
            "setAvator",
            "https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3448484253,3685836170&fm=27&gp=0.jpg"
          );
          this.$router.push({
            name: "home"
          });
        }
        /*
        this.getUserInfo().then(res => {
          this.$router.push({
            name: "home"
          });
        }); */
      });
    }
  }
};
</script>

<style>
</style>
