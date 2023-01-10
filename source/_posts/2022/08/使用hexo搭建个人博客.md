---
title: 使用Hexo搭建个人博客
categories: 博客搭建
tags:
  - Hexo
  - blog
abbrlink: 'a927'
date: 2022-08-12 10:09:07
---

# 前言
本文主要讲述如何使用Hexo搭建个人博客、配置Hexo插件和主题、以及部署相关。

# 本地运行
首先需要确保你的电脑有 `Node.js` 和 `Git`，如果没有则需要先安装一下

## 安装Node.js
`Node.js` 安装包及源码下载地址为：[https://nodejs.org/zh-cn/download/](https://nodejs.org/zh-cn/download/)

![](https://lvboda.cn/uploader/static/0728ce267d7f35549c41595009cbbe37.png)

根据不同的系统选择对应的 `Node.js` 的安装包进行下载，然后直接傻瓜式安装即可

## 安装Git
`Git` 安装包下载地址为：[https://git-scm.com/download](https://git-scm.com/download)

![](https://lvboda.cn/uploader/static/9d0cec3968efdf0da233d9de8271aafb.png)

根据不同的系统选择对应的安装方式进行安装即可

## 安装Hexo
接下来需要全局安装 [Hexo](https://hexo.io/zh-cn/index.html)

打开命令行界面，输入以下命令开始安装

``` bash
npm install hexo-cli -g
```

等待安装完成后命令行输入

``` bash
hexo -v
```

显示对应版本号即为安装成功，如下图

![](https://lvboda.cn/uploader/static/fbe27395464283918dbc8230068f7257.png)

## 建站并本地运行
安装 `Hexo` 完成后，请执行下列命令，`Hexo` 将会在指定文件夹中新建所需要的文件

``` bash
hexo init <指定文件夹路径或文件夹名>
cd <指定文件夹路径或文件夹名>
npm install
```

新建完成后，指定文件夹的目录如下：

``` 
├── _config.yml
├── package.json
├── scaffolds
├── source
│   ├── _drafts
│   └── _posts
└── themes
```

在当前文件夹内执行以下命令本地启动

``` bash
hexo server
```

等待命令执行完浏览器访问[http://localhost:4000/](http://localhost:4000/)，显示内容即为运行成功，如下图：

![](https://lvboda.cn/uploader/static/c0444ae4bb75e9d80ed2b3a9ebf994f7.png)

到这里我们就用hexo成功的搭建了最基础的博客，并在本地成功运行了

# Hexo主题
以本博客为例，说一下主题的更换

1. 在官网的[主题页](https://hexo.io/themes/)选一个你喜欢的主题，这里我用的是 `Icarus` 

![](https://lvboda.cn/uploader/static/368d10271b853378d3fefec2194ffc86.png)

2. 点击这个主题的名字跳转到对应的 `github` 仓库，并复制 `github` 地址

![](https://lvboda.cn/uploader/static/9bb4999bc057af464ae662d35bf073a5.png)

1. 打开博客目录下的 `themes` 目录，在当前目录下打开命令窗口，执行 `git clone <复制的github地址>` 命令并等待执行完成

![](https://lvboda.cn/uploader/static/ec138e20f365b663218b87d85377112d.png)

4. 打开博客根目录的 `_config.yml` 文件，找到 `theme` 配置并修改为你要切换的主题名称

``` yml
theme: icarus
```

5. 重启服务，主题切换完成

这是最基础的主题切换，如果有要定制化的修改请在主题源码里自行修改

``` bash
hexo server
```

# Hexo插件
本博客用到的插件：

插件名 | 功能
-------|-------------------
[hexo-abbrlink](https://github.com/rozbo/hexo-abbrlink) | 生成URL短链
[hexo-generator-sitemap](https://github.com/hexojs/hexo-generator-sitemap) / [hexo-generator-baidu-sitemap](https://github.com/coneycode/hexo-generator-baidu-sitemap) | 生成站点地图
[hexo-auto-excerpt](https://github.com/ashisherc/hexo-auto-excerpt) | 自动摘录
[hexo-generator-archive](https://github.com/hexojs/hexo-generator-archive) | 生成归档目录
[hexo-generator-category](https://github.com/hexojs/hexo-generator-category) | 生成分类目录
[hexo-generator-tag](https://github.com/hexojs/hexo-generator-tag) | 生成标签目录
[gitalk](https://github.com/gitalk/gitalk) | 评论系统（利用github的issues）

> gitalk配置这块我会单拉出一篇文章说

插件的安装一般为博客文件夹目录打开命令面版并执行以下命令

``` bash
 npm install <插件名> --save
```

具体请查看不同插件的文档

# 部署
博客的部署我这里介绍两种，github托管和自有服务器部署

使用 github 托管的优点是免费，缺点因国内网络问题访问不是很稳定

自有服务器部署的优点是访问稳定，缺点是需要自行购买服务器

## github 托管
请参考 [https://jeam.org/338f9b1](https://jeam.org/338f9b1)

## 自有服务器部署
首先需要有一台自己的服务器，如何购买我这里就不说了，参考 [https://jeam.org/338f9b1](https://jeam.org/338f9b1)

### 安装 Nginx
参考 [https://www.cnblogs.com/lywJ/p/10710361.html](https://www.cnblogs.com/lywJ/p/10710361.html)

### 使用命令一键部署
首先说一下我使用的是 `rsync` 命令来完成静态文件远程同步的

`rsync` 可以在本地计算机与远程计算机之间，或者两个本地目录之间同步文件

下面讲一下 `rsync` 的安装及 `ssh` 的配置

首先要在本地写作的机器和服务器都安装 `rsync`

``` bash
# Debian
$ sudo apt-get install rsync

# Red Hat
$ sudo yum install rsync

# Arch Linux
$ sudo pacman -S rsync
```

安装成功后可以试一下好不好用

``` bash
rsync <本地传输路径> root@<你的服务器ip>:<需要同步到服务器的路径>
```

接着会让你输入服务器的密码，等待传输完成后上服务器看一下是否成功同步

到这里就利用 `rsync` 完成了博客部署，但是有一个问题就是不能每次都输入一遍服务器密码吧，这样会很麻烦，理想的情况是一个命令就直接完成部署，不需要密码，这里就需要ssh的相关配置

首先在写作的机器上执行命令

``` bash
ssh-keygen -t rsa -b 2048 -f /root/.ssh/hostkey
```

如果没有 `.ssh` 目录，手动创建一个，此时会在该目录下生成2个文件 `hostkey` 和 `hostkey.pub`

将生成的hustkey.pub传输给server，由于此处是要用于身份验证的

``` bash
scp /root/.ssh/hostkey.pub 192.168.71.98:/.ssh/
```

接着再服务器 `/etc/hosts.allow` 里添加 `sshd:192.168.71.178` ，这样做是为了让客户端可以登陆

在 `/.ssh` 目录下手动创建 `touch authorized_keys`、`chomd 600 authorized_keys` 再将由客户端传过来的 `hostkey.pub` 导进去 `cat hostkey.pub >> authorized_keys`

`vi /etc/ssh/sshd_config` 文件

``` yml
#
# Copyright 2004 Sun Microsystems, Inc.  All rights reserved.
# Use is subject to license terms.
#
# ident "@(#)sshd_config        1.8     04/05/10 SMI"
#
# Configuration file for sshd(1m)

# Protocol versions supported
#
# The sshd shipped in this release of Solaris has support for major versions
# 1 and 2.  It is recommended due to security weaknesses in the v1 protocol
# that sites run only v2 if possible. Support for v1 is provided to help sites
# with existing ssh v1 clients/servers to transition.
# Support for v1 may not be available in a future release of Solaris.
#
# To enable support for v1 an RSA1 key must be created with ssh-keygen(1).
# RSA and DSA keys for protocol v2 are created by /etc/init.d/sshd if they
# do not already exist, RSA1 keys for protocol v1 are not automatically created.

# Uncomment ONLY ONE of the following Protocol statements.

# Only v2 (recommended) ＃关闭
#Protocol 2

# Both v1 and v2 (not recommended) ＃开启，建议使用，增加兼容性
Protocol 2,1

# Only v1 (not recommended)
#Protocol 1

# Listen port (the IANA registered port number for ssh is 22)
Port 22

# The default listen address is all interfaces, this may need to be changed
# if you wish to restrict the interfaces sshd listens on for a multi homed host.
# Multiple ListenAddress entries are allowed.

# IPv4 only
#ListenAddress 0.0.0.0
# IPv4 & IPv6
ListenAddress ::

# Port forwarding
AllowTcpForwarding no

# If port forwarding is enabled, specify if the server can bind to INADDR_ANY.
# This allows the local port forwarding to work when connections are received
# from any remote host.
GatewayPorts no

# X11 tunneling options
X11Forwarding yes
X11DisplayOffset 10
X11UseLocalhost yes

# The maximum number of concurrent unauthenticated connections to sshd.
# start:rate:full see sshd(1) for more information.
# The default is 10 unauthenticated clients.
#MaxStartups 10:30:60

# Banner to be printed before authentication starts.
#Banner /etc/issue

# Should sshd print the /etc/motd file and check for mail.
# On Solaris it is assumed that the login shell will do these (eg /etc/profile).
PrintMotd no

# KeepAlive specifies whether keep alive messages are sent to the client.
# See sshd(1) for detailed description of what this means.
# Note that the client may also be sending keep alive messages to the server.
KeepAlive yes

# Syslog facility and level
SyslogFacility auth
LogLevel info

#
# Authentication configuration
#

# Host private key files
# Must be on a local disk and readable only by the root user (root:sys 600).
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_dsa_key

# Default Encryption algorithms and Message Authentication codes
#Ciphers        aes128-ctr,aes128-cbc,arcfour,3des-cbc,blowfish-cbc
#MACS   hmac-md5,hmac-sha1,hmac-sha1-96,hmac-md5-96

# Length of the server key
# Default 768, Minimum 512
ServerKeyBits 768

# sshd regenerates the key every KeyRegenerationInterval seconds.
# The key is never stored anywhere except the memory of sshd.
# The default is 1 hour (3600 seconds).
KeyRegenerationInterval 3600

# Ensure secure permissions on users .ssh directory.
StrictModes yes

# Length of time in seconds before a client that hasn't completed
# authentication is disconnected.
# Default is 600 seconds. 0 means no time limit.
LoginGraceTime 600

# Maximum number of retries for authentication
# Default is 6. Default (if unset) for MaxAuthTriesLog is MaxAuthTries / 2
MaxAuthTries    6
MaxAuthTriesLog 3

# Are logins to accounts with empty passwords allowed.
# If PermitEmptyPasswords is no, pass PAM_DISALLOW_NULL_AUTHTOK
# to pam_authenticate(3PAM).
PermitEmptyPasswords no

# To disable tunneled clear text passwords, change PasswordAuthentication to no.
PasswordAuthentication yes

# Use PAM via keyboard interactive method for authentication.
# Depending on the setup of pam.conf(4) this may allow tunneled clear text
# passwords even when PasswordAuthentication is set to no. This is dependent
# on what the individual modules request and is out of the control of sshd
# or the protocol.
PAMAuthenticationViaKBDInt yes

# Are root logins permitted using sshd.
# Note that sshd uses pam_authenticate(3PAM) so the root (or any other) user
# maybe denied access by a PAM module regardless of this setting.
# Valid options are yes, without-password, no.
PermitRootLogin yes

# sftp subsystem
Subsystem       sftp    /usr/lib/ssh/sftp-server


# SSH protocol v1 specific options
#
# The following options only apply to the v1 protocol and provide
# some form of backwards compatibility with the very weak security
# of /usr/bin/rsh.  Their use is not recommended and the functionality
# will be removed when support for v1 protocol is removed.

# Should sshd use .rhosts and .shosts for password less authentication.
IgnoreRhosts yes
RhostsAuthentication yes ＃开启

# Rhosts RSA Authentication 此处重点修改。
# For this to work you will also need host keys in /etc/ssh/ssh_known_hosts.
# If the user on the client side is not root then this won't work on
# Solaris since /usr/bin/ssh is not installed setuid.
RhostsRSAAuthentication yes ＃开启

AuthorizedKeysFile      .ssh/authorized_keys ＃增加这一行，关键的精髓


# Uncomment if you don't trust ~/.ssh/known_hosts for RhostsRSAAuthentication.
#IgnoreUserKnownHosts yes

# Is pure RSA authentication allowed.
# Default is yes
RSAAuthentication yes ＃开启
ChRootGroups sftp,guest
```

最后再测试一下

``` bash
rsync -av -e ssh <本地传输路径> root@<你的服务器ip>:<需要同步到服务器的路径>
```

可以把部署相关写到一个 `shell` 文件里，在当前目录下创建 `deploy.sh` 文件，复制粘贴下面代码

``` bash
#!/bin/bash

hexo clean # 清除缓存
hexo generate # 生成最新的博客的静态文件
echo "--静态文件已生成--"
rsync -av -e ssh <本地传输路径> root@<你的服务器ip>:<需要同步到服务器的路径> # 与服务器同步静态文件
echo "--自动化部署完成--"
```

然后在 `package.json` 里的 `scripts` 里添加下面这行

``` json
"deploy": "./deploy.sh"
```

然后在需要部署的时候直接 `npm run deploy` 就可以了

# 最后
有一些功能并不是主题或者插件，比如夜间模式切换功能、页脚显示邮箱等等，这些都是在主题源码的基础上做的更改

如果你喜欢我配置的主题可以直接 fork 我的代码然后做你的修改

博客的 `github` 地址为：[https://github.com/lvboda/blog](https://github.com/lvboda/blog)

如果你有任何问题，可以在下方评论留言

## 参考资料
- https://jeam.org/338f9b1
- https://www.ruanyifeng.com/blog/2020/08/rsync.html
- https://blog.csdn.net/lxholding/article/details/1860526
- https://www.cnblogs.com/lywJ/p/10710361.html
