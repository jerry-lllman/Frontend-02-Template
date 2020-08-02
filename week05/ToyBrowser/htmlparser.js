const css = require('css')

const layout = require('./layout')

let currentToken = null
let currentAttribute = null

let stack = [{ type: "document", children: [] }]
let currentTextNode = null

// 用于保存收集到的css规则
let rules = []
const addCSSRules = (text) => {
    // 变成 ast
    let ast = css.parse(text)
    // console.log(JSON.stringify(ast, null, "           "))
    rules.push(...ast.stylesheet.rules)
}


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

// 计算优先
const specificity = (selector) => {
    let p = [0, 0, 0, 0]
    // 假设 selector 复合选择器 div .name #myId
    let selectorParts = selector.split(' ')
    for(let part of selectorParts) {
        if(part.charAt(0) === '#') {
            p[1] += 1
        } else if (part.charAt(0) === '.') {
            p[2] += 1
        } else {
            p[3] += 1
        }
    }
    return p
}

// 对比各级优先清况
const compare = (sp1, sp2) => {
    if (sp1[0] - sp2[0]) {
        return sp1[0] - sp2[0]
    }
    if (sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1]
    }
    if (sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2]
    }
    return sp1[3] - sp2[3]
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
        for(let i = 0; i < elements.length; i++) {
            if(match(elements[i], selectorParts[j])) {
                j++
            }
        }
        if (j >= selectorParts.length) {
            // 是一个匹配成功的选择器
            matched = true
        }

        if(matched) {
            // // 匹配成功则将 rule 的 css 的属性应用到这个元素上
            // // console.log('element', element, 'matched rule', rule)
            // /**
            //  * rule.declarations = 
            //  * [
            //  *  {
            //  *      parent: {.....},
            //  *      position: {...},
            //  *      property: 'width',
            //  *      type: 'declaration',
            //  *      value: '100px'
            //  *  },
            //  *  ...
            //  * ]
            //  * 
            //  */
            // let computedStyle = element.computedStyle
            // for(let declaration of rule.declarations) {
            //     if(!computedStyle[declaration.property]) {
            //         computedStyle[declaration.property] = {}
            //         computedStyle[declaration.property].value = declaration.value
            //     }
            // }
            // // 这里如何后面一个跟前面一个都是对应同一个元素，那么后面的直接覆盖前面的样式
            // // 所以后续还需要对优先级做处理
            // console.log(element.computedStyle)

            let sp = specificity(rule.selectors[0])
            let computedStyle = element.computedStyle
            for (let declaration of rule.declarations) {
                if(!computedStyle[declaration.property]) {
                    computedStyle[declaration.property] = {}
                }
                // 进行优先级的判断
                if(!computedStyle[declaration.property].specificity) {
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                }
            }
        }

    }

}

function emit(token) {
    let top = stack[stack.length - 1]

    if (token.type === "startTag") {
        let element = {
          type: "element",
          children: [],
          attributes: [],
        }
        element.tagName = token.tagName
        for (let p in token) {
            if (p != "type" && p != "tagName") {
                element.attributes.push({
                    name: p,
                    value: token[p],
                })
            }
        }

        // 在 startTag 入栈时就计算 css
        computeCSS(element)

        top.children.push(element)
        element.parent = top
        if (!token.isSelfClosing) {
            stack.push(element)
        }    
        currentTextNode = null 
    } else if ((token.type === "endTag")) {
        if ((top.tagName !== token.tagName)) {
            throw new Error("Tag start end dosen't match")
        } else {
            // 遇到 style 标签时， 执行添加 CSS 规则的操作
            if (top.tagName === 'style') {
                addCSSRules(top.children[0].content)
            }
            layout(top)
            stack.pop()
        }
        currentTextNode = null

    } else if (token.type === "text") {
        if (currentTextNode === null) {
            currentTextNode = {
                type: "text",
                content: "",
            }
            top.children.push(currentTextNode)
        }
        currentTextNode.content += token.content
    }
}

const EOF = Symbol("EOF")

function data(c) {
    if (c === "<") {
        return tagOpen
    } else if (c === EOF) {
        emit({type: "EOF",})
        return
    } else {
        emit({
        type: "text",
        content: c,
        })
        return data
    }
}

function tagOpen(c) {
    if (c === "/") {
        return endTagOpen
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
        type: "startTag",
        tagName: "",
        }
        return tagName(c)
    } else {
        return
    }
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
        type: "endTag",
        tagName: "",
        }
        return tagName(c)
    } else if (c === ">") {

    } else {

    }
}

function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    } else if (c === "/") {
        return selfClosingStartTag
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c
        return tagName
    } else if (c === ">") {
        emit(currentToken)
        return data
    } else {
        return tagName
    }
}

function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    } else if (c === "/" || c === ">" || c === EOF) {
        return afterAttributeName(c)
    } else if (c === "=") {

    } else {
        currentAttribute = {
            name: "",
            value: "",
        }
        return attributeName(c)
    }
}

function attributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || c === "/" || c === ">" || c === EOF) {
        return afterAttributeName(c)
    } else if (c === "=") {
        return beforeAttributeValue
    } else if (c === "\u0000") {

    } else if (c === '"' || c === "'" || c === "<") {

    } else {
        currentAttribute.name += c
        return attributeName
    }
}

function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/) || c === "/" || c === ">" || c === EOF) {
        return beforeAttributeValue
    } else if (c === "\"") {
        return doubleQuotedAttributeValue
    } else if (c === "\'") {
        return singleQuotedAttributeValue
    } else if (c === ">") {

    } else {
        return UnquotedAttributeValue(c)
    }
}

function doubleQuotedAttributeValue(c) {
    if (c === "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    } else if (c === "\u0000") {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c
        return doubleQuotedAttributeValue
    }
}

function singleQuotedAttributeValue(c) {
    if (c === "\'") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    } else if (c === "\u0000") {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c
        return singleQuotedAttributeValue
    }
}

function UnquotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value
        return beforeAttributeName
    } else if (c === "/") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return selfClosingStartTag
    } else if (c === ">") {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if (c === "\u0000") {

    } else if (c === '"' || c === "'" || c === "<" || c === "=" || c === "`") {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c
        return UnquotedAttributeValue
    }
}

function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName
    } else if (c === "/") {
        return selfClosingStartTag
    } else if (c === "=") {
        return beforeAttributeValue
    } else if (c === ">") {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if (c === EOF) {

    } else {
        currentToken[currentAttribute.name] = currentAttribute.value
        currentAttribute = {
            name: "",
            value: "",
        }
        return attributeName(c)
    }
}

function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c === "/") {
    return selfClosingStartTag
  } else if (c === ">") {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === EOF) {
  } else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
}

function selfClosingStartTag(c) {
    if (c === ">") {
        currentToken.isSelfClosing = true
        emit(currentToken)
        return data
    } else if (c === "EOF") {

    } else {

    }
}

module.exports.parseHTML = function(html) {
    let state = data
    for (let c of html) {
        state = state(c)
    }
    state = state(EOF)
    return stack[0]
}