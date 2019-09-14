import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    theme: "blue"
  },
  getters: {
    theme: state => state.theme,
    themeMatches: state => matchTheme => state.theme === matchTheme
  },
  mutations: {
    setTheme(state, theme) {
      state.theme = theme;
    }
  },
  actions: {
    setTheme({ commit }, theme) {
      commit("setTheme", theme);
    }
  }
});
