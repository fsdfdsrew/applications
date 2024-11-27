import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    key: null,
    appeals: [],
    totalPages: 1,
    totalCount: 0,
    userPremises: [],
  },
  mutations: {
    setKey(state, key) {
      state.key = key;
    },
    setAppeals(state, { appeals, totalPages, totalCount }) {
      state.appeals = appeals;
      state.totalPages = totalPages;
      state.totalCount = totalCount;
    },
    setUserPremises(state, userPremises) {
      state.userPremises = userPremises;
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.key,
    appeals: (state) => state.appeals,
    totalPages: (state) => state.totalPages,
    totalCount: (state) => state.totalCount,
    userPremises: (state) => state.userPremises,
  },
  actions: {
    async login({ commit }, { username, password }) {
      try {
        const response = await axios.post("https://dev.moydomonline.ru/api/auth/login/", {
          username,
          password,
        });
        const { key } = response.data;
        commit("setKey", key);
        axios.defaults.headers.common["Authorization"] = `Token ${key}`;
      } catch (error) {
        console.log(error)
        throw new Error(error.response.data.data.non_field_errors[0]);
      }
    },
    async fetchFilteredAppeals({ commit }, { search, pageSize, page, sort, premise_id }) {
      try {
        let query = `?page_size=${pageSize}&page=${page}`;
        if (search) query += `&search=${search}`;
        if (sort) query += `&ordering=${sort}`; // Пример сортировки по номеру
        if (premise_id) query += `&premise_id=${premise_id}`;

        console.log(sort);
        console.log(`https://dev.moydomonline.ru/api/appeals/v1.0/appeals/${query}`);
        const response = await axios.get(`https://dev.moydomonline.ru/api/appeals/v1.0/appeals/${query}`);
        console.log(response.data);

        commit("setAppeals", {
          appeals: response.data.results,
          totalPages: response.data.pages,
          totalCount: response.data.count,
        });
        return { totalPages: response.data.pages };
      } catch (error) {
        console.error("Ошибка при фильтрации заявок:", error);
        throw new Error("Не удалось загрузить данные с фильтрами");
      }
    },
    async fetchUserPremises({ commit }) {
      try {
        const response = await axios.get("https://dev.moydomonline.ru/api/geo/v2.0/user-premises/");
        commit("setUserPremises", response.data.results); // Сохраняем данные домов в Vuex
        console.log(response.data); // Выводим в консоль
      } catch (error) {
        console.error("Ошибка при получении домов:", error);
      }
    }
  },
});
