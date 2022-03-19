# Android 开发涉及知识概要

### 基础

- Android历史  
- 开发语言：Java、C++  
- 系统：Android、TV、Wear、Auto、Things  
- 系统架构简介
- Android已发布版本及更新
- 开发环境搭建、建立工程、AndroidStudio简单使用

### 入门

- UI控件【分为布局、组件？】（可细分）；Intent（显，隐）；Notification；Fragment
- 四大组件：Activity、Service、Broadcast、ContentProvider
- 多屏幕适配；权限管理；WebView；
- 网络：WebView、XML、Json、GSON、HTTP（okHttp）；
- 持久化：SQLite-LitePal、SharedPreference、文件操作；Application；与其他APP交互；后台；
- 调用硬件：相机、相册、视频、音频、录音、传感器、定位（GPS、网络）、地图（百度）、NFC、蓝牙；
- 工程目录结构：layout、res、drawable、values：colors，dimens，strings，styles，theme、menu、XML布局、AndroidManifest、build.gradle、assets、SDK版本与兼容
- UI组件：TextView、Button、EditText、ImageView、ProgressBar、AlertDialog、ProgressDialog、ListView、RecyclerView，Adapter，ViewHolder、ListView、GridView、View Pager、Nine-Patch图片、布局（Linear、Frame、Relative、Absolute、Fragment？）、自定义控件、DialogFragment、工具栏、菜单、搜索（搜索框、搜索功能）
- Gradle简单介绍、模拟器、日志使用、简单调试

### 进阶

- 编译过程、MaterialDesign：ToolBar，DrawerLayout，NavigationView，FloatingActionButton，SnackBar，CardView，FloatingActionButton，C，APPBarLayout，下拉刷新
- Activity生命周期、启动模式、IPC、View事件体系（等于“触摸事件传递机制？）、RemoteView、View工作原理（绘制过程？）、Drawable、动画、Window和WindowManager
- 四大组件工作过程、消息机制、Bitmap加载和Cache、CrashHandler、JNI、NDK、性能优化、内存泄漏分析-MAT、提高可维护性、Annotation、EventBus、线程（多线程：AsyncTask、子线程更新UI）和线程池、异步、OpenGL、函数式编程、Percent Support Library、Design Support Library
- Gradle、注解、数据序列化、WebView中Java和JS交互、DataBinding、规范代码、基于开源项目搭建属于自己的技术栈、插件框架机制、推送机制、全局Context、定制自己的日志工具、调试、定时任务、多窗口、Lambda、自定义View（组件）、Looper、Handler、HandlerThread、Message、定制View和Event
- Android安全、反编译

### 设计模式

MVP、MVVM、Builder模式

### 开发工具

- IDE：AndroidStudio、Eclipse
- 调试工具
- 插件
- 辅助工具：Git
- 命令行工具
- 持续集成

### 开源项目、开源库

### 包管理

### APP上传、打包、升级

### 第三方服务

广告、Crash、统计、应用分发、数据存储、推送、分享、便捷登录、Google Play服务