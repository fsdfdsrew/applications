<template>
  <div class="login-page">
    <div class="background"></div>
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <h2>Авторизация</h2>
        </div>
          <div class="input-group">
            <CustomInput
              placeholder="Логин или Телефон"
              icon="call"
              type="phone"
              v-model="username"
            />
            <CustomInput
              icon="lock"
              placeholder="Пароль"
              type="password"
              v-model="password"
            />
        </div>
        <div class="button-error-container">
          <button @click="login" class="button">Войти</button>
          <div v-if="error" class="error-container">
            <label class="error"> {{ error }} </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CustomInput from "@/components/CustomInput.vue";

export default {
  data() {
    return {
      username: "+7 912 233 34 44",
      password: "123456",
      error: null,
    };
  },
  components: { CustomInput },
  methods: {
    validateFields(){
      this.username = this.username.replace(/\s+/g, '').replace(/^\+/, '');

      if (!this.username.trim()) {
        this.error = "Введите логин или телефон.";
        return false;
      }

      if (!this.password.trim()) {
        this.error = "Введите пароль.";
        return false;
      } else if (this.password.length < 4) {
        this.error = "Пароль должен быть не менее 4 символов.";
        return false;
      }

      return true;
    },

    async login() {
      this.error = null;
      
      if (this.validateFields()){
        try {
          await this.$store.dispatch('login', { username: this.username, password: this.password });
          this.$router.push('/');  // Перенаправление на главную страницу после успешной авторизации
        } catch (err) {
          this.error = err.message;
        }
      }
    },
  },
}
</script>

<style scoped lang="scss">

.login-page {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
}

.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.login-box {
  background-color: $primary-color;
  border-radius: 5px;
  width: 320px;
  text-align: center;
  position: relative;

  display: grid;
  grid-template-rows: 1fr 4fr auto;
}

.login-header {
  position: absolute;
  top: -30px;
  left: 16px;
  right: 16px;
  text-align: center;
  z-index: 2;
  border-radius: 5px;
  color: $primary-color;
  background-color: $green-color;
}

.input-group {
  grid-row: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
}

.button {
  padding: 8px 35px;
}
</style>
