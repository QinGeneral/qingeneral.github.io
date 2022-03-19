# 四步准备 Android 面试

![四步准备Android面试](http://upload-images.jianshu.io/upload_images/1214187-053e3709d42521dd.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

各大公司内推进行的如火如荼，再过一段时间就是校招。

面试可以说是学生步入社会的一场考试，只不过是笔试+多次面试（口头考试）的结合体，只要时间不冲突，可以多考几次，秋招不行还有春招。

笔试形式类似在学校的考试。面试相对来说形式新一些，难度更大一些，考察的范围不仅仅是专业知识的掌握，还包括性格、抗压能力、表达能力、随机应变能力等等。

但是归根到底，找工作的过程就是解决一个相对复杂问题的过程。可以按照以下四部进行准备：

1. 定义问题
2. 划分问题
3. 逐个突破
4. 系统化

接下来一步步的看一下具体细节。

## 1. 定义问题

首先，定义一下我们解决的是什么问题。在这里，因为我们是Android方向，所以可以简单定义为：“我们要找到一个Android方向的工作（或相关的工作），工作要尽量好”。

> 这个定义很模糊，什么是尽量的好呢？有的人看中薪资，有的人看中五险一金，各种福利等等。在这里，我们不考虑个人主观因素占比较大的问题。我们只考虑更加可控的东西。就是通过个人努力可以获得效果的问题。  

我们再思考一下“找到一个Android方向的工作”起决定性的因素是哪一个呢？
答案是面试。当然一个人过去做过的项目，拿过的奖也至关重要。但是到了这个马上就要面试的时间节点，过去的已经过去，无法改变，能控制的只有现在。没有项目无关紧要，关键的是现在如何准备面试。

目标：我要通过面试，拿到offer（或者我要通过多家公司面试，拿到多家公司的offer，选择最合心意的公司去工作）。当然，这句话表达的太宽泛，并没有什么指导意义。定义问题很重要，而更重要的是如何划分问题，这一步才是具有指导意义，能够落到实践中去的内容。

## 2. 划分问题

Android面试需要准备内容的大致划分：（括号内为重要程度，最多 5 颗星）

- Android相关知识、Java相关知识、设计模式（5）
- 算法、数据结构（5）
- 如何写简历、如何面试（4）
- 项目、比赛获奖（4）
- 操作系统、网络、数据库（3）

### 细分

以下细分内容，网络等计算机基础方面还不是很全面，持续更新中。
我会逐步更新各个知识点相关博客或资源，如果需要，建议关注。

#### Android

- Context的理解
- Activity生命周期、启动模式
- IntentFilter匹配规则
- IPC：Serialzable、Parcelable、Binder、Socket
- View事件体系
- View绘制流程
- RemoteViews（不重要）
- Drawable（不重要）
- 动画、绘图
- window、wm、wms
- 四大组件启动、工作流程（Activity至少看一下，AMS）
- 消息机制：looper、handler、MQ
- 线程、线程池、多线程
- bitmap加载、缓存：LRUCache、DiskLruCache、LinkHashMap
- CrashHandler（一般）
- multidex（一般）
- Fragment、Service、SQLite、Webview
- 内存泄漏：原因、解决方法
- ANR的原因、解决方法
- 开源库（一般要求看过源码，知道原理）：Retrofit、RxAndroid、EventBus、Picasso（优点）、OKhttp3
- 持续集成Jenkins（不重要）
- 单元测试、测试用例（一般）
- 插件化：Atlas、OSGI（一般）

#### Java

- Java基础：比如接口和抽象类的区别等
- Java内存管理：工作内存和主内存等
- 垃圾回收：回收算法、如何判断对象可以回收、新生代老年代等
- 并发
  - 锁：sychronized、lock（CAS）
  - volatile
  - 并发集合：CopyOnWriteArrayList、ConcurrentHashMap、RemoteCallbackList（Android的IPC用到）、LinkedHashMap
- 集合
  - Map、Set、List
  - Queue、Stack
  - HashMap、HashTable、ConcurrentHashMap：实现原理，区别等
  - LinkedHashMap

#### 设计模式（六大原则：SOLID + 迪米特）

- 单例模式：获取各种service
- 工厂方法：activity、service（onStart）
- 责任链：Android事件分发
- builder：dialog、Picasso
- 观察者：listview更新、EventBus
- 适配器：listview adapter

#### 算法、数据结构

- 排序
  - 冒泡排序
  - 选择排序
  - 归并
  - 堆排序
  - 插入排序
  - 快速排序
  - 希尔排序
  - 桶排序
  - 基数排序

- 字符匹配：KMP算法
- 二分查找
- 二叉树遍历、翻转、重构；二叉查找树
- 红黑树
- AVL树、哈夫曼树、B树（一般）

#### 网络

- OSI七层模型、各层功能、各层协议
- TCP/IP四层模型
- TCP三次握手、四次挥手
- TCP、UDP区别
- Http、Https区别

#### 操作系统、数据库

- 线程状态及其切换
- 线程、进程区别
（数据库重要程度相对低一些，正在整理中，后续会更新）

#### 简历、面试、项目

篇幅较大，会有另外博客进行探讨，敬请关注

## 3. 逐个突破

可以自己去网上找一些博客、书籍，进行各个知识点的突破，要有耐心，找到一个心仪的工作非一日之功。
一方面，我会陆续更新一些专业知识和面试相关的博客。
另一方面，把我自己的一些资源分享给大家。

- 博客
GitYuan（gityuan.com）、罗升阳（CSDN）、邓凡平（CSDN）、任玉刚（CSDN）
- 书籍
Android 4高级编程、Android开发艺术探索、Android源码设计模式、Android 50 hacks、Android应用性能优化最佳实践、Efficient Java、深入Java虚拟机、Java并发编程、Think in Java
- 刷题
LeetCode、牛客网

## 4. 系统化

又是一个很大的主题，在另外博客中进行探讨，后续会更新，敬请关注。