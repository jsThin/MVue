/* 
    compile编译器
    实现原理：
    接受参数，需要编译的节点根元素，mvue实例
    compile(el,vm)
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
                // 查找v-,@属性
                const nodeAttrs = node.attributes
                Array.from(nodeAttrs).forEach(attr => {
                    const attrName = attr.name
                    const exp = attr.value
                    if(this.isDirective(attrName)) {
                        // v-text
                        const dir = attrName.substring(2) //dir='text'
                        // 执行指令
                        this[dir] && this[dir](node,this.$vm,exp)
                    }
                    if(this.isEvent(attrName)) {
                        // @事件处理
                        const dir = attrName.substring(1)
                        this.eventHandler(node,this.$vm,exp,dir)  //exp--事件回调函数，dir--事件类型
                    }
                })
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

    // 更新函数
    update(node,vm,exp,dir) {
        const updateFun = this[dir+'Updater']
        // 初始化
        updateFun && updateFun(node,vm[exp])
        // 依赖手机
        new Watcher(vm,exp,function(value) {
            updateFun && updateFun(node,value)
        })
    }

    // 事件处理器
    eventHandler(node,vm,exp,dir) {
        const callback = vm.$options.methods && vm.$options.methods[exp]
        if(dir && callback) {
            node.addEventListener(dir,callback.bind(vm))
        }
    }

    // 插值表达式编译
    compileText(node) {
        this.update(node,this.$vm,RegExp.$1,'text')
    }
    // 差值表达式更新方法 
    textUpdater(node,value) {
        node.textContent = value
    }

    // v-text指令
    text(node,vm,exp) {
        this.update(node,vm,exp,'text')
    }

    // 双绑v-model
    model(node,vm,exp){
        //指定input的value值
        this.update(node,vm,exp,'model')  
        // 视图对数据的相应
        node.addEventListener('input',(e) => {
            vm[exp] = e.target.value
        })
    }

    // v-html指定
    html(node,vm,exp) {
        this.update(node,vm,exp,'html')
    }

    // 双绑v-model 更新方法
    modelUpdater(node,value) {
        node.value = value
    }
    // v-html更新方法
    htmlUpdater(node,value) {
        node.innerHTML = value
    }

    // 判读是否为标签节点
    isElement(node) {
        return node.nodeType === 1 
    }
    // 判断是否为插值文本节点
    isInpolation(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
    //判断是否v-开头
    isDirective(attr) {
        return attr.indexOf('v-') == 0
    }
    // 判断是否@开头
    isEvent(attr) {
        return attr.indexOf('@') == 0
    }
}