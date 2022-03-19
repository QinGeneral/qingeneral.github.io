# Android 内存泄漏场景及其解决方法

![](http://upload-images.jianshu.io/upload_images/1214187-4d0a72ea0f8e0c03.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

本文包括以下内容：

1. 内存泄漏原理
2. Android内存泄漏发生的情况
3. 检测内存泄漏的工具、方法
4. 如何避免内存泄漏

## 1. 内存泄漏原理

简单来说，Java的内存泄漏就是对象不再使用的时候，无法被JVM回收。内存泄漏最终会引发Out Of Memory。

在Java中，判断对象是否仍在使用的方法是：引用计数法，可达性分析。  

引用计数法就是对每个对象所持有的引用进行计数，计数为0，则没有引用，判断为可回收状态。但是此方法存在的问题是循环引用，即A持有B的引用，B持有A的引用，同时AB不再使用时，无法回收AB，发生内存泄漏。  

可达性分析就是从一些GC Root 对象出发，去遍历所含有对象的引用，以此递归。像树一样，从根向树枝查找可达的对象。最后没有标记到的对象即为可回收对象，解决了循环引用的问题。  

但是即使采用可达性分析的方法，还是可能由于程序编写的问题引发内存泄漏。总结来说就是长周期的对象持有了短周期对象的引用，导致短周期对象无法回收，引起内存泄漏。

## 2. Android内存泄漏发生的情况

内存泄漏是否发生的关键在于对象之间生命周期的长短。下面是可能发生内存泄漏的情况：

比较典型的是Activity的Context，包含大量的引用，比如View Hierarchies和其他资源。一旦无法释放Context，也意味着无法释放它指向的所有对象。

- 静态变量：静态变量的生命周期和应用的生命周期一样长。如果静态变量持有某个Activity的context，则会引发对应Activity无法释放，导致内存泄漏。如果持有application的context，就没有问题（以下例子是指Activity销毁时没有释放的情况）
  - 单例模式：内部实现是静态变量和方法
  - 静态的View：view默认持有Activity的context
  - 静态Activity

- 监听器：当使用Activity的context注册监听，不再需要监听时没有取消注册。比如传感器的监听等
- 内部类
  - 匿名内部类：持有外部类引用。匿名内部类和异步任务一起出现时，可能发生内存泄漏。Activity回收时，异步任务没有执行完毕会导致内存泄漏的发生。因为匿名任务类持有Activity引用，当匿名任务类的引用被另一线程持有，导致生命周期不一致的问题，进而导致内存泄漏
    - 匿名的AsyncTask

        ```Java
        new AsyncTask<String, String, String>() {
                    @Override
                    protected String doInBackground(String... params) {
                        // doSomething
                        return null;
                    }
                };
         ```

    - 匿名的TimerTask

        ```Java
        new Timer().schedule(new TimerTask() {
                    @Override
                    public void run() {
                         // doSomething
                    }
                }, 1000);
        ```

    - 匿名的Thread或Runnable

        ```Java
        new Thread() {
             @Override public void run() {
                 while(true);
                 }
         }.start();
        ```

    - 非静态内部类：持有外部类引用
      - Handler：我们知道Handler处理消息是串行的，所以当Activity已经需要回收，但Looper仍有消息未处理完毕时会发生内存泄漏。因为Looper使用ThreadLocal保存，ThreadLocal是静态的，生命周期与当前应用一致。同时Looper持有MessageQueue的引用，MessageQueue持有Handler引用（msg.target），Handler持有外部Activity引用，导致Activity无法回收 
      - 非静态内部类有一个静态的实例：非静态内部类持有外部类引用，如果在某个地方有个非静态内部类的静态实例的话，同样会引起内存泄漏

- 资源对象未关闭：BraodcastReceiver，ContentObserver，File，Cursor，Stream，Bitmap等资源，使用后未关闭会导致内存泄漏。因为资源性对象往往都用了一些缓冲，缓冲不仅存在于 java虚拟机内，还存在于java虚拟机外。如果仅仅是把它的引用置null，而不关闭它们，也会造成内存泄漏
- 容器中的对象没有清理：集合一般占用内存较大，不及时关闭会导致内存紧张（不会导致内存泄漏，而会导致可用内存大大减少）
- webview

## 3. 检测、分析内存泄漏的工具

- MemoryMonitor：随时间变化，内存占用的变化情况
- MAT：输入HRPOF文件，输出分析结果
  - Histogram：查看不同类型对象及其大小
  - DominateTree：对象占用内存及其引用关系
  - [MAT使用教程](http://www.cnblogs.com/larack/p/6071209.html)
- LeakCanary：实时监测内存泄漏的库[（LeakCanary原理）](http://www.jianshu.com/p/87f2ba180066)

## 4. 如何避免内存泄漏

长周期的对象持有了短周期对象的引用，导致短周期对象无法回收，引起内存泄漏。所以在使用某个对象时，我们需要仔细研究对象的生命周期，当处理一些占用内存较大并且生命周期较长的对象时，可以使用软引用。对于一些资源操作对象，及时关闭。

- 不要在匿名内部类中进行异步操作
- 将非静态内部类转为静态内部类 + WeakReference（弱引用）的方式
- 在 Activity 回调 onDestroy 时或者 onStop 时
  - 移除消息队列 MessageQueue 中的消息
  - 静态变量置null
  - 停止异步任务
  - 取消注册
- 使用Context时，尽量使用Application 的 Context
- 尽量避免使用static 成员变量。另外可以考虑lazy初始化
- 为webView开启另外一个进程，通过AIDL与主线程进行通信，WebView所在的进程可以根据业务的需要选择合适的时机进行销毁，从而达到内存的完整释放
- 及时关闭资源。Bitmap 使用后调用recycle()方法

防止内存溢出的方法

- 及时清理容器，将集合里的东西clear，然后置为null
- 使用adapter时，使用ViewHolder来复用convertView
- 优化数据结构
  - 比如HashMap和ArrayMap，优先使用ArrayMap；优先使用基本类型，而非包装类
  - 减少占内存较大的枚举的使用
  - 采用三级缓存机制：LRUCache
  - 图片压缩：inSampleSize、RGB_565替换RGB_8888
  
- 尽量不要在循环中创建大量对象

### 注：

1. 在C++ 中，内存分配释放有程序员自己管理。内存泄漏发生的情况是，如果有些对象被分配了内存空间，然后却不可达，由于C++中没有垃圾回收机制，导致无法再释放这些内存空间。

2. 对于Java程序员来说，GC基本是透明的，不可见的。虽然，我们只有几个函数可以访问GC，例如运行GC的函数System.gc()，但是根据Java语言规范定义， 该函数不保证JVM的垃圾收集器一定会执行。因为，不同的JVM实现者可能使用不同的算法管理GC。通常，GC的线程的优先级别较低。JVM调用GC的策略也有很多种，有的是内存使用到达一定程度时，GC才开始工作，也有定时执行的，有的是平缓执行GC，有的是中断式执行GC。就是说GC是不可控的，基本是透明的。

3. Java对引用的分类有 Strong reference, SoftReference, WeakReference, PhatomReference 四种

- 强引用(StrongReference)：JVM 宁可抛出 OOM ，也不会让 GC 回收具有强引用的对象
- 软引用(SoftReference)：只有在内存空间不足时，才会被回的对象
- 弱引用(WeakReference)：在 GC 时，一旦发现了只具有弱引用的对象，不管当前内存空间足够与否，都会回收它的内存
- 虚引用(PhantomReference)：任何时候都可以被GC回收，当垃圾回收器准备回收一个对象时，如果发现它还有虚引用，就会在回收对象的内存之前，把这个虚引用加入到与之关联的引用队列中。程序可以通过判断引用队列中是否存在该对象的虚引用，来了解这个对象是否将要被回收。可以用来作为GC回收Object的标志