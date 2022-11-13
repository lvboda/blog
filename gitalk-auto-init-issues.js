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
// const config = {
//     username: "", // GitHub 用户名
//     token: "",  // GitHub Token
//     repo: "",  // 存放 issues的git仓库
//     // sitemap.xml的路径，gitalk.init.js放置在根目录下，无需修改，其他情况自行处理
//     kind: "Gitalk",  // "Gitalk" or "Gitment"
//     sitemapUrl: path.resolve(__dirname, "./public/sitemap.xml"),
//     websiteConfig: YAML.parse(fs.readFileSync(path.resolve(__dirname, "./_config.yml"), "utf8")),
// };


const urlList = sitemapXmlReader(path.resolve(__dirname, "./public/sitemap.xml"));
const websiteConfig = YAML.parse(fs.readFileSync(path.resolve(__dirname, "./_config.yml"), "utf8"));
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
                    const pathLabel = url.parse(notInitIssueUrl).path.replace(websiteConfig.root || "", "");
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

    function checkoutPathFormat(path) {
        const pathArr = path?.split("/");
        if (!pathArr || pathArr.length < 4) return;
        const date = `${pathArr[0]}-${pathArr[1]}-${pathArr[2]}`;
        return new Date(date).getDate() == date.substring(date.length - 2);
    }

    return urlList.filter((url) => {
        const path = decodeURIComponent(new URL(url).pathname).replace(websiteConfig.root || "", "");

        const isPathFormat = checkoutPathFormat(path);
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
