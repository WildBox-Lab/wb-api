# mvh-api

## 部署流程

- 服务器上安装 MongoDB, bindIp 0.0.0.0
- 执行 `MONGO_URI="host.docker.internal" yarn initDb` 初始化数据
- 进入 serverDeploy 文件夹, 执行 initDocker.sh
# wb-api
