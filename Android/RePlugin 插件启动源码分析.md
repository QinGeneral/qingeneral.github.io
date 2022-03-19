# RePlugin 插件启动源码分析

![图片取自zoommy](http://upload-images.jianshu.io/upload_images/1214187-320b9142dcf1522c.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

大年初一，先祝各位新年快乐！今天还在看博客学习的兄dei很强大，如果能把一年节日假期时间分配到自己成长上，那你的一年 = 别人一年 * 1.1。如果能够做到年年如此，10年后你就相当于活了11年。而这期间，学习复利效应的效果是呈现指数增长的。当然，朋友关系也不能落下，但在节假日做无聊的事情就是浪费时间了。

之前搭建了RePlugin源码阅读环境，详情请参考博客[RePlugin阅读源码环境搭建
](https://www.jianshu.com/p/2244bab4b2d5)。

今天来分析一下RePlugin启动插件（RePlugin.startActivity）的流程。

下图是我用StarUML画的时序图-SequenceDiagram，简单表现了RePlugin.startActivity调用后发生的事情及其先后顺序。

![RePlugin插件启动时序图](http://upload-images.jianshu.io/upload_images/1214187-bf017c4720518827.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

下面进行详细分析。

## 1. RePlugin.startActivity

RePlugin中启动插件，就是通过调用以下方法。

```Java
RePlugin.startActivity(context, intent);

// 或者

RePlugin.startActivity(context, intent, pluginName, activity);
```

RePlugin是一个有很多静态方法的类。集成了安装卸载插件、启动插件等功能。使用RePlugin框架，一般来说只需要操作RePlugin类就行。

## 2. Factory.startActivityWithNoInjectCN

这两个startActivity方法，最终都会调用

```Java
Factory.startActivityWithNoInjectCN(context, intent, plugin, activity, process);
```

但```startActivity(context, intent, pluginName, activity)```方法，中间多了一步，就是给intent设置ComponentName。会先调用以下方法初始化componentName，然后调用```startActivityWithNoInjectCN```方法。

```Java
Factory.startActivity
```

Factory是框架内部的一个工具类，主要集成了查询插件、查询插件资源、查询Activity信息、加载插件等功能。在启动插件中，Factory中所做的工作就是设置ComponentName给Intent。其中ComponentName主要包括两个属性：pkgName和clsName。这两个属性和插件属性对应关系：pkgName == pluginName、clsName == activityName。

```startActivityWithNoInjectCN```方法的代码如下：

```Java
boolean result = sPluginManager.startActivity(context, intent, plugin, activity, process);

RePlugin.getConfig().getEventCallbacks().onStartActivityCompleted(plugin, activity, result);
```

```startActivityWithNoInjectCN```就包括两部分，第一行代码是直接调用PluginCommImpl的startActivity方法启动Activity，这个在下一部分继续说。

第二行是调用RePluginConfig的方法回调，告知已经启动Activity。这里的RePluginConfig回调，是可以在自己宿主的application中设置的。设置回调后，就可以在application中进行各个事件的处理，比如插件安装失败事件回调方法```onInstallPluginFailed```。以官方samplehost代码为例，设置回调的代码如下。

```Java
// SampleApplication.java

repluginConfig.setEventCallbacks(new HostEventCallbacks(this));
```

## 3. PluginCommImpl.startActivity

在```Factory.startActivityWithNoInjectCN```中，调用了```pluginCommImpl.startActivity```方法，而在此方法中没有做任何实质的工作，直接调用了```PluginLibraryInternalProxy.startActivity```方法。

## 4. pluginLibraryInternalProxy.startActivity

`PluginLibraryInternalProxy`是最终实现启动插件的地方，也是做了最多工作的地方。流程图见下图。

![pluginLibraryInternalProxy.startActivity流程图](http://upload-images.jianshu.io/upload_images/1214187-80c2ae1fc42d2a2b.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在PluginLibraryInternalProxy中，先判断download标签和plugin是否为null。download标签默认为true，目前没有手动修改的办法。如果判断成立，则回调application中的方法。

然后判断是否是动态类，是的话设置Intent、启动Activity即可。否则进入下一步。

如果插件还没有加载，调用```onLoadLargePluginForActivity```方法加载插件。然后初始化ComponentName，设置Intent，调用```context.startActivity```启动插件中指定的Activity。最后调用回调方法，通知application已经启动完毕。

## 总结

这样来看，RePlugin启动插件，也就是RePlugin.startActivity方法的调用过程，最终还是调用```context.startActivity```方法实现的。RePlugin框架所做的就是对Activity的pkgName、activityName进行处理：使用这两个属性创建ComponentName，并传递给Intent；以及在启动插件的不同时期，对RePluginConfig的回调，如未找到插件时会回调```onPluginNotExistsForActivity```方法。

最后，RePlugin启动插件可以说是RePlugin框架源代码的入口，接下来会对插件安装、卸载等功能的源码进行分析，以此一步步的对RePlugin框架整体建立系统的认识，对RePlugin的实现机制有所了解。学习框架中的设计模式，最终能够应用到自己的代码中去。