hexo clean
hexo generate
rsync -av -e ssh public/ root@101.34.75.4:/usr/local/nginx/html/blog/
node gitalk-auto-init.js