---
title: Vue的响应式原理
categories: Vue
tags:
  - 源码
abbrlink: 342a
date: 2022-10-23 16:01:21
---

# 前言
所谓响应式也就是通过数据的变更就能够更新相应的视图，极大的将我们从繁琐的DOM操作中解放出来。

所以掌握它们的响应式原理，对掌握前端框架的精髓就很重要了。

# 响应式原理
**什么是响应式原理？**

意思就是在改变数据的时候，视图会跟着更新。这意味着你只需要进行数据的管理，给我们搬砖提供了很大的便利。 React 也有这种特性，但是 React 的响应式方式跟 VUE 完全不同。

React 是通过 `this.setState` 去改变数据，然后根据新的数据重新渲染出虚拟 DOM，最后通过对比虚拟 DOM 找到需要更新的节点进行更新。

也就是说 React 是依靠着虚拟 DOM 以及 DOM 的 diff 算法做到这一点的。

而 VUE 则是利用了 `Object.defineProperty` 的方法里面的 setter 与 getter 方法的观察者模式来实现。

所以在学习VUE的响应式原理之前，先学习两个预备知识：`Object.defineProperty` 与 观察者模式。

## Object.defineProperty

这个方法就是在一个对象上定义一个新的属性，或者改变一个对象现有的属性，并且返回这个对象。里面有两个字段 set,get。顾名思义，set 都是取设置属性的值，而 get 就是获取属性的值，举个例子：

``` js
// 在对象中添加一个属性与存取描述符的示例
var bValue;
var o = {};
Object.defineProperty(o, "b", {
  get : function(){
    console.log('监听正在获取b')
    return bValue;
  },
  set : function(newValue){
    console.log('监听正在设置b')
    bValue = newValue;
  },
  enumerable : true,
  configurable : true
});

o.b = 38;
console.log(o.b)
// 打印结果
// 监听正在设置b
// 监听正在获取b
// 38
```

从在上述例子中，可以看到当我们对 o.b 赋值38的时候，就会调用 set 函数，这时候给 bValue 赋值，之后我们就可以通过 o.b 来获取这个值，这时候，get 函数被调用。

掌握到这一步，我们已经可以实现一个极简的VUE双向绑定了。

``` html
<input type="text" id="txt" />
<span id="sp"></span>

<script>
var txt = document.getElementById('txt'),
    sp = document.getElementById('sp'),
    obj = {}

// 给对象obj添加msg属性，并设置setter访问器
Object.defineProperty(obj, 'msg', {
  // 设置 obj.msg  当obj.msg反生改变时set方法将会被调用  
  set: function (newVal) {
    // 当obj.msg被赋值时 同时设置给 input/span
    txt.value = newVal
    sp.innerText = newVal
  }
})

// 监听文本框的改变 当文本框输入内容时 改变obj.msg
txt.addEventListener('keyup', function (event) {
  obj.msg = event.target.value
})
</script>
```

VUE 给 data 里所有的属性加上 set,get 这个过程就叫做 Reactive 化。

# 观察者模式
什么是观察者模式？它分为**注册环节跟发布环节**。

比如我去买芝士蛋糕，但是店家还没有做出来。这时候我又不想在店外面傻傻等，我就需要隔一段时间来回来问问蛋糕做好没，对于我来说是很麻烦的事情，说不定我就懒得买了。

店家肯定想要做生意，不想流失我这个吃货客户。于是，在蛋糕没有做好的这段时间，有客户来，他们就让客户把自己的电话留下，这就是观察者模式中的**注册环节**。然后蛋糕做好之后，一次性通知所有记录了的客户，这就是观察者的**发布环节**。

这里来简单实现一个观察者模式的类

``` js
function Observer() {
  this.dep = [];
  
  register(fn) {
    this.dep.push(fn)
  }
  
  notify() {
    this.dep.forEach(item => item())
  }
}

const wantCake = new Oberver();
// 每来一个顾客就注册一个想执行的函数
wantCake.register(() => {'console.log("call daisy")'})
wantCake.register(() => {'console.log("call anny")'})
wantCake.register(() => {'console.log("call sunny")'})

// 最后蛋糕做好之后，通知所有的客户
wantCake.notify()
```

# 原理解析
在学完了前面的铺垫之后，我们终于可以开始讲解 VUE 的响应式原理了。

官网用了一张图来表示这个过程，但是刚开始看可能看不懂，等到文章的最后，我们再来看，应该就能看懂了。

![](https://lvboda.cn/uploader/static/d40dfd26de1e241d1c20f195e0b4df48.png)

## init 阶段
VUE 的 data 的属性都会被 Reactive 化，也就是加上 setter/getter 函数。

``` js
function defineReactive(obj: Object, key: string, ...) {
    const dep = new Dep()

    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter () {
        ....
        dep.depend()
        return value
        ....
      },
      set: function reactiveSetter (newVal) {
        ...
        val = newVal
        dep.notify()
        ...
      }
    })
  }
  
  class Dep {
      static target: ?Watcher;
      subs: Array<Watcher>;

      depend () {
        if (Dep.target) {
          Dep.target.addDep(this)
        }
      }

      notify () {
        const subs = this.subs.slice()
        for (let i = 0, l = subs.length; i < l; i++) {
          subs[i].update()
        }
      }
```

其中这里的Dep就是一个观察者类，每一个data的属性都会有一个dep对象。当getter调用的时候，去dep里注册函数，至于注册了什么函数，我们等会再说。

setter的时候，就是去通知执行刚刚注册的函数。

## mount 阶段
``` js
mountComponent(vm: Component, el: ?Element, ...) {
    vm.$el = el

    ...

    updateComponent = () => {
      vm._update(vm._render(), ...)
    }

    new Watcher(vm, updateComponent, ...)
    ...
}

class Watcher {
  getter: Function;

  // 代码经过简化
  constructor(vm: Component, expOrFn: string | Function, ...) {
    ...
    this.getter = expOrFn
    Dep.target = this                      // 注意这里将当前的Watcher赋值给了Dep.target
    this.value = this.getter.call(vm, vm)  // 调用组件的更新函数
    ...
  }
}
```

mount 阶段的时候，会创建一个 Watcher 类的对象。这个 Watcher 实际上是连接 Vue 组件与 Dep 的桥梁。
每一个 Watcher 对应一个 vue component。

这里可以看出 `new Watcher` 的时候，constructor 里的 `this.getter.call(vm, vm)` 函数会被执行。getter 就是 updateComponent。这个函数会调用组件的 render 函数来更新重新渲染。

而 render 函数里，会访问 data 的属性，比如：

``` js
render: function (createElement) {
  return createElement('h1', this.blogTitle)
}
```

此时会去调用这个属性 blogTitle 的 getter 函数，即：

``` js
// getter函数
get: function reactiveGetter () {
    ....
    dep.depend()
    return value
    ....
 },

// dep的depend函数
depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
}
```

在 depend 的函数里，`Dep.target` 就是 watcher 本身，这里做的事情就是给 blogTitle 注册了Watcher 这个对象。这样每次 render 一个 vue 组件的时候，如果这个组件用到了 blogTitle，那么这个组件相对应的 Watcher 对象都会被注册到 blogTitle 的 Dep 中。

这个过程就叫做**依赖收集**。

收集完所有依赖 blogTitle 属性的组件所对应的 Watcher 之后，当它发生改变的时候，就会去通知 Watcher 更新关联的组件。

## 更新阶段
当 blogTitle 发生改变的时候，就去调用 Dep 的 notify 函数,然后通知所有的 Watcher 调用 update 函数更新。

``` js
notify () {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
}
```
可以用一张图来表示：

![](https://lvboda.cn/uploader/static/7bbf811d13755ce9d3e1a72aecaf45f7.png)

由此图我们可以看出 Watcher 是连接 VUE component 跟 data 属性的桥梁。

## 总结
1、第一步：组件初始化的时候，先给每一个 Data 属性都注册 getter，setter 也就是 reactive 化。然后再 new 一个自己的 Watcher 对象，此时 Watcher 会立即调用组件的 render 函数去生成虚拟DOM。在调用render 的时候，就会需要用到 data 的属性值，此时会触发 getter 函数，将当前的 Watcher 函数注册进 sub 里。

2、第二步：当data属性发生改变之后，就会遍历sub里所有的watcher对象，通知它们去重新渲染组件。

# 最后
本文转载自知乎 [https://zhuanlan.zhihu.com/p/88648401](https://zhuanlan.zhihu.com/p/88648401)，作者为 [daisy](https://www.zhihu.com/people/huang-qiong-50-1)