学习笔记

### 1. 收集CSS规则

​	1. 首先我们安装 css 的 node 包, 用来将我们得到的css文本处理成AST树的结构

​	`npm install css`

​	2. 接着在 htmlParser.js 的 `emit` 函数里的 `endTag` 逻辑拦截 style 标签 ，调用新增加的 `addCSSRules` 函数

	3. 在新增加的 `addCSSRules`之前，需要在全局添加一个用于保存收集到的 css 规则的 `rules` 的数组
 	4. 添加`addCSSRules` 如下

```js
// 用于保存收集到的css规则
let rules = []
const addCSSRules = (text) => {
    // 通过 css 模块解析，将 css 文本变成 AST 
    let ast = css.parse(text)
    console.log(JSON.stringify(ast, null, "           "))
    rules.push(...ast.stylesheet.rules)
}
```



### 2. CSS计算

在创建一个元素后，就立即计算CSS，在本节，我们在 `emit` 函数的 `startTag` 中调用 `computeCSS` 并传入`element` ，在 `computeCSS` 函数中将会对拿到的 css rules 对该 element 进行操作。





### 3. 获取父元素序列

1. 在 `computeCSS` 函数中，我们必须知道元素的所有父元素才能判断元素与规则是否匹配
2. 从上一步的 `stack` 中获取本元素所有的父元素
3. 因为我们首先获取的时 “当前元素”， 所以我们获得和计算父元素匹配的顺序时从内向外



### 4. 选择器与元素的匹配

1. 选择器与当前元素的排列是一致的——从当前元素开始向外排列，进行匹配
2. 复杂选择器拆成针对单个元素的选择器，用循环匹配父元素队列

```js
const match = (element, selector) => {

}

const computeCSS = (element) => {
    // console.log(rules)
    // console.log("compute CSS for ELement", element);
    // 1. 通过调用 slice 复制原数组
    // 2. 将父元素的序列进行一次 reverse， 因为标签匹配时从当前元素开始逐级往外匹配，所以我们需要一级一级的往该元素的父元素找
    let elements = stack.slice().reverse()

    if (!element.computedStyle) {
        element.computedStyle = {} // 保存由 css 设置的属性
    }

    for(let rule of rules) {
        // reverse 后与 elements 一致
        let selectorParts = rule.selectors[0].split(' ').reverse()

        if(!match(element, selectorParts[0])) {
            continue
        }

        let matched = false

        // j: 当前选择器的位置
        // i: 当前元素的位置
        let j = 1 
        for(let i = 0; i < element.length; i++) {
            if(match(elements[i], selectorParts[j])) {
                j++
            }
        }
        if (j >= selectorParts.length) {
            // 是一个匹配成功的选择器
            matched = true
        }

        if(matched) {
            // 匹配成功则将 rule 的 css 的属性应用到这个元素上
            console.log('element', element, 'matched rule', rule)
        }

    }

}
```



### 5. 计算选择器与元素匹配

```css
普通选择器
.a | #a | div 等

复合选择器
// 必须为 div， 必须有 class a ， 必须有 id a
div.a#a
```



1. 根据选择器的类型和元素属性，来计算是否与当前的元素匹配

```js
const match = (element, selector) => {
    // element.attributes 判断是否是文本节点
    if(!selector || !element.attributes) {
        return false
    }

    // 匹配三种简单选择器
    if (selector.charAt(0) === '#') {
        let attr = element.attributes.filter(attr => attr.name === 'id')[0]
        if (attr && attr.value === selector.replace('#', '')) {
            return true
        } 
    } else if (selector.charAt(0) === '.') {
        let attr = element.attributes.filter(attr => attr.name === 'class')[0]
        if(attr && attr.value === selector.replace('.', '')) {
            return true
        }
    } else {
        if (element.tagName === selector) {
            return true
        }
    }
    return false
}
```



###  6. 生成computed属性 

匹配成功，则应用选择器到元素上，形成 computedStyle

```js
        if(matched) {
            // 匹配成功则将 rule 的 css 的属性应用到这个元素上
            // console.log('element', element, 'matched rule', rule)
            /**
             * rule.declarations = 
             * [
             *  {
             *      parent: {.....},
             *      position: {...},
             *      property: 'width',
             *      type: 'declaration',
             *      value: '100px'
             *  },
             *  ...
             * ]
             * 
             */
            let computedStyle = element.computedStyle
            for(let declaration of rule.declarations) {
                if(!computedStyle[declaration.property]) {
                    computedStyle[declaration.property] = {}
                    computedStyle[declaration.property].value = declaration.value
                }
            }
            // 这里如何后面一个跟前面一个都是对应同一个元素，那么后面的直接覆盖前面的样式
            // 所以后续还需要对优先级做处理
            console.log(element.computedStyle)
        }
```



### 7. specificity 的计算逻辑

css 对选择器有一个 specification 的规定



specificity 是一个四元组

[  0,           0,           0,         0  ]

inline        id       class       tag



比如现在有这样一组选择器

div div #id

那么对应的 specificity 

[0, 1, 0, 2]



当然，这里没有将 !important 放到规则内



- CSS 规则根据 specificity 和后来优先规则覆盖
- specificity 是一个四元组，越左边权重越高
- 一个 CSS 规则的 specificity 根据包括的简单选择器相加而成



### 8. 根据浏览器属性进行排版

做排版的前期准备工作

```js
const getStyle = (element) => {
  if(!element.style) {
    element.style = {}
  }

  for(let prop in element.computedStyle) {
    let p = element.computedStyle.value
    element.style[prop] = element.computedStyle[prop].value

    if (element.style[prop].toString().match(/px$/)) {
      element.style[prop] = parseInt(element.style[prop])
    }

    if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
      element.style[prop] = parseInt(element.style[prop])
    }
  }
  return element.style
}


const layout = (element) => {
  if (!element.computedStyle) {
    return
  }
  
  let elemenStyle = getStyle(element)

  if (elemenStyle.display !== 'flex') {
    return
  }

  // 过滤掉文本节点
  let items = element.children.filter(e => e.type === 'element')

  items.sort((a, b) => {
    return (a.order || 0) - (b.order || 0)
  })

  let style = elemenStyle

  ['width', 'height'].forEach(seze => {
    if(style[size] == 'auto' || style[size] === '') {
      style[size] = null
    }
  })


  if(!style.flexDirection || style.flexDirection === 'auto') {
    style.flexDirection = 'row'
  }
  if(!style.alignItems || style.alignItems === 'auto') {
    style.alignItems = 'stretch'
  }
  if (!style.justifyContent || style.justifyContent === 'auto') {
    style.justifyContent = 'flex-start'
  }
  if (!style.flexWrap || style.flexWrap === 'auto') {
    style.flexWrap = 'nowrap'
  }
  if (!style.alignContent || style.alignContent == 'auto') {
    style.alignContent = 'stretch'
  }

  let mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase

  if (style.flexDirection == 'row') {
    mainSize = 'width'
    mainStart = 'left'
    mainEnd = 'right'
    mainSign = +1
    mainBase = 0

    crossSize = 'height'
    crossStart = 'top'
    crossEnd = 'bottom'
  }

  if (style.flexDirection === 'row-reverse') {
    mainSize = 'width'
    mainStart = 'right'
    mainEnd = 'left'
    mainSign = -1
    mainBase = style.width

    crossSize = 'height'
    crossStart = 'top'
    crossEnd = 'bottom'
  }

  if(style.flexDirection === 'column') {
    mainSize = 'height'
    mainStart = 'top'
    mainEnd = 'bottom'
    mainSign = +1
    mainBase = 0

    crossSize = 'width'
    crossStart = 'left'
    crossEnd = 'right'
  }

  if(style.flexDirection === 'column-reverse') {
    mainSize = 'height'
    mainStart = 'bottom'
    mainEnd = 'top'
    mainSign = -1
    mainBase = style.height

    crossSize = 'width'
    crossStart = 'left'
    crossEnd = 'right'
  }

  if(style.flexWrap === 'wrap-reverse') {
    [crossStart, crossEnd] = [crossEnd, crossStart]
    crossSign = -1
  } else {
    crossBase = 0
    crossSign = 1
  }
}

module.exports = layout
```



### 9. 收集元素进行

分行

- 根据主轴尺寸，把元素分进行
- 如果设置了no-wrap，则强行分配进第一行



### 10. 计算主轴



计算主轴方向

- 找出所有 Flex 元素
- 把主轴方向的剩余尺寸按比例分配给这些元素
- 若剩余空间为负数，所有 flex 元素为0， 等比压缩剩余元素



### 11. 计算交叉轴



计算交叉轴

- 根据每一行中最大元素尺寸计算行高
- 根据行高flex-align 和 item-align， 确定元素具体位置

