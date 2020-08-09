学习笔记

### CSS 总体结构

- @charset
- @import
- rules
  - @media
  - @page
  - rule

### At-rules

- @charset ： https://www.w3.org/TR/css-syntax-3
- @import ：https://www.w3.org/TR/css-cascade-4
- **@media ：https://www.w3.org/TR/css3-conditional**
- @page ： https://www.w3.org/TR/css-page-3
- @counter-style ：https://www.w3.org/TR/css-counter-styles-
- **@keyframes ：https://www.w3.org/TR/css-animations-1**
- **@fontface ：https://www.w3.org/TR/css-fonts-3**
- @supports ：https://www.w3.org/TR/css3-conditional
- @namespace ：https://www.w3.org/TR/css-namespaces-3/

### CSS 规则

- Selector
  - https://www.w3.org/TR/selectors-3/
  - https://www.w3.org/TR/selectors-4/
- Key
  - Properties
  - Variables: https://www.w3.org/TR/css-variables/
- Value
  - https://www.w3.org/TR/css-values-4/



单独写一份脑图



爬虫部分



### 选择器语法

在介绍选择器之前，可以先看一份关于选择器优先级的描述，来自于 《CSS REFACTORING》 

《CSS REFACTORING》 中提到了算法的过程 。

A specificity is determined by plugging numbers into (A, B, C, D):

1. If the styles are applied via the style attribute, `A`=1; otherwise, `A`=0.
2. `B` is equal to the number of ID selectors present.
3. `C` is equal to the number of class selectors, attribute selectors, and pseudoclasses present.
4. `D` is equal to the number of type selectors and pseudoelements present.

翻译过来就是

优先级是由 `A` 、`B`、`C`、`D` 的值来决定的，其中它们的值计算规则如下：

1. 如果存在内联样式，那么 `A = 1`, 否则 `A = 0`;
2. `B` 的值等于 `ID选择器` 出现的次数;
3. `C` 的值等于 `类选择器` 和 `属性选择器` 和 `伪类` 出现的总次数;
4. `D` 的值等于 `标签选择器` 和 `伪元素` 出现的总次数 。

#### 简单选择器

- \*                                       通配符；优先级可以理解为 [0, 0, 0, 0]
- tag (div avg|a)                tag 选择器；[0, 0, 0, 1]
- .class                                class 选择器；[0, 0, 1, 0]
- #id                                    id 选择器；[0, 1, 0, 0]
- [attr=value]                     属性选择器；[0, 0, 1, 0]
- :hover                              伪类选择器；[0, 0, 1, 0]
- ::before                            伪元素选择器；[0, 0, 0, 1]



#### 选择器语法

**复合选择器**

- <简单选择器><简单选择器><简单选择器>
- \* 或者 div 必须写在最前面

 **复杂选择器**

-  <复合选择器>\<sp><复合选择器> 
-  <复合选择器>">"<复合选择器> 
-  <复合选择器>"~"<复合选择器> 
-  <复合选择器>"+"<复合选择器>
-  <复合选择器>"||"<复合选择器>



### 伪类

**链接/行为**

- :any-link
- :link :visited​
- :hover
- :active
- :focus
- :target

起初这些是作用于 a 标签上的，现在大部分能支持的基本都能支持，也了解到原来安全问题可以设计到这么深，即便是一个加载的时间都有可能会被其他利用

**树结构**

- :empty
- :nth-child()
- :nth-last-child()
- :first-child :last-child :only-child

**逻辑型**

- :not伪类
- :where :has



### 伪元素

- ::before
- ::after
- ::first-line
- ::first-letter

