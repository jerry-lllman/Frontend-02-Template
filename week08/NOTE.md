学习笔记



#### **实体定义**

*实体定义就是以 `&` 开头 `;`  结尾的词*

- nbsp: no-break space, 使用 nbsp 连接的两个词会被当成一个词来看待，所以不建议使用 nbsp 来做多个空格的效果，可以使用 CSS 的 white-space 属性控制·

- quot：`"` 双引号

- amp：`&` 符

- lt：`<` 号

- gt：`>` 号



#### HTML 语义

这块之前看过重学前端专栏，然后又看一遍视频，所以理解上加深了



#### HTML 语法

**合法元素**

- Element：\<tag>...\<tag>; 以标签包裹起来
- Text: text, 文本
- Comment:  \<!-- comment -->，注释
- DocumentType: <!Doctype html> 
- ProcessingInstruction: \<?a 1?>, 不理解也不用理解 =。=
- CDATA:  \<![CDATA[]]>, 特殊语法，产生文本节点，所产生的文本不需考虑转义

**字符引用**

- \&#161;
- **\&amp;**
- **\&lt;**
- **\&quot;**





#### DOM API

所有 DOM 树上能挂载的东西都是继承自 Node 的类，Node 是所有这类节点的基类，挂在在DOM 树上的一定是 Node，但不一定是 Element，如下：

- Node
  - Element：元素节点
    - HTMLElement
    - SVGElement
  - Document：文档根节点
  - CharacterData：字符数据
    - Text：文本节点 —— CDATASection：CDATA　节点
    - Comment：注释
  - DocumentFragment：文档片段
  - DocumentType：文档类型

**导航类操作**

上文说过 Node 并不等同于 Element, 所以在导航类操作中做了区分, 比如在 Node 中 操作 nextSibling , 得到的可能是个文本节点,很显然,我们在需要得到一个元素时并不希望得到这样的节点,所以就有了专门针对 Element 类的操作

|      Node       |        Element         |
| :-------------: | :--------------------: |
|   parentNode    |     parentElement      |
|   childNodes    |        children        |
|   firstChild    |   firstElementChild    |
|    lastChild    |    lastElementChild    |
|   nextSibling   |   nextElementSibling   |
| previousSibling | previousElementSibling |

**修改操作**

- appendChild
- insertBefore
- removeChild
- replaceChild



**高级操作**

- compareDocumentPosition 是一个用于比较两个节点中关系的函数
- contains 检查一个节点是否包含另一个节点的函数
- isEqualNode 检查两个节点是否完全相同
- isSameNode 检查两个节点是否是同一个节点,实际上在 JavaScript 中可以用 "==="
- cloneNode 复制一个节点,如果传入参数 true,则会连同子元素做深拷贝



#### 事件 API



```js
target.addEventListener(type, listener [, options])

options:

	capture: Boolean 决定是捕获模式还是冒泡模式
	
	once: Boolean 是否仅响应一次
    
    passive: Boolean 是否为一个不会产生副作用的事件

```

**冒泡与捕获**

冒泡和捕获跟监听没有关系, 在任何事件触发的过程中两个过程都会发生,无论是否监听该事件. 该事件都会发生

任何事件都是先捕获后冒泡 



#### Range API

DOM 的 collection 是一个 living collection, 在操作取出来的 childNodes, 取出来的这个集合会跟着变化

元素的子元素在 insert 时是不需要从原节点上做移除操作, 在做 insert 操作时, 如果该元素已在 DOM 树 ( 随意哪棵 DOM 树 ) 上时, 一定会把这个元素先 remove 掉,然后再 append 到新的 DOM 树上.

```javascript
// 将一个列表内的子元素进行 reverse 操作
let element = document.getElementById('container')
const reverseChildren = (element) => {
    let l = element.childNodes.length
    while (l-- > 0) {
        element.appendChild(element.childNodes[l])
    }
}
reverseChildren(element)
```

**Range**

```javascript
// 1
const range = new Range()
range.setStart(element, 9)
range.setEnd(element, 4)

// 2
const range = document.getSelection().getRangeAt(0)

```

- range.setStartBefore
- range.setEndBefore
- range.setStartAfter
- range.setEndAfter
- range.selectNode
- range.selectNodeContents

```javascript
// 将 range 里的内容取出来, 从选取的 DOM 树上摘出来
const fragment = range.extractContents()

// 在range 的位置插入一个新的节点
range.insertNode(document.createTextNode('container'))
```



```javascript
  // 使用 Range 的方式将一个列表内的子元素进行 reverse 操作
  let element = document.getElementById('container')
  const reverseChildren = (element) => {
    let range = new Range()
    // 选取
    range.selectNodeContents(element)
    // 摘取
    let fragment = range.extractContents()
    let l = fragment.childNodes.length
    while(l-- > 0) {
      // fragment 已经离开了 DOM 树，所以不会引起重排
      fragment.appendChild(fragment.childNodes[l])
    }
    element.appendChild(fragment)
  }
  // 整个过程只有两次重排
  reverseChildren(element)
```



#### CSSOM

CSSOM 对应的基本就是 CSS 语法

**Rule**

- CSSStyleRule
  - selectorText String
  - style K-V结构

CSSOM 可以进行一些 DOM API 操作不到的 CSS 操作

- 操作伪元素

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <style>
      a::before {
        color: red;
        content: 'Hello';
      }
    </style>
    <link rel="stylesheet" href="data:text/css,p%7Bcolor:blue%7D">
  </head>
  <body>
    <a>World</a>
  </body>
  <script>
     // 对于 DOM 操作不到的 伪元素
    document.styleSheets[0].cssRules[0].style.color = 'lightgreen'
      
    // getComputedStyle
    let element = document.querySelector('a')
    let styleA = getComputedStyle(element)
    console.log(styleA, 'a')
    let pseudoA = getComputedStyle(element, '::before')
    console.log(pseudoA, 'a.before')
  </script>
</html>
```

- getComputedStyle

computedStyle 通过 DOM 是无法获取到的

```javascript
window.getComputedStyle(elt, pseudoElt)
// elt 想要获取的元素
// pseudoElt 可选,伪元素
```



#### CSSOM View

**window**

- window.innerHeight, window.innerWidth     // html窗口大小
- window.outerWidth, window,outerHeight    // 包含了浏览器工具栏大小
- window.devicePixelRatio                                  // DPR
- window.screen
  - window.screen.width
  - window.screen.height
  - window.screen.availWidth      // 代表可以使用的宽和高  (安卓机的物理虚拟菜单按钮)
  - widnow.screen.availHeight    // 取出来的不一定准=>. <=

**Window API**

- window.open("about:blank", "blank", "width=100, height=100, left =100,right=100")
- moveTo(x, y)
- moveBy(x, y)
- resizeTo(x, y)
- resizeBy(x, y)



**scroll API**

- scrollTop
- scrollLeft
- scrollWidth
- scrollHeight
- scroll(x, y)
- scrollBy(x, y)
- scrollIntoView()

- window
  - scrollX
  - scrollY
  - scroll(x, y)
  - scrollBy(x, y)

在有滚动条的情况下才会生效



**layout**

- getClientRects()                        获取到元素生成的所有的盒
- getBoundingClientRect()        只获取元素包含的区域的盒





