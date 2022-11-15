/**
 * 替换markdown里所有的图片跟路径
 * 
*/
const path = require("path");
const fs = require("fs");

// 替换前的url
const replaceBefore = "https://fastly.jsdelivr.net/gh/lvboda/figure-bed@main/images";
// 要替换成的url
const replaceAfter = "11";

// _posts文件夹路径
const postsPath = path.resolve(__dirname, "./source/_posts");

console.log("开始替换markdown里的图片url");
(function() {
    try {
        readDirSync(postsPath);
    } catch(err) {
        console.log("处理发生错误, 错误内容如下: ");
        console.log(err);
    } finally {
        console.log("处理完成");
    }
}())

function replaceImgRoot(mdPath) {
    let res = fs.readFileSync(mdPath, "utf8");

    // 用正则避免替换到非图片的url
    // ![](path)
    res = res.replace(new RegExp(`!\\[(.*?)\\]\\((.*?)\\)`, "g"), (_, p1, p2) => {
        return `![${p1}](${p2.replace(replaceBefore, replaceAfter)})`;
    });

    // <img src="path" />
    res = res.replace(new RegExp(`<img [^>]*src=['"]([^'"]+)[^>]*>`, "g", "i"), (str, p1) => {
        return str.replace(p1, p1.replace(replaceBefore, replaceAfter));
    });

    fs.writeFileSync(mdPath, res, "utf8");
}

function readDirSync(root) {
	fs.readdirSync(root).forEach((child) => {
        const childPath = path.join(root, child);

		if (fs.statSync(childPath).isDirectory()) {
			readDirSync(childPath);
            return;
		}

        if (childPath.endsWith(".md")) {
            console.log("处理", child);
            replaceImgRoot(childPath);
        }
	})
}



