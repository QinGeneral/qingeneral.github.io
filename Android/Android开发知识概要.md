# Android 开发知识概要

## Android简介

Android一词最早出现在法国作家维里耶德利尔·亚当1986年发表的《未来夏娃》这部科幻小说中，作者利尔·亚当将外表像人类的机器起名为Android。这就是Android小人名字的由来。

05年，Google低调收购了一家公司。  
07年，Android系统首次亮相。  
08年，Google推出Android 1.0。  
11年，Android系统全球份额位居第一。  

自从Android发布以来，凭借开源的优势，迅速占领了市场。又因为使用Java就可以开发Android应用，软件开发者们也迅速的涌入到Android开发的潮流之中。

## 序言

我从大二开始接触Android，中间断断续续做了几个项目。中间有很长一段时间感觉到了瓶颈，无法进步。所处的状态就是做项目的话能做，该实现的功能一般都实现得了，但是总感觉写的代码灵活性、扩展性方面甚是欠缺。后来静下心对framework源码进行一些学习后，才感觉有所进步，突破了之前的瓶颈，也感觉重回到了一开始进步快速的状态。目前也在继续探索系统源码，思考一些设计模式和架构方面的东西。

另外高人指点或有人一起学习特别重要，而我之前在这方面做得确实不足，希望之后能和大家一起讨论一些问题。

最近在探究Android拉活机制和Android插件化开发。晚点我会整理成文章发出来。之后我也会写一些Android开发中实用的技巧，Android进阶需要掌握的知识和思想，希望能尽快和大家分享和交流。 

挖了很多坑，希望填的满。

简单来说，Android开发其实就是编写Java代码，配合xml文件和图片资源，然后打包安装到Android系统的软件。  

以下是我总结的Android开发涉及知识的简要内容，供大家参考。


## 准备

- Android历史  
- Android已发布版本及更新历史
- 开发语言：Java基础、C++基础（JNI）  
- 系统架构简介
- 开发环境、AndroidStudio简单使用，AS插件使用，命令行工具

## 基础

- 界面：四大组件、布局、UI组件、自定义view、动画
- 网络：okhttp、Gson等
- 数据持久化：SharedPreference、SQLite、文件等
- 进程、线程、同步、异步
- 辅助开发工具的使用：依赖管理Maven、构建工具Gradle、Crash处理、调试、日志
- APP打包、上传、升级

## 进阶
### Framework底层代码角度重新思考Android开发

- AIDL、Binder、多进程
- 事件分发、view
- handler、looper、MessageQueue
- 动画细节
- 性能优化
- JNI
- 开源框架、开源库：OKhttp、EventBus、Retrofit等
- 注解
- 优化工具：Hierarchy Viewer、OOM检测优化工具MAT、Lint
- 设计模式、架构
- Activity启动模式、标记位、Intent Filter
- Service启动、绑定
- 多线程：AsyncTask、HandlerThread、IntentService
- 线程池

## 系统核心机制

- AMS、PMS
- Window和View的关系
- 四大组件工作过程（Activity启动过程)
- SystemServer启动过程

## 其他
### 需求不同，需要掌握的技术不同

- 硬件调用相关（传感器、定位等）
- 持续集成
- 版本管理Git
- Material Design
- 第三方服务：
广告、Crash、统计、应用分发、数据存储、推送、分享、便捷登录、Google Play服务
- Android安全、反编译
- 增量更新、热更新
- 插件化

## 学习资源

### 看  
书籍、博客、Android training & guide、源码

### 写

> 总结很重要

博客、笔记

### 一些资源

- http://gityuan.com/  
- CSDN博客：罗升阳、邓凡平、任玉刚
- 简书上也有很多高质量的博客
- 基础书籍《Android4高级编程》《第一行代码》《Android 50 hacks》
- 进阶书籍《Android开发艺术探索》《Android源码设计模式》《Android系统源代码情景分析》
- 其他书籍《代码大全》《重构》《深入理解Java虚拟机》《Java并发编程》《efficient Java》等