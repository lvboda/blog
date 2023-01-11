---
title: 理解Promise
categories: JavaScript
tags:
  - es6
  - promise
abbrlink: 7eb7
date: 2022-09-02 11:49:36
---

# 本文目标
从一脸懵逼，到认识、掌握并使用Promise……

ES2015出来之后，什么箭头函数、类声明、解构赋值等新概念冒了出来，其中一个重要的概念就是Promise。不学会Promise，都不好意思说自己懂ES6了！

那么Promise到底是个什么鬼？！像我这样的JavaScript小菜，初次看到，着实一脸懵逼。

# 本文结构
本文从下面几个问题，逐步了解JavaScript Promise的概念和用法，重点是概念啦，用法什么的网上有很多资料参考

- Promise是什么？
- 有什么用？解决了什么问题？
- 怎么使用Promise?

剩下部分整理了一些Promise习题和示例，以及参考资料
- 习题和示例
- 参考资料

# 是什么
当我们谈到，或者看到别人提及Promise的时候，什么回调函数、异步编程、流程控制这样的术语冒了出来，还有，取了个Promise这样的名字，究竟是何含义。首先通通都别care，没那么复杂。

Promise说得通俗一点就是一种写代码的方式，并且是用来写JavaScript编程中的异步代码的。

# 基本用法
首先要认清最基本的用法。一般学习Promise看到的第一段代码是这样：
``` js
let p = new Promise((resolve, reject) => {
  // 做一些事情
  // 然后在某些条件下resolve，或者reject
  if (/* 条件随便写^_^ */) {
    resolve()
  } else {
    reject()
  }
})

p.then(() => {
    // 如果p的状态被resolve了，就进入这里
}, () => {
    // 如果p的状态被reject
})
```

## 解释一下
第一段调用了Promise构造函数，第二段是调用了promise实例的.then方法

1. 构造实例
- 构造函数接受一个函数作为参数
- 调用构造函数得到实例p的同时，作为参数的函数会立即执行
- 参数函数接受两个回调函数参数resolve和reject
- 在参数函数被执行的过程中，如果在其内部调用resolve，会将p的状态变成fulfilled，或者调用reject，会将p的状态变成rejected

2. 调用.then
- 调用.then可以为实例p注册两种状态回调函数
- 当实例p的状态为fulfilled，会触发第一个函数执行
- 当实例p的状态为rejected，则触发第二个函数执行

## 总结
上面这样构造promise实例，然后调用.then.then.then的编写代码方式，就是promise。

其基本模式是：
- 将异步过程转化成promise对象
- 对象有3种状态
- 通过.then注册状态的回调
- 已完成的状态能触发回调

采用这种方式来处理编程中的异步任务，就是在使用promise了。

所以promise就是一种异步编程模式。

# 有什么用
从JavaScript中的异步任务说起

典型的异步任务，是一个setTimeout调用

``` js
setTimeout(() => {
  // 爱干啥干啥
}, 1000)
```

通常用JS写异步任务的时候，会分成两个部分：主过程和后续过程，在主过程执行成功后，触发后续过程执行。比如，在实际编程中经常需要使用AJAX向服务器请求数据，成功获取到数据后，才开始处理数据。于是代码分成获取数据部分和处理数据部分，像下面这样：

``` js
getData((data) => {
  // 处理data
})
```

上面这两个处理异步任务的编程方式都是采用的回调函数的形式。

那么既然有回调函数这种方式，为什么还需要promise？

当然是因为回调函数这种方式不好了，否则谁吃饱了没事干非要整个promise出来！

也许有人说，觉得回调函数的方式没什么不好啊，我也不想否认，就像有人用习惯了windows操作系统，你说windows垃圾，改用Linux吧，balabala……其实用者开心，用得舒服就好啊。然而系统是自己用的，代码却是写给别人看的。

## 回调哪里不好了？
现在假设有多个异步任务，且任务间有依赖关系（一个任务需要拿到另一个任务成功后的结果才能开始执行）的时候，回调的方式写出来的代码就会像下面这样：

``` js
getData1(data1 => {
  getData2(data1, data2 => {
    getData3(data2, data3 => {
      getData4(data3, data4 => {
        getData5(data4, data5 => {
          // 终于取到data5了
        })
      })
    })
  })
})
```

这种代码被称为回调地狱或者回调金字塔

假设上面的任务，想要换一下执行顺序，代码修改起来，就比较麻烦了。如果内容复杂，阅读代码的时候跳来跳去，也让人头大。

如果用promise改写一下：

``` js
// 先把getData们都转成返回promise对象的函数

// 然后
getData1()
.then(getData2)
.then(getData3)
.then(getData4)
.then(getData5)
.then(data => {
  // 取到最终data了
})
```

这样的代码，是线性的，符合人的阅读习惯，代码表示的流程清晰，便于阅读

## 异步任务并行
有了多个异步任务后，下面假设想要多个异步任务并行执行，获取执行成功后，才处理结果。用回调方式来写，可采用下面的办法：

``` js
let tasks = [getData1, getData2, getData3, getData4, getData5]
let datas = []

tasks.forEach(task => {
  task(data => {
    datas.push(data)

    if (datas.length == tasks.length) {
      // datas里已经包含全部的数据了
    }
  })
})
```

上面结合数组，使用了forEach方法来为每个任务传入回调。如果改用promise来实现，代码会是这样：

``` js
// 先要把getData们转成promise对象

// 然后
Promise.all([
  getData1,
  getData2,
  getData3,
  getData4,
  getData5
]).then(datas => {
  // 已拿到全部的data，可以处理了
})
```

可以看到，下面的代码更清晰易读

# 如何使用
既然promise是一种更好的编程方式，那么现在就要好好了解下它的内容和各部分的作用了。其实这节重点是内容，怎么用还得靠看官自己去实践。不过，了解内容和作用是学会使用的前提和关键。

## 3种状态
首先，promise实例有三种状态：

- pending（待定）
- fulfilled（已执行）
- rejected（已拒绝）

fulfilled和rejected有可以说是已成功和已失败，这两种状态又归为已完成状态

## resolve和reject
调用resolve和reject能将分别将promise实例的状态变成fulfilled和rejected，只有状态变成已完成（即fulfilled和rejected之一），才能触发状态的回调

## Promise API
promise的内容分为构造函数、实例方法和静态方法

- 1个构造函数： new Promise
- 2个实例方法：.then 和 .catch
- 4个静态方法：Promise.all、Promise.race、Promise.resolve和Promise.reject

其中Promise.race不常用，本文忽略

下面逐个讲下他们的作用

1. new Promise能将一个异步过程转化成promise对象。先有了promise对象，然后才有promise编程方式。
2. .then用于为promise对象的状态注册回调函数。它会返回一个promise对象，所以可以进行链式调用，也就是.then后面可以继续.then。在注册的状态回调函数中，可以通过return语句改变.then返回的promise对象的状态，以及向后面.then注册的状态回调传递数据；也可以不使用return语句，那样默认就是将返回的promise对象resolve。
3. .catch用于注册rejected状态的回调函数，同时该回调也是程序出错的回调，即如果前面的程序运行过程中出错，也会进入执行该回调函数。同.then一样，也会返回新的promise对象。
4. 调用Promise.resolve会返回一个状态为fulfilled状态的promise对象，参数会作为数据传递给后面的状态回调函数
5. Promise.reject与Promise.resolve同理，区别在于返回的promise对象状态为rejected

# 有趣的习题
在网上看到的一个有意思的promise面试题

[实现红绿灯交替亮灯](https://www.cnblogs.com/dojo-lzz/p/5495671.html)

贴一下我的解答：

思路：先用promise控制三种灯的执行顺序，然后用递归实现循环亮灯

``` js
function red() {
  console.log('red');
}

function green() {
  console.log('green');
}

function yellow() {
  console.log('yellow');
}

let light = (fn, timer) => new Promise(resolve => {
  setTimeout(function() {
    fn()
    resolve()
  }, timer)
})

// times为交替次数
function start(times) {
  if (!times) {
    return
  }

  times--
  Promise.resolve()
    .then(() => light(red, 3000))
    .then(() => light(green, 1000))
    .then(() => light(yellow, 2000))
    .then(() => start(times))

}

start(3)
```
# 最后
本文转载自知乎 [https://zhuanlan.zhihu.com/p/26523836](https://zhuanlan.zhihu.com/p/26523836)，作者为 [苍微q](https://www.zhihu.com/people/owlikesj)

## 参考资料
- https://developers.google.com/web/fundamentals/getting-started/primers/promises#whats-all-the-fuss-about
- https://es6.ruanyifeng.com/#docs/promise
- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise