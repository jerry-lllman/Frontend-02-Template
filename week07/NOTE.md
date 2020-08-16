学习笔记



## 盒

| 源代码 |  语义   | 表现 |
| :----: | :-----: | :--: |
|  标签  |  元素   |  盒  |
|  Tag   | Element | Box  |

1. HTML代码中可以书写开始__标签__，结束__标签__ ，和自封闭__标签__ 。

2. 一对起止__标签__ ，表示一个__元素__ 。

3. DOM树中存储的是__元素__和其它类型的节点（Node）。

4. CSS选择器选中的是__元素__ 。

5. CSS选择器选中的__元素__ ，在排版时可能产生多个__盒__ 。

6. 排版和渲染的基本单位是__盒__ 。

   

#### 盒模型

盒由 `margin` + `border` + `padding` + `content` 组成，盒可以通过box-sizing属性设置为 `content-box` 和 `border-box`

- content-box: 设置的 `width` 属性只包含 `content` 的内容
- border-box: 设置的 `width` 属性包含 `content ` + `padding`  + `border` 



## 正常流

#### 正常流排版

- 收集盒进行
- 计算盒在行中的排布
- 计算行的排布





在正常流里面，两个盒之间的margin会产生重叠现象，称之为 Margin Collapse 。Margin Collapse 只会发生在BFC 里面，IFC、Flex、Grid 不会存在 Margin Collapse 现象



### Block-level Box

大多数 display 的值会存在 block level 及 inline level

| Block level    | Inline level          |
| -------------- | --------------------- |
| display: block | display: inline-block |
| display: flex  | display: inline-flex  |
| display: table | display: inline-table |
| display: grid  | display: inline-grid  |
| ......         | ......                |



### 设立 BFC

- 浮动
- 绝对定位元素
- block 容器（inline-block，table-cell，table-captions）不是block boxes
  - flex items
  - grid cell
  - ......

- block boxes 使用 overflow: visible





### Animation



- animation-name 时间曲线
- animation-duration 动画的时长；
- animation-timing-function 动画的时间曲线；
- animation-delay 动画开始前的延迟；
- animation-iteration-count 动画的播放次数；
- animation-direction 动画的方向。



###  Transition 

-  transition-property 要变换的属性；
- transition-duration 变换的时长；
- transition-timing-function 时间曲线；
- transition-delay 延迟。 



### HSL 与 HSV

HSL：

- Hue 				 色相
- Saturation	   纯度
- Lightness 	    亮度

HSV：

- Hue
- Saturation
- Value                明度

Value 在 0 时是黑色，在 100% 时颜色会变成纯色

Lightness 在 0  时是黑色，在100% 时是白色

w3c 用的是 HSL 



### 小技巧

平时可能做一些图标或是图形会用元素或是元素属性绘制出来，其实可以通过 data uri + svg 的方式绘制出来

```js
data:image/svg+xml,<svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg"><ellipse cx="300" cy="150" rx="200" ry="80" style="fill:rgb(200, 100, 50); stroke:rgb(0 , 0, 100); stroke-width:2"/></svg>
```

