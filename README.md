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
