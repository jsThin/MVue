/* 
    compile编译器
    实现原理：
    接受参数，需要编译的节点根元素，mvue实例
    compile(el,vm
        )
*/
class Compile {
    constructor(el,vm) {
        // 获取要遍历的节点 
        this.$el = document.querySelector(el)
        this.$vm = vm

        // 编译
        if(this.$el) {
            // 获取代码片段
            this.$flagment = this.node2Flagment(this.$el)
            // 开始编译
            this.compile(this.$flagment)
            // 将编译完的html代码添加到$el
            this.$el.appendChild(this.$flagment)
        }
    }
    node2Flagment(el) {
        // 新建文档碎片 dom接口
        let flagment = document.createDocumentFragment()
        let child
        // 将el中的所有子元素，搬家到flagment里面
        while (child = el.firstChild) {
            flagment.appendChild(child)
        }
        return flagment
    }
    compile(el) {
        //获取子节点
        let childNodes = el.childNodes
        Array.from(childNodes).forEach(node => {
            // 判断是编译节点还是文本节点
            if(this.isElement(node)) {
                console.log('编译节点'+ node.nodeName);
            }else if(this.isInpolation(node)) {
                // 编译插值表达式
                this.compileText(node)
            }

            // 递归处理
            if(node.childNodes && node.childNodes.length) {
                this.compile(node)
            }
        })
    }

    // 插值表达式编译
    compileText(node) {
        node.textContent = this.$vm.$data[RegExp.$1]
    }

    // 判读是否为标签节点
    isElement(node) {
        return node.nodeType === 1 
    }
    // 判断是否为插值文本节点
    isInpolation(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
}