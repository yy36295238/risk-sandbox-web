import Vue from 'vue'
import Router from 'vue-router'
import DataSource from '@/components/DataSource'

import iView from 'iview';
import 'iview/dist/styles/iview.css';

/*引入资源请求插件*/
import axios from 'axios';

/*使用axios插件*/
Vue.prototype.$axios = axios;

Vue.use(Router)
Vue.use(iView);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'DataSource',
      component: DataSource
    }
  ]
})
