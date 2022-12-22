#!/bin/bash

hexo clean
hexo generate
echo "--静态文件已生成--"
gulp
echo "--静态文件压缩完成--"
rsync -av -e ssh public/ root@101.34.75.4:/usr/local/nginx/html/blog/
echo "--自动化部署完成--"
node script/gitalk-auto-init-issues.js
echo "--自动初始化issues完成--"