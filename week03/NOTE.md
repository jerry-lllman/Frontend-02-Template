学习笔记

## **运算符和表达式**
###  Expressions （按照顺序排列优先级）

 运算符的优先级会影响语法树的构成
  在运算符中，优先级最高的是 Member 运算


#####   **Member**

  + a.b                           成员访问
  + a[b]                          区别在于支持运行时的字符串
  + foo\`string\`             会将string当作参数传入  ["string", raw: Array(1)]
  + super.b                   class 构造函数可用
  + super['b']              
  + new.target              
  + new Foo()               带括号的new与其他几个优先级相同

  

*对于 new.target 的记忆比较模糊，通过找文档发现在函数中调用new.target, 其中普通函数中，new.target 的值是undefined，这可以作用于检测一个函数是否作为构造函数通过 new 被调用的*

```javascript
function Foo() {
  if (!new.target) throw "Foo() must be called with new"
  ...
}
Foo()
```



```js
class A {
  constructor() {
    console.log(new.target.name);
  }
}

class B extends A { constructor() { super(); } }

var a = new A(); // "A"
var b = new B(); // "B"

class C { constructor() { console.log(new.target); } }
class D extends C { constructor() { super(); } }
 
var c = new C(); // class C{constructor(){console.log(new.target);}}
var d = new D(); // class D extends C{constructor(){super();}}
```



#####   **New**

+ new Foo



  *不带括号的 new 被单独设为一个优先级，称为 new Expressions，之所以将 New 单独拿出来是因为在 `new foo()()` 时，如果不单独列出来，无法得知此处需要 new 的是 foo函数的执行结果，还是先 new foo() 再执行*

*对于 new foo， 举例 `new new foo()`, 此处因为带括号的 new 的运算优先级更高，所以此处的括号会跟第二个 new 相结合，第一个 new 是 new 的 new foo()*



##### **Call**

- foo()
- super()
- foo().a
- foo()['b']
- foo()\`a\`

Call Expression 是一个统称，最为基础的 Call Expression 就是 foo()，前面说的 Member 表达式中，例如 a.b 的优先级是最高的，但在 foo().a 这种情况下，就会被降级，也就是说不同的表达式在不同的情况下有不同的优先级，它是由它前面的语法结构来决定自己的优先级，比如说 foo().a 比 a.b 的优先级要低两级（使用产生式来说明才是最严谨的方式）

`new a()['b']  //圆括号由new带来的（Member Expression），['b']被圆括号拉低了优先级（Call Expression），此处是 new a 对象，然后访问 b 属性`



##### **Left Handside & Right Handside**

左手和右手运算

我们可以使用 a.b = c，但是不能使用 a + b = c, 我理解的是在运算过程中，只有被赋值的一方才有资格成为 Left Handside（符合某种产生式），Right Handside 同理。

##### **Update**

- a++
- a--
- --a
- ++a

Update Expression 属于 Right Handside Expression，Left Handside Expression 几乎一定是 Right Handside Expression，例如：`a = b` ，其中 b 完全是符合 Left Handside Expression 的

##### **Unary**

- delete a.b								必须跟 reference 类型
- void foo()                                 defined
- typeof a
- \+ a                                             不会改变值，如果是字符串会发生类型转换
- \- a                                               
- ~ a                                              位运算，按位取反（+ 得- | - 得+），强制向上取整
- ! a
- await a                                       



##### **Exponental**

- **

JavaScript 唯一一个右结合的运算符——乘方，3 ** 2 * 3, 先算2的3次方，再算3的八次方。



##### **Mutiplicative**

- \*  /  %

##### **Additive**

- \+ \-

字符串和数字的加法存有区别

##### **Shift**

- <<  >>  >>>



##### **Relationship**

- < >    <=    >=  instanceof
- in

##### **Equality**

- ==
- ！=
- ===
- ！==



##### **Bitwise**

- &  ^  |



##### **Logical**

- &&
- ||

逻辑运算存在短路原则，如果 && 在前面部分是false，那么后面的部分不会被执行，相对应的，||如果前部分true，那么后面的部分就不会被执行

##### **Conditional**

- ?  :

同样存在短路原则



以上就是JavaScript中的表达式以及优先级的排序



### **Reference**

在 JavaScript 中 a.b 访问了一个属性，实际上 a.b 取出来的并不是属性的值，而是一个引用，引用类型并不是 JavaScript 中的7种基本类型之一，***引用类型是存在于运行时中的一个 JavaScript 的类型***，我们将其称为标准中的类型，而不是语言中的类型。

一个 reference 分为两个部分：

- Object
- Key

在做四则运算时，我们会将 Reference 进行解引用，将其作为普通变量般进行操作，如果我们要做 delete 或者是 assign 操作，那么我们就需要使用到引用的特性来得知我们需要进行操作的是哪个对象的哪个key，JavaScript 语言在运行时就是通过引用类型在运行时来处理删除或者是赋值这类的操作







## 表达式与类型转换

##### 类型转换

- a \+ b
- "false" == false
- a[o] = 1

1. a+b 是一定要作用于字符串或者是数字，如果不同属于同一类型，那么就会发生类型转换，如 "a" + 1  就会将数字的1转成字符串的1得到字符串的 "a1"，如果是Boolean就会根据对应的类型进行转换；
2.  "false" == false 的结果为 false，类型相同可以比较，类型不同则会全部转换为Number类型然后进行比较，所以这就解释了为什么 "false" == false 的结果为 false。不推荐使用，建议使用 ===；
3.  Member Expression 的 Object 的 key 也会发生类型转换，位运算会转换称Number类型，还会要转换成整数 。



|           | Number             | String                | Boolean  | Undefined | Null | Object | Symbol |
| --------- | ------------------ | --------------------- | -------- | --------- | ---- | ------ | ------ |
| Number    | -                  |                       | 0 false  | ×         | ×    | Boxing | ×      |
| String    |                    | -                     | "" false | ×         | ×    | Boxing | ×      |
| Boolean   | true1<br />false 0 | 'true'<br />'false'   | -        | ×         | ×    | Boxing | ×      |
| Undefined | NaN                | 'Undefined'           | false    | -         | ×    | ×      | ×      |
| Null      | 0                  | 'null'                | false    | ×         | -    | ×      | ×      |
| Object    | valueOf            | valueOf<br />toString | true     | ×         | ×    | -      | ×      |
| Symbol    | ×                  | ×                     | ×        | ×         | ×    | Boxing | -      |



##### Unboxing

- ToPremitive
- toString vs valueOf
- Symbol。同Promitive

拆箱转换是指将一个 Object 转换成一个基本类型，最主要的过程就是 ToPremitive,  在做Object参与运算时都会调用 ToPremitive 

例子：

```js
var o = {
    toString() { return "2" },
    valueOf(){ return 1 },
    [Symbol.toPrimitive]() { return 3 }
}
// 注释掉 Symbol.toPrimitive 后
// 优先调用 valueOf
"x" + o // x1

// 作为属性名优先调用 toString
var x = {}
x[0] = 1
x		// { 2: 1 }
```

如果我们定义了 Symbol.toPrimitive， 则会忽略 valueOf 和 toString，优先使用 Symbol.toPrimitive

总结下来就是转 Number 时会优先调用 valueOf，一定会用到字符串的场景就会调用 toString



##### Boxing

| 类型    | 对象                    | 值          |
| ------- | ----------------------- | ----------- |
| Number  | new Number(1)           | 1           |
| String  | new String("a")         | "a"         |
| Boolean | new Boolean(true)       | true        |
| Symbol  | new Object(Symbol("a")) | Symbol("a") |

因为Object可以有类的概念，所以对于每个基础类型 Object都提供了一个包装的类（undefined和null没有），通过 new调用的都会返回一个Object对象， Symbol 这个构造器是无法直接被 new 调用的，所以需要使用Object构造器来包装，可以直接通过调用 Symbol 来获得一个 Symbol 的值，可以通过 typeof 来区分是包装前的值还是包装后的对象



### 运行时的相关概念

##### Completion Record

JavaScript 语句的执行结果的记录， completion Record 的组成：

- [[type]] :   normal, break, continue, return, or throw
- [[value]] :  基本类型
- [[target]] : label  



### 简单语句和复合语句

##### 简单语句

- ExpressionStatement
- EmptyStatement
- DebuggerStatement
- ThrowStatement
- ContinueStatement
- BreakStatement
- ReturnStatement



##### 符合语句

- BlockStatement
- ifStatement
- SwitchStatement
- iterationStatement
- WithStatement
- LabelledStatement
- TryStatement                        try 中的花括号不是 BlockStatement 的



**block**

```js
[[type]]: normal
[[value]]:--
[[target]]: --

{
    
}
```

**Iteration**

```js
while ( expression ) statement
do statement while (expression)
for(...; expression; expression) statement
for(... in expression) statement
for(... in expression) statement
for await(of)
```

**try**

```js
try{
	statement
} catch() {
   statement 
} finally {
    statement
}
// return 在try里return 了也会继续执行 finally
```



### 声明

- FunctionDeclaration
- GeneratorDeclaration
- AsyncFunctionDeclaration
- AsyncGenerationDeclaration
- VariableStatement
- ClassDeclaration
- LexicalDeclaration                              const/let

前面五种可以在声明之前使用，而 class 和 const/let 在声明前使用则会报错



**预处理**

```js
var a = 2
void function () {
    a = 1; // 会被预处理找到下面声明的 a
    return;
    var a;
}();
console.log(a) // 2
```



```js
var a = 2;
void function () {
    a = 1; 
    {
        const a; // 说明仍会预处理
    }
}()
console.log(a)
// 以上代码放到浏览器中报错 Missing initializer in const declaration
// 这个报错与直接 const a 的报错一致
```

var 和 function 的作用域在函数体内，而 const 的作用域在它所在的 { } 内，同 let 一样在 for 时是整个for 中，并且不会产生新的





### 宏任务和微任务







### JS函数调用



**LexicalEnvironment**

以下这些都会存在 LexicalEnvironment 里面

- this
- new.target
- super
- 变量

**VariableEnvironment**

VariableEnvironment 是个历史遗留的包袱，仅用于处理 var 声明。



**Environment Record**



**Function-Closure**



// 这一部分理解更深入了，理解笔记还需要好好整理一下



**Realm**

函数表达式和对象直接量均会创建对象。

使用 . 做隐式转换也会创建对象。

```js
var x = {} // 创建了一个Object对象

var a = '1'
a.toString() // 装箱产生Number对象
```









