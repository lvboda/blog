---
title: Gitalk配置
categories: 博客搭建
tags:
  - Gitalk
  - blog
abbrlink: 2eae
date: 2022-08-14 14:17:50
---

# 前言
Gitalk 是一个基于 GitHub Issues 和 Preact 开发的评论插件，与之类似的项目还有 Gitment

本文主要以本博客为例讲述 Gitalk 的配置以及如何实现自动初始化 issues

# 配置Gitalk
因为插件是基于 GitHub Issues 的，所以首先必须要有一个 GitHub 账号

没有的话[点这里](https://github.com/signup)去注册一下

然后我们需要创建一个用于储存评论的仓库，我这里直接用的是博客代码的仓库，你可以和我一样，也可以新建一个仓库

![](https://lvboda.cn/uploader/static/82f444fc3177974bf3d701f4fabc76b7.png)

![](https://lvboda.cn/uploader/static/755659b9afa8f884acee9c9e0319f0f7.png)

建好仓库后到 GitHub 的 [OAuth](https://github.com/settings/applications/new) 页面新建一个新的 OAuth 应用程序。

![](https://lvboda.cn/uploader/static/0cb1e45b6192b9648ff117e64fa02d3c.png)

点击 Generate a new client secret

![](https://lvboda.cn/uploader/static/9f3a0f3a2be69ce68e548e9233602a8b.png)

记住你的 Client ID 和 Client secrets （刷新页面后 Client secrets 就消失了）

完成上面的步骤后，来到 `_config.icarus.yml` 配置文件，我用的 `Icarus` 主题集成了 Gitalk 所以直接在配置文件里配置就可以，如果你用的主题没有集成或者你想在其他地方使用 Gitalk 的话，参考[官方文档](https://github.com/gitalk/gitalk/blob/master/readme-cn.md)进行使用

``` yml
comment:
    type: gitalk
    client_id: '' # 刚才复制的 Client ID 
    client_secret: '' # 刚才复制的 client secret
    repo: '' # 存储评论的仓库名
    owner: 'lvboda' # 你的账号id
    admin: ['lvboda'] # 仓库的所有者和合作者 (对这个 repository 有写权限的用户)
    language: zh-CN # 语言
    per_page: 20 # 每次加载数据条数
    pager_direction: last # 排序方式
    distraction_free_mode: false # 全屏遮罩效果
    create_issue_manually: true # 如果当前页面没有相应的 isssue 且登录的用户属于 admin，则会自动创建 issue。如果设置为 true，则显示一个初始化页面，创建 issue 需要点击 init 按钮
    proxy: '' # 这里一会讲
```

## 配置Proxy
proxy 这里单独讲一下

获取 access_token 这一步是禁止跨域的POST请求

`POST https://github.com/login/oauth/access_token`

出于一些安全问题, OAuth 验证无法在纯粹的浏览器内完成，所以需要做一下代理转发

GitHub 上的相关问题：[https://github.com/isaacs/github/issues/330]()

proxy 默认值是 `https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token`， 但是这个国内网络是不支持的，所以我推荐自己配置一个转发的服务

``` conf
    # proxy
    location /proxy/ {
            proxy_pass $arg_addr;
    }
```

在 `nginx.conf` 配置文件里的 `server` 配置中加入上面的配置

``` yml
    proxy: 'https://<你的服务器ip或域名>/proxy/?addr=https://github.com/login/oauth/access_token'
```

然后就可以了，就这么简单。如果没有服务器的话可以使用一些第三方的服务，这里就不例举了


# 自动初始化Issues

Gitalk 最新版本有一项配置 `createIssueManually` 默认为 `false` 是可以自动初始化 Issues 的，如果该项配置为 `true` 则需要手动点击初始化 Issues

我这里还提供一个自动初始化 Issues 的脚本贴在下面

``` js
/**
 * gitalk自动初始化issues脚本
 * 
*/
const fs = require("fs");
const path = require("path");
const url = require("url");
const request = require("request");
const xmlParser = require("xml-parser");
const YAML = require("yamljs");
const cheerio = require("cheerio");
const crypto = require('crypto');

// 根据自己的情况进行配置
const config = {
    username: "", // GitHub 用户名
    token: "",  // GitHub Token
    repo: "blog", // 存放 issues的git仓库
    sitemapUrl: path.resolve(__dirname, "./public/sitemap.xml"), // sitemap.xml的路径，gitalk.init.js放置在根目录下，无需修改，其他情况自行处理
    kind: "Gitalk",
};

const urlList = sitemapXmlReader(path.resolve(__dirname, "../public/sitemap.xml"));
const websiteConfig = YAML.parse(fs.readFileSync(path.resolve(__dirname, "../_config.yml"), "utf8"));
const issuesUrl = `https://api.github.com/repos/${config.username}/${config.repo}/issues`;

const requestGetOpt = {
    url: `${issuesUrl}?page=1&per_page=1000`,
    json: true,
    headers: {
        "User-Agent": "github-user",
        "Authorization": `token ${config.token}`,
    }
};

const requestPostOpt = {
    ...requestGetOpt,
    url: issuesUrl,
    method: "POST",
    body: {},
};

console.log("开始初始化评论...");

(async function() {
    console.log("开始检索链接，请稍等...");
    
    try {
        console.log("开始获取已经初始化的issues:");
        const issueList = await send(requestGetOpt);
        console.log(`已经存在${issueList.length}个issues`);

        const notInitIssueUrlList = urlFilter(urlList, issueList);

        if (notInitIssueUrlList.length > 0) {
            console.log(`本次有${notInitIssueUrlList.length}个链接需要初始化issue：`);
            console.log(notInitIssueUrlList.map((item) => decodeURIComponent(item)));
            console.log("开始提交初始化请求, 大约需要40秒...");
            /**
             * 部署好网站后，直接执行start，新增文章并不会生成评论
             * 经测试，最少需要等待40秒，才可以正确生成， 怀疑跟github的api有关系，没有找到实锤
             */
            setTimeout(async ()=>{
                for (const notInitIssueUrl of notInitIssueUrlList) {
                    const html = await send({ ...requestGetOpt, url: notInitIssueUrl });
                    const title = cheerio.load(html)("title").text();
                    const desc = decodeURIComponent(notInitIssueUrl) + "\n\n" + cheerio.load(html)("meta[name='description']").attr("content");
                    let pathLabel = url.parse(notInitIssueUrl).path.replace(websiteConfig.root || "", "");
                    // pathLabel.substring(0, 1) === "/" && (pathLabel = pathLabel.replace("/", ""));
                    const label = crypto.createHash('md5').update(decodeURIComponent(pathLabel)).digest('hex');
                    await send({ ...requestPostOpt, body: { body: desc, labels: [config.kind, label], title } });
                }
                console.log(`初始化issues成功，完成${notInitIssueUrlList.length}个！`);
            }, 40000);
        } else {
            console.log("本次发布无新增页面，无需初始化issue!!");
        }
    } catch (e) {
        console.log(`初始化issue出错，错误如下：`);
        console.log(e);
    }
})();

function sitemapXmlReader(file) {
    let data = fs.readFileSync(file, "utf8");
    let sitemap = xmlParser(data);
    return sitemap.root.children.map(function (url) {
        let loc = url.children.filter(function (item) {
            return item.name === "loc";
        })[0];
        return loc.content;
    });
}

function urlFilter(urlList, issueList) {
    if (!urlList || !Array.isArray(urlList) || !issueList || !Array.isArray(issueList)) throw Error("");

    return urlList.filter((url) => {
        const path = decodeURIComponent(new URL(url).pathname).replace(websiteConfig.root || "", "");

        const isPathFormat = path && path !== "/" && !/categories|tags|friends|about/g.test(path);
        const hasIssues = issueList.findIndex((issue) => issue.body.includes(path)) !== -1;

        return isPathFormat && !hasIssues;
    });
}

function send(options) {
    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (!error) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

```

配置完直接用 node 跑就可以，也可以把它放在部署脚步中执行

``` bash
#!/bin/bash

hexo clean
hexo generate
echo "--静态文件已生成--"
rsync -av -e ssh public/ roo<你的服务器ip>:/usr/local/nginx/html/blog/
echo "--自动化部署完成--"
node script/gitalk-auto-init-issues.js
echo "--自动初始化issues完成--"
```

# 最后
还有一个类似的开源项目是 `Gitment` 但是个人觉得还是 `Gitalk` 的 ui 做的比较好看，所以就用了这个，这个插件也有一个缺点就是必须要有 GitHub 账号才可以评论，如果是用来写计算机相关的技术博客那受众人群应该都会有 GitHub 账号，不是技术博客就不推荐这类的插件了，看个人选择吧

## 参考资料
- https://jeam.org/d8711f7
- https://cloud.tencent.com/developer/article/1702501
