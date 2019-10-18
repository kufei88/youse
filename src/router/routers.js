import Main from '@/components/main'
import parentView from '@/components/parent-view'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面不会缓存
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export default [{
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () =>
      import('@/view/login/login.vue')
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [{
      path: '/home',
      name: 'home',
      meta: {
        hideInMenu: true,
        title: '首页',
        notCache: true
      },
      component: () =>
        import('@/view/single-page/home')
    }]
  },

  {
    path: '/goods',
    name: 'goods',
    component: Main,
    meta: {
      icon: 'md-settings',
      title: '系统设置',
      access:['2'],
      notCache: true
    },
    children: [{
      path: '/setting',
      name: 'setting',
      meta: {
        icon: 'md-settings',
        title: '系统设置',
        notCache: true
      },
      component: () =>
        import('@/view/setting/setting.vue')
    },{
      path: '/defaultSetting',
      name: 'defaultSetting',
      meta: {
        icon: 'md-settings',
        title: '特殊提成设置',
        notCache: true
      },
      component: () =>
        import('@/view/defaultSetting/defaultSetting.vue')
    },{
      path: '/rob_list',
      name: 'rob_list',
      meta: {
        icon: 'ios-list',
        title: '竞标列表',
        notCache: true
      },
      component: () =>
        import('@/view/rob_list/rob_list.vue')
    }]
  },
  {
    path: '/query',
    name: 'query',
    component: Main,
    meta: {
      icon: 'ios-pie-outline',
      title: '报表'
    },
    children: [{
      path: '/factor_query',
      name: 'factor_query',
      meta: {
        icon: 'md-flag',
        title: '当月系数'
      },
      component: () =>
        import('@/view/factor_query/factor_query.vue')
    },{
        path: '/lately_query',
        name: 'lately_query',
        meta: {
          icon: 'ios-pulse',
          title: '客户最近业绩'  
        },
        component: () =>
          import('@/view/lately_query/lately_query.vue')
      },{
        path: '/robPool',
        name: 'robPool',
        meta: {
          icon: 'ios-ribbon-outline',
          title: '抢夺池'  
        },
        component: () =>
          import('@/view/robPool/robPool.vue')
      },{
        path: '/rob_result',
        name: 'rob_result',
        meta: {
          icon: 'ios-list',
          title: '开标',
          notCache: true
        },
        component: () =>
          import('@/view/rob_result/rob_result.vue')
      }]
  },
  
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () =>
      import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () =>
      import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () =>
      import('@/view/error-page/404.vue')
  }
]
