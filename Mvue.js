/* 
    创建方式
    new Mvue({data:{}})
*/

class Mvue {
    constructor(options) {
        this._options = options
        this.$data = options.data
        this.observer(this.$data)      //调用观察者方法

        // new Watcher()
        // 编译模板
        new Compile(options.el,this)
    }
    observer(value) {
        // 判断数据是否存在且正确
        if(!value || typeof value !== 'object') {
            return
        }
        // 数据正确则开始劫持数据
        Object.keys(value).forEach(key => {
            this.defineReactive(value,key,value[key])
        })
    }
    defineReactive(obj,key,val) {

        const dep = new Dep()

        this.observer(val)      //递归处理嵌套数据
        Object.defineProperty(obj,key,{
            get() {
                Dep.target && dep.addDep(Dep.target)
                return val
            },
            set(newVal) {
                if(newVal === val) {
                    return
                }
                val = newVal
                // 更新数据，
                dep.notify()
            }
        })
    }
}

// 依赖收集器，一个data属性对应一个依赖收集器
class Dep {
    constructor() {
        // 存储所有依赖
        this.deps = []
    }
    // 在deps中添加一个监听器对象
    addDep(dep) {
        this.deps.push(dep)
    }
    // 通知所有监听器去更新视图
    notify() {
        this.deps.forEach( dep => {
            dep.update()
        })
    }
}

// 依赖，data的属性出现多少次，就会创建多少个依赖，比如name使用了2次，那么那么对应的dep中会有两个watcher
class Watcher {
    constructor() {
        // 在new一个监听器对象时，将该对象赋值给Dep.target，在get中会用到
        Dep.target = this
    }

    // 视图更新
    update() {
        console.log('视图更新了~~~~');
    }
}

