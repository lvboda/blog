<p align="center" class="mb-2">
<img class="not-gallery-item" height="48" src="https://img.jeam.cc/hotlink-ok/favicon-1.png">
<br> 通过参考大佬们的文章修改而成
<br>
<a href="https://jeam.org/">Preview</a>
<br>
</p>
注意：除非有特别大的界面更改，如https://github.com/ppoffice/hexo-theme-icarus/issues/1114 ，否则将不进行更新（主要是改主题太耗时了）

## 使用说明

1. 如果没有安装过这个主题的先安装

```
npm install hexo-theme-icarus
hexo config theme icarus
```

2. 下载这里的主题 [点这](https://github.com/jeam-xyz/hexo-theme-icarus/archive/refs/heads/master.zip) 下载完后解压到博客根目录下的`theme`文件夹中，并且把名字改成`icarus`
3. 进入主题文件夹，把`root`文件夹里面的文件移到博客根目录，删除`root`这个文件夹
4. 在主题根目录找到`_config.yml`这个文件，修改里面的`theme:`为`theme: icarus`（此操作是将icarus改为博客主题）
5. 如果要默认显示目录则在`_config.yml`这个文件最后添加`toc: true`
6. 此主题默认没有开启评论功能，如果要开启评论功能或者修改一些简单的布局请在`_config.icarus.yml`里面修改。亦可参考这篇文章：[jeam.org](https://jeam.org/d8711f7.html)
6. 如果要修改`友链`或`关于`请修改博客根目录下的`source`文件夹里面的`friends`或`about`
6. 安装自动摘录（默认是350字，如果需要则自行修改）(本博客是112字，修改位置是`node_modules\hexo-auto-excerpt\index.js`里的第17行）

```
npm install --save hexo-auto-excerpt
```

9. 在`themes\icarus\layout\common\footer.jsx`的文件里面的第44行可以改脚页的建站时间

**参考：**

- [https://www.alphalxy.com](https://www.alphalxy.com/2019/03/customize-icarus/)
- [http://www.anticme.com](http://www.anticme.com/2021/03/26/icarus%E4%B8%AA%E6%80%A7%E5%8C%96%E9%85%8D%E7%BD%AE/)
- [https://astrobear.top](https://astrobear.top/2021/08/23/Hexo%E4%B8%BB%E9%A2%98Icarus%E7%9A%84%E8%87%AA%E5%AE%9A%E4%B9%89/)



## 图片展示（部分）

![](https://img.jeam.cc/202201042023323.png)

![](https://img.jeam.cc/202201042024726.png)

![](https://img.jeam.cc/202201042053721.png)
