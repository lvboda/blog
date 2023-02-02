---
title: 快速上传图片的vscode插件
categories: 项目开发记录
tags:
  - vscode
  - 图床
  - img fast
abbrlink: c8
date: 2022-12-07 18:35:09
---

# 前言
Img Fast 是一个可以快速上传剪切板图片并获取图片 URL 的 vscode 插件。

本文记录该插件的开发思路及详细开发过程。

# 使用
使用方面可以直接查看项目的 README 文档：https://github.com/lvboda/vscode-img-fast

# 思路
1. 获取剪贴板图片的二进制数据
2. 根据配置生成上传函数等待调用
3. 监听粘贴事件，并调用上传函数上传剪切板图片

其实看上去比较简单，但实际开发中会遇到很多细节问题，因为是在 vscode 的规范下。

# 创建项目
全局安装 yeoman 脚手架工具和 generator-code VSCode代码生成器：

``` bash
npm install -g yo
npm install -g generator-code
```

执行如下代码创建项目：

``` bash
yo code
```

![](https://lvboda.cn/uploader/static/b00f1385338224027bc462d90eddc50b.png)

根据提示进行选择，完成后会自动创建文件夹并帮助初始化完成文件，我们先来看下目录结构。

```
|-- src
   |-- test // 插件单测文件
   |-- extension.js // 插件入口文件
|-- CHANGELOG.md // 修改日志，发布后会展示
|-- package-lock.json
|-- package.json
|-- README.md // 插件说明 README，发布后会展示
|-- tsconfig.json
|-- tslint.json
|-- vsc-extension-quickstart.md // 插件开发说明 
```

两个关键点：
1. extension.js 是插件的入口文件
2. package.json包含插件的配置信息（插件命令、快捷键、菜单均在此配置）

# 启动项目
在 vscode 中F5运行（或Debug->start）如果你可以看到 vscode 又启动了一个窗口运行插件项目，shift+ctrl+p 输入 Hello World 如果在右下角能看到 Hello World 的提示信息就OK 了。

# package.json配置
``` json
{
  "name": "vscode-img-fast", // 插件名
  "displayName": "Img Fast", // 插件名，显示在应用市场，支持中文
  "description": "A vscode plugin that can quickly upload clipboard images and get image URL.", // 描述
  "version": "1.0.2", // 版本
  "publisher": "lvboda", // 发布者，如果要发布到应用市场的话，这个名字必须与发布者一致
  "author": { // 作者信息
    "name": "Boda Lü",
    "url": "https://lvboda.cn",
    "email": "lv_boda@163.com"
  },
  "license": "SEE LICENSE IN LICENSE", // 许可
  "repository": { // 储存库
    "type": "git",
    "url": "https://github.com/lvboda/vscode-img-fast.git"
  },
  "icon": "images/logo.png", // logo
  "homepage": "https://github.com/lvboda/vscode-img-fast/blob/master/README.md",
  "bugs": {
    "url": "https://github.com/lvboda/vscode-img-fast/issues"
  }, // 关键字，用于应用市场搜索
  "keywords": [
    "img-fast",
    "figure bed",
    "image",
    "picture",
    "paste",
    "upload",
    "markdown",
    ".md",
    "picgo",
    "图床",
    "图片粘贴",
    "粘贴上传",
    "图片上传"
  ], 
  "engines": { // 表示插件最低支持的vscode版本
    "vscode": "^1.73.0"
  },
  "categories": [ // 插件应用市场分类，可选值： [Programming Languages, Snippets, Linters, Themes, Debuggers, Formatters, Keymaps, SCM Providers, Other, Extension Packs, Language Packs]
    "Other"
  ],
  "activationEvents": [ // 扩展的激活事件数组，
    "onLanguage:markdown", // 当打开 markdown 文件激活
    "onCommand:img-fast.upload",
    "onCommand:img-fast.delete"
  ],
  "main": "./out/extension.js", // 入口文件
  "contributes": {
    "commands": [ // 命令
      {
        "command": "img-fast.upload",
        "title": "%package.commands.upload%"
      },
      {
        "command": "img-fast.delete",
        "title": "%package.commands.delete%"
      }
    ],
    "configuration": { // 配置设置
      "type": "object", // 类型
      "title": "%package.configuration.title%", // 标题
      "properties": {
        "img-fast.openPasteAutoUpload": { 
          "type": "boolean",
          "default": true, // 默认值
          "description": "%package.configuration.openPasteAutoUpload%" // 描述
        },
        "img-fast.openDeleteHover": {
          "type": "boolean",
          "default": true,
          "description": "%package.configuration.openDeleteHover%"
        },
        "img-fast.authorization": {
          "type": "string",
          "default": "your token...",
          "description": "%package.configuration.authorization%"
        },
        "img-fast.imgRename": {
          "type": "string",
          "default": "${hash}-${yyyy}-${MM}-${dd}-${hh}-${mm}-${ss}-${timestamp}-${name}",
          "description": "%package.configuration.imgRename%"
        },
        "img-fast.outputRename": {
          "type": "string",
          "default": "![${name}](${url})",
          "description": "%package.configuration.outputRename%"
        },
        "img-fast.uploadUrl": {
          "type": "string",
          "default": "",
          "description": "%package.configuration.uploadUrl%"
        },
        "img-fast.uploadMethod": {
          "type": "string",
          "enum": [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
          ],
          "default": "POST",
          "description": "%package.configuration.uploadMethod%"
        },
        "img-fast.uploadFormDataKey": {
          "type": "string",
          "default": "file",
          "description": "%package.configuration.uploadFormDataKey%"
        },
        "img-fast.uploadedKey": {
          "type": "string",
          "default": "",
          "description": "%package.configuration.uploadedKey%"
        },
        "img-fast.deleteUrl": {
          "type": "string",
          "default": "",
          "description": "%package.configuration.deleteUrl%"
        },
        "img-fast.deleteMethod": {
          "type": "string",
          "enum": [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
          ],
          "default": "DELETE",
          "description": "%package.configuration.deleteMethod%"
        },
        "img-fast.deleteQueryKey": {
          "type": "string",
          "default": "",
          "description": "%package.configuration.deleteQueryKey%"
        },
        "img-fast.deletedFlag": {
          "type": "string",
          "enum": [
            "none",
            "url",
            "layout"
          ],
          "default": "layout",
          "description": "%package.configuration.deletedFlag%"
        }
      }
    }
  }
}

```

这是 Img Fast 的 package.json，我直接粘过来了，可作为参考。

# 配置项
``` ts
const defaultConfig = {
    openPasteAutoUpload: true, // 是否开启粘贴图片自动上传
    openDeleteHover: true, // 是否开启删除悬浮窗口
    authorization: "", // 上传接口请求头的 authorization 字段
    imgRename: "${hash}-${yyyy}-${MM}-${dd}-${hh}-${mm}-${ss}-${timestamp}-${name}", // 图片上传前的重命名的格式
    outputRename: "![${name}](${url})", // 输出字符的重命名格式
    uploadUrl: "", // 上传接口 url
    uploadMethod: "POST", // 上传接口方法
    uploadFormDataKey: "", // 上传的 FormData 键
    uploadedKey: "", // 上传后的 json 数据的图片 url 的 key
    deleteUrl: "", // 删除接口 url
    deleteMethod: "DELETE", // 删除接口方法
    deleteQueryKey: "", // 上传 query 参数的 key
    deletedFlag: "layout", // 删除的格式
};

function genConfig(config: WorkspaceConfiguration) {
    return Object.entries(defaultConfig).reduce((pre, [key]) => {
        return { ...pre, [key]: config.get(key) };
    }, defaultConfig);
}

// 获取配置项
export function getConfig() {
    return genConfig(workspace.getConfiguration(PLUGIN_NAME));
}
```

# 上传功能实现
首先看一下入口文件 extension.ts，这里我们注册一个上传命令：
``` ts
export function activate(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand('vscode-img-fast.upload', createOnCommandUploadHandler()),
	);
}
```

看一下 `createOnCommandUploadHandler` 的实现：
``` ts
export function createOnCommandUploadHandler() {
    // 入参为要插入图片 url 的位置，为空则是当前光标所在位置
    async function handler(editRange?: Range) {
        // 初始化日志和临时文件存储路径
        await initPath();

        // 获取剪切板图片返回 image 对象列表
        const images = await getClipboardImages();
        // 为空则不做处理
        if (!images.length) return [];
        const outputTexts: string[] = [];

        // 可能复制多个图片，所以循环处理
        for (const image of images) {
            // vscode 底边栏显示上传状态
            showStatusBar(`${localize("handler.uploading")}${image.basename}...`);
            // 上传之前的钩子函数
            beforeUpload(image);
            // 上传图片
            const res = await uploadImage(image);
            // 上传后的钩子函数，返回最后要显示到编辑器的文本内容
            const text = uploaded(res, image);
            // 如果文本有值，push 到 outputTexts 存起来
            text.length && outputTexts.push(text);
        }

        // 调用 vscode 提供的 api 把 outputTexts 里的内容插入到对应位置（editRange有值则插入，没有则插入当前光标所在位置）
        const editor = window.activeTextEditor;
        editor?.edit((editBuilder) => {
            if (editRange) {
                editBuilder.delete(editRange);
                editBuilder.insert(editRange.start, outputTexts.join("\n"));
            } else {
                editBuilder.insert(editor.selection.start, outputTexts.join("\n"));
            }
        });

        // 清除本次操作产生的临时文件
        emptyDir(IMAGE_DIR_PATH);
        // 隐藏底边栏
        hideStatusBar();

        // 返回输出内容
        return outputTexts;
    };

    // 用错误处理函数包一下返回
    return invokeWithErrorHandler(handler);
}
```

## 获取剪切板图片
获取剪切板图片核心用到了 electron-clipboard-ex 这个库，它支持 windows 和 mac 的剪切板图片获取，主要看一下 getClipboardImages 函数：
``` ts
// 引入 electron-clipboard-ex
import { hasImage, readFilePaths, saveImageAsPng } from 'electron-clipboard-ex';

export type Image = {
    basename: string; // 图片全名
    name: string; // 图片名（无后缀）
    format: Format; // 图片格式
    path: string; // 图片存储路径
    hash: string; // 图片md5值
    beforeUploadPath: string; // 上传前的存储路径（临时文件目录下的）
    beforeUploadName: string; // 上传前的图片名
    url?: string; // 上传成功后返回的 url
};

// 图片格式
enum Format {
    png = 'png',
    jpg = 'jpg',
    jpeg = 'jpeg',
    bmp = 'bmp',
    gif = 'gif',
    webp = 'webp',
    psd = 'psd',
    svg = 'svg',
    tiff = 'tiff',
}

// 格式转换
function toFormat(str: string) {
    return Format[str as keyof typeof Format];
}

// 检查是否为 Format 类型
function checkFormat(ext: string): ext is Format {
    let flag = false;

    for (const item in Format) {
        ext === item && (flag = true);
    }

    return flag;
}

// 生成 Image 对象
export function genImage(
    basename: string,
    name: string,
    format: Format,
    path: string,
    hash: string,
    beforeUploadPath = "",
    beforeUploadName = "",
    url?: string
): Image {
    return { basename, name, format, path, hash, beforeUploadPath, beforeUploadName, url };
}

// 通过图片路径生成 Image 对象
export function genImageWith(filePath?: string) {
    if (!filePath || !filePath.length) return;

    const imgBasename = path.basename(filePath);
    const ext = path.extname(filePath);
    const imgName = imgBasename.replace(ext, "");
    const imgFormat = ext.replace(".", "");
    if (!imgBasename || !imgFormat || !checkFormat(imgFormat)) return;

    return genImage(imgBasename, imgName, toFormat(imgFormat), filePath, getFileHash(filePath));
}

// 通过图片路径列表生成 Image 对象列表
export function genImagesWith(filePaths?: string[]) {
    return filePaths && filePaths.length ? filePaths.map(genImageWith).filter((item) => !!item) as Image[] : [];
}

// 判断一个路径是否为图片文件
export function isImage(path: string) {
    return !!genImageWith(path);
}

// 判断两个 Image 对象是否相同
export function isEqual(image1: Image, image2: Image) {
    return (
        image1.hash === image2.hash &&
        image1.beforeUploadPath === image2.beforeUploadPath &&
        image1.beforeUploadName === image2.beforeUploadName &&
        image1.url === image2.url
    );
}

// 获取剪贴板图片
export async function getClipboardImages() {
    // 调用 electron-clipboard-ex 提供的 api 获取当前剪切板的文件路径数组并转换为 Image 对象的数组
    const resolvedImages = genImagesWith(readFilePaths());

    // 如果剪切板里没有图片直接返回空数组
    if (!hasImage() && !resolvedImages.length) return [];

    // 如果剪切板里有图片但是没有文件路径，说明图片为截图并获取不到图片路径（为二进制数据）
    if (hasImage() && !resolvedImages.length) {
        // 在临时文件目录下新建 screenshot.png 文件
        const tempPath = path.resolve(IMAGE_DIR_PATH, "screenshot.png");
        // 写数据到临时路径
        const ok = await saveImageAsPng(tempPath);
        // 转换成 Image 对象
        return ok ? [ genImage("screenshot.png", "screenshot", Format.png, tempPath, getFileHash(tempPath)) ] : [];
    }

    // 如果前两个 if 都没走到，说明复制的为本地图片（有文件路径），直接返回就可以
    return resolvedImages;
}
```

其实 Node 要获取剪切板里的二进制是一个很难的事情，所以我看了相关的实现，一般都是根据不同操作系统调用相关脚本来实现，而 electron-clipboard-ex 这个库是用 OC 和 C++ 来实现并提供接口来供 Node 调用的，比调用脚本会更简单一点。

## 监听粘贴事件实现自动上传
上面已经实现了上传剪切板图片的功能，并注册了上传命令，也就是通过在 vscode 中 `ctrl + shift + p` 输入 `vscode-img-fast.upload` 就可以上传剪切板图片了，也可以通过在 vscode 中绑定快捷键来实现快捷键上传。

但是如果不想绑定快捷键也不调用命令，想直接复制图片在编辑器里粘贴就能上传，这个功能我们接着往下看代码：
``` ts
// 入口文件 extension.ts 中
export function activate(context: ExtensionContext) {
	context.subscriptions.push(
    // 注册监听文字更新事件，执行时机：编辑器文字改变时
		workspace.onDidChangeTextDocument(createOnDidChangeTextDocumentHandler()),
	);
}
// createOnDidChangeTextDocumentHandler 函数实现
export function createOnDidChangeTextDocumentHandler() {
    // 如果 openPasteAutoUpload 配置不为 true 则直接返回
    if (!getConfig().openPasteAutoUpload) return () => void 0;

    let preText = ""; // 上一次发生改变的文字
    let preOutputText = ""; // 上一次上传的输出结果
    let prePosition: Position; // 上一次插入的位置信息
    async function handler(event: TextDocumentChangeEvent) {
        // 提取关键数据，text 为发生改变的文字，start 为文字发生改变的开始位置
        const { text, range: { start } } = getEventOpts(event);

        // 首先明确一下，在 vscode 编辑器中，粘贴图片文件会在当前光标查入复制的图片名称，比如：test.png
        // 所以我们判断粘贴的一定是一个 `.图片格式` 结尾的文本
        // 如果不是说明不是要上传图片所以直接返回
        // 如果粘贴的是上次上传成功后的文本信息（图片url），那也不是要上传图片，所以也直接返回
        if (!isImage(text) || preOutputText === text) return;
        // 如果是撤回操作直接返回（通过上次改变的文本和位置来判断是否为撤回操作）
        if (preText === text && prePosition && start.isEqual(prePosition)) return;

        // 走到这里说明粘贴的文本是一个正确图片格式的图片名
        // 处理多行数据的情况，比如复制多个图片就是多行图片名
        // 文字转数组
        const linesText = text.split("\n");
        // 粘贴后的文字是需要替换成图片 url 的，所以这部分代码是计算文字的位置的
        // 文字长度
        const delEndTextLen = linesText[linesText.length - 1].length;
        // 行
        const delLine = start.line + linesText.length - 1;
        // 长度
        const delCharacter = linesText.length > 1 ? delEndTextLen : start.character + delEndTextLen;
        // 坐标
        const editRange = new Range(start, new Position(delLine, delCharacter));

        // 调用 vscode-img-fast.upload 命令
        const outputUrls = await commands.executeCommand<string[]>(COMMAND_UPLOAD_KEY, editRange);

        // 如果输出为空说明粘贴的是格式正确文字，但剪切板里没有图片，所以直接返回
        if (!outputUrls.length) return;

        // 替换上一次的 output 数据
        const preEndTextLen = outputUrls[outputUrls.length - 1].length;
        const preLine = start.line + outputUrls.length - 1;
        const preCharacter = outputUrls.length > 1 ? preEndTextLen : start.character + preEndTextLen;
        prePosition = new Position(preLine, preCharacter);
        preOutputText = outputUrls.join("\n");
        preText = text;
    };

    // 错误处理
    return invokeWithErrorHandler(handler);
}
```

# 删除功能实现
``` ts
// 和上传一样注册一个上传命令
export function activate(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand("vscode-img-fast.delete", createOnCommandDeleteHandler()),
	);
}

// createOnCommandDeleteHandler的实现
export function createOnCommandDeleteHandler() {
    // 入参为要删除的 url 和要删除的文本位置
    async function handler(url?: string, position?: Position) {
        // 如果参数都没传
        if (!url || !position) {
            // 获取选中的位置信息
            const selection = window.activeTextEditor?.selection;
            // 获取整个文档
            const document = window.activeTextEditor?.document;
            if (!selection || !document) return;

            // 如果当前有选中的文本
            if (!selection.start.isEqual(selection.end)) {
                // 获取当前选中的文本
                const text = document.getText(selection);

                // 在当前选中的文本中匹配 url 
                const urls = matchUrls(text);
                let res;
                // 因为可能是多个所以循环
                for (const url of urls) {
                    // 看一下是不是正确的图片格式，如果不是直接返回
                    const image = genImageWith(url);
                    if (!image) return;
                    // 显示底边栏进度
                    showStatusBar(`${localize("handler.deleting")}${image.basename}...`);
                    // 调用删除接口
                    res = await deleteImage(image.basename);
                    // 隐藏底边栏
                    hideStatusBar();
                }
                // 调用钩子函数并返回
                deleted(res as AxiosResponse, "", new Position(NaN, NaN), selection);
                return;
            }

            // 走到这里说明没传参数，也没有选中文本
            // 获取当前光标所在行文本
            const text = document.lineAt(selection.start.line).text;
            // 匹配 url 
            const urls = matchUrls(text);
            if (!urls.length) return;
            // url 赋值
            url = urls[0];
            // position 位置赋值
            position = new Position(selection.start.line, NaN);
        }

        // 看一下是不是正确的图片格式，如果不是直接返回
        const image = genImageWith(url);
        if (!image) return;
        // 显示底边栏进度
        showStatusBar(`${localize("handler.deleting")}${image.basename}...`);
        // 调用上传接口并调用钩子函数
        deleted(await deleteImage(image.basename), url, position);
        // 隐藏底边栏
        hideStatusBar();
    };

    // 错误处理
    return invokeWithErrorHandler(handler);
}
```

这样就保证了权重大小：有参数 > 有选中的文本 > 什么也没有

## 注册HoverProvider
写好了删除命令还要写一个附加功能，就是鼠标悬浮在图片的 url 上就出现悬浮窗，点击悬浮窗上的删除文字即删除当前的图片url。

``` ts
// extension.ts 入口文件
// 给所有语言文件注册 HoverProvider
export function activate(context: ExtensionContext) {
	context.subscriptions.push(
		languages.registerHoverProvider("*", { provideHover: createOnHoverHandler() }),
	);
}

// createOnHoverHandler 实现
export function createOnHoverHandler() {
    // 判断有没有相应配置，没有直接返回
    const { openDeleteHover, deleteUrl } = getConfig();
    if (!openDeleteHover && !deleteUrl) return () => void 0;

    // 入参为文档和当前光标位置
    function handler(document: TextDocument, position: Position) {
        // 当前光标行文本
        const lineText = document.lineAt(position.line).text;
        // 匹配当前行所有的图片 url，返回数组
        const matchedUrls = matchUrls(lineText).filter((url) => (!!path.extname(url) && isImage(url)) || !path.extname(url));

        for (const matchedUrl of matchedUrls) {
            // 排除不是在当前光标位置的 url
            const urlStartIndex = lineText.indexOf(matchedUrl) - 1;
            const urlEndIndex = lineText.indexOf(matchedUrl) + matchedUrl.length;
            if (!(position.character > urlStartIndex && position.character < urlEndIndex)) continue;

            // 读取上传日志数据，看当前要删除的 url 是否上传过
            const hasRecord = readRecord().find((item) => item.image && item.image.url === matchedUrl);

            // 组合删除命令和参数变成一个可被 vscode 执行的 uri
            const commandUri = Uri.parse(`command:${COMMAND_DELETE_KEY}?${encodeURIComponent(JSON.stringify([matchedUrl, position]))}`);
            // 显示的文本：[ img-fast ] 同步删除，如果没查到上传记录则显示：[ img-fast ] 同步删除(未查询到该图片的上传记录，可能会删除失败)
            const contents = new MarkdownString(`[ ${PLUGIN_NAME} ] [${localize("handler.syncDelete")}](${commandUri})${!hasRecord ? ` (${localize("handler.syncDeleteTips")})` : ""}`);
            contents.isTrusted = true;

            // 返回 Hover 对象
            return new Hover(contents);
        }
    };

    // 错误处理
    return invokeWithErrorHandlerSync(handler);
}
```

# 钩子函数
一共有三个钩子函数，执行时机分别是上传图片前、上传图片后、删除图片后，直接看代码：
``` ts
// 生成一个自定义错误，为表示 http 请求失败
function genHttpError(res: AxiosResponse, title: string) {
    const { status, statusText, data, config } = res;
    return Error(`${title} | url: ${config.url}, method: ${config.method}, status: ${status}, statusText: ${statusText}, response: ${data}.`);
}

// 上传前的钩子函数
export function beforeUpload(image: Image) {
    // 根据 imgRename 字段转换图片名
    const beforeUploadName = customFormat(getConfig().imgRename, image);
    // 生成 path，在临时文件目录
    const beforeUploadPath = path.resolve(IMAGE_DIR_PATH, `${beforeUploadName}.${image.format}`);
    // 拷贝图片到临时文件目录
    fs.copyFileSync(image.path, beforeUploadPath);
    // 给当前 Image 对象属性赋值
    image.beforeUploadName = beforeUploadName;
    image.beforeUploadPath = beforeUploadPath;
}

// 上传后的钩子函数
export function uploaded(res: AxiosResponse, image: Image) {
    const { uploadedKey, outputRename } = getConfig();

    // 根据 uploadedKey 配置字段找到返回值里的 url
    image.url = uploadedKey && JSON.parse(res.data) && JSON.parse(res.data)[uploadedKey];
    // 如果没有根据 uploadedKey 匹配到值，则匹配第一个出现的 url
    !image.url && (image.url = matchUrls(res.data.replace(/\\/g, ""))[0]);
    // 记录上传日志
    writeRecord(res, image);

    // 上传失败则抛出错误
    if (res.status !== 200) throw genHttpError(res, localize("hook.uploadStatusError"));

    if (!image.url) throw genHttpError(res, localize("hook.uploadNoMatchedUrl"));

    return customFormat(outputRename, image);
}

// 删除后的钩子函数
export function deleted(res: AxiosResponse, url: string, position: Position, delRange?: Range) {
    // 记录日志
    writeRecord(res);

    // 失败抛出错误
    if (res.status !== 200) throw genHttpError(res, localize("hook.deleteStatusError"));

    // 获取修改器
    const editor = window.activeTextEditor?.edit;
    const document = window.activeTextEditor?.document;
    if (!editor || !document) return;

    editor((editBuilder) => {
        // 如果有删除的位置信息则直接删除
        if (delRange) {
            editBuilder.delete(delRange);
            return;
        }

        const lineText = document.lineAt(position.line).text;
        // 根据 deletedFlag 配置字段，去匹配对应文本并删除
        switch (getConfig().deletedFlag) {
            case "url": // 只删除 url
                const start = lineText.indexOf(url);
                editBuilder.delete(new Range(new Position(position.line, start), new Position(position.line, start + url.length)));
                break;
            case "layout": // 删除 ![url]() 格式或 <img src="url"/> 或 <img src="url"><img/>
                let matched = lineText.match(new RegExp(`\\!\\[.*?\\]\\(${url}.*?\\)`, "g"));
                !matched && (matched = lineText.match(new RegExp(`\\<img.*?src=("|')${url}("|').*\\>.*\\<*img.*\\/\\>`, "g")));
                !matched && (matched = lineText.match(new RegExp(`\\<img.*?src=("|')${url}("|').*\\/>`, "g")));
                !matched && (matched = [url]);

                const resolved = matched
                    .map((item) => ({ start: lineText.indexOf(item), end: lineText.indexOf(item) + item.length }))
                    .filter((item) => (position.character && item.start < position.character && item.end > position.character) || !position.character);

                editBuilder.delete(new Range(new Position(position.line, resolved[0].start), new Position(position.line, resolved[0].end)));
                break;
            default:
                // none;
                break;
        }
    });
}
```

# 国际化
在项目文件下新建 package.nls.语言.json 格式的文件，内容示例：
``` json
// package.nls.zh-cn.json
{
    "package.commands.upload": "上传剪切板图片",
    "package.commands.delete": "同步删除云端图片"
}
```

新建 localize.ts 文件，代码如下：
``` ts
import * as fs from "node:fs";
import * as path from "node:path";
import { extensions } from "vscode";

import { PLUGIN_PUBLISHER, PLUGIN_FULL_NAME } from './constant';

export class Localize {
    private bundle = this.resolveLanguagePack();
    private options = { locale: "" };

    public localize(key: string, ...args: string[]): string {
        const message = this.bundle[key] || key;
        return this.format(message, args);
    }

    private init() {
        try {
            this.options = {
                ...this.options,
                ...JSON.parse(process.env.VSCODE_NLS_CONFIG || "{}")
            };
        } catch (err) {
            throw err;
        }
    }

    private format(message: string, args: string[] = []): string {
        return args.length
            ? message.replace(
                /\{(\d+)\}/g,
                (match, rest: any[]) => args[rest[0]] || match
            )
            : message;
    }

    private resolveLanguagePack(): Record<string, string> {
        this.init();

        const languageFormat = "package.nls{0}.json";
        const defaultLanguage = languageFormat.replace("{0}", "");

        const rootPath = extensions.getExtension(`${PLUGIN_PUBLISHER}.${PLUGIN_FULL_NAME}`)?.extensionPath as string;

        const resolvedLanguage = this.recurseCandidates(
            rootPath,
            languageFormat,
            this.options.locale
        );

        const languageFilePath = path.resolve(rootPath, resolvedLanguage);

        try {
            const defaultLanguageBundle = JSON.parse(
                resolvedLanguage !== defaultLanguage
                    ? fs.readFileSync(path.resolve(rootPath, defaultLanguage), "utf-8")
                    : "{}"
            );

            const resolvedLanguageBundle = JSON.parse(
                fs.readFileSync(languageFilePath, "utf-8")
            );

            return { ...defaultLanguageBundle, ...resolvedLanguageBundle };
        } catch (err) {
            throw err;
        }
    }

    private recurseCandidates(
        rootPath: string,
        format: string,
        candidate: string
    ): string {
        const filename = format.replace("{0}", `.${candidate}`);
        const filepath = path.resolve(rootPath, filename);
        if (fs.existsSync(filepath)) {
            return filename;
        }
        if (candidate.split("-")[0] !== candidate) {
            return this.recurseCandidates(rootPath, format, candidate.split("-")[0]);
        }
        return format.replace("{0}", "");
    }
}

export default Localize.prototype.localize.bind(new Localize());
```

在代码中使用：
``` ts
import localize from './localize';
localize("package.commands.upload")
```

在 package.json 中使用：
``` json
{
  "contributes": {
    "commands": [
      {
        "command": "img-fast.upload",
        "title": "%package.commands.upload%"
      }
    ]
  }
}
```

# 打包发布
首先全局安装 vsce
``` bash
npm i vsce -g
```
## 本地打包
``` bash
vsce package # 打包 vsix 文件
```

> vsix 文件可以在 vscode 插件市场右上角引入

## 发布
1、 创建 Microsoft 账号

2、 创建 Azure组织

3、 创建 PAT（Personal Access Token，个人访问令牌）

4、 使用 vsce 命令
``` bash
vsce login <publisher>
vsce publish
```

# 最后
项目的 github 地址：https://github.com/lvboda/vscode-img-fast

## 参考文献
- https://code.visualstudio.com/api
- https://www.cnblogs.com/liuxianan/p/vscode-plugin-overview.html