# 机构管理系统

基于 Vue 3 + Element Plus 的机构管理页面

## 功能特性

- 机构列表展示
- 机构信息的增删改查
- 分页查询
- 搜索过滤
- 响应式布局

## 技术栈

- Vue 3
- Element Plus
- Vue Router
- Pinia
- Axios
- Vite

## 安装依赖

```bash
npm install
```

## 运行项目

```bash
npm run dev
```

项目将在 http://localhost:3000 启动

## 构建生产版本

```bash
npm run build
```

## 接口配置

后台接口地址：http://127.0.0.1:8802/mifss/ipt/

已在 vite.config.js 中配置代理，前端请求 /api 会自动转发到后台接口。

## 项目结构

```
├── src/
│   ├── api/              # API 接口
│   │   ├── request.js    # axios 封装
│   │   └── institution.js # 机构接口
│   ├── router/           # 路由配置
│   ├── views/            # 页面组件
│   │   └── InstitutionManagement.vue  # 机构管理页面
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── index.html
├── vite.config.js        # Vite 配置
└── package.json
```
