# vue-detail
Implementation of vue

### Observer 功能

1. 监听 data 数据
   observer对象的一个属性是  会 new Dep() 用闭包  绑定一个dep对象
   后续get这个属性时，如果Dep.target存在 就把这个Dep.target(Watcher) 推到绑定的dep对象的subs数组里面
   后续set这个属性时，会触发这个dep.notify()  会通知subs数组里面的watchers

分工： observer负责监听属性的变换，它需要一个管理工具dep, dep负责收集watchers和通知watchers，通知到后会发生什么逻辑行为属于watchers的内容。 形象点来说，observer观察的对象属性可以看似一个博主，watchers可以看似网民，网民订阅这个博主，当博主更新时，会通知给各个网民，网民得到通知后会有不同的行为反应。

2. initWatcher
   前面已经初始化了数据监听的功能了，后续根据options.watch属性 new Watcher
   new Watcher的流程 会把new出来的实例watcher对象赋值给Dep.target, 然后读取watch的属性(此属性已被监听)，进而这个watcher对象会被推到这个监听属性对应的闭包对象dep的subs数组里面。

3. 添加schaduler功能
  将watcher的update逻辑推入到一个任务队列里面，该任务队列会在微任务里面执行
  即宏任务执行完之后才会执行watcher的逻辑  在执行任务队列之前  还可以对watcher任务进行一些二次处理 比如排序之类的。

4. vnode功能
   render函数生成 vnode对象 vnode树例子: { tag: 'div', {}, [{tag: 'span', {}, 'this is span'}] }
   vnode生成dom之后 每个vnode节点对象都有一个elm属性，elm指向真实的dom节点，diff对比发生在vnode，之后需要
   根据这个elm对dom进行修改, 有elm的vnode树例子: { tag: 'div', elm: "divDOM"， {}, [{tag: 'span', elm: "spanDOM", {}, 'this is span'}] }

   vnode patch大致逻辑： 对比newVnode和oldVnode是否时相同节点，根据tag,key等信息判断是否isSameVnode,
   如果是相同的节点 进入patchVnode(old, new) 逻辑， 如果不是相同节点则移除或者新增内容

   patchVnode(old, new)中核心逻辑则是 oldChildren和newChildren 新旧节点的子节点对比：
   
   头头对比  尾尾对比  头尾对比  尾头对比  key对比  

   按以上顺序进行对比  例子 头头对比： isSameVnode(oldChildren[0], newChildren[0]) 则进行进一步patchVnode(oldChildren[0], newChildren[0])

5. renderWatcher功能
   关于renderWatcher，new Watcher时 推入一个updateComponent执行  这个updateComponent会
   作为这个renderWatcher的update逻辑，即触发这个renderWatcher等同于触发updateComponent
   还有在new Watcher期间会执行 render()函数  render函数里面会读取被监听的属性，所以这些属性的dep.subs都会推入这个renderWatcher。当这些属性改变时都会触发renderWatchers。
   但是在scheduler里面有一个拦截已存在watcher的逻辑，所以当多个属性发生改变时，指挥触发一次renderWatcher