---
title: vscode源码调试记录
categories: 源码阅读
tags:
  - vscode
  - 源码
abbrlink: eaba
date: 2022-08-18 18:30:58
---

# 前言
记录一下 vscode 源码调试过程中遇到的问题。

# 启动流程
## 前置条件
- git
- Node.js
- Yarn
- Python
- XCode

## 下载安装
``` bash
git clone https://github.com/microsoft/vscode.git

cd vscode

yarn install
```

## 启动
``` bash
yarn watch

yarn watch web
```

# 常见问题
## Electron下载失败
vscode 是用 yarn 来管理依赖的，在 `yarn install` 的过程中总是卡在 Electron 这里

在网上找了相关解决方案，无用的解决方案：

1. 配置 Electron 源，添加环境变量
2. 为 yarn 设置淘宝镜像
3. 先用 cnpm 安装
4. 使用 vpn 翻墙
5. 修改 host 

诸如此类的我试过都没用

好用的解决方案：

首先手动下载 Electron 压缩包

Electron 下载地址：[https://registry.npmmirror.com/binary.html?path=electron](https://registry.npmmirror.com/binary.html?path=electron)

然后找到 yarn 的缓存目录，mac 下的路径为 `User/当前用户/Library/Caches/Yarn/v6/npm-electron-9.0.3-72a7ea08abadd494794735d90666d1b95fc90d28-integrity\node_modules\electron\`

确定 Electron 的版本号一致，然后在此目录下创建 dist 目录，将下载的压缩包解压至此目录下，在当前目录下创建 path.txt 文件，内容为: `Electron/Contents/MacOS/electron`

> yarn 缓存目录以及 path.txr 内容都是以 mac 为例，如果系统不一样请自行替换

然后再执行安装命令就可以了

# 最后
官方文档：[https://github.com/microsoft/vscode/wiki/How-to-Contribute](https://github.com/microsoft/vscode/wiki/How-to-Contribute)