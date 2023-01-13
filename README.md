# gitlab-releases

gitlab 自动发布资源

## 使用指南

1、安装

`npm i gitlab-releases`

2、使用

```javascript
import {Releases} from 'gitlab-releases'
new Releases({
    token: "令牌",
    host: 'https://gitlab.example.com',
    baseURL: 'gitLab 上传地址，默认为：/api/v4',
    projectName: '项目仓库名称：用户/仓库名称',
}).update({
    description:'打包测试',
    tag_name:'0.0.1',
})
```
