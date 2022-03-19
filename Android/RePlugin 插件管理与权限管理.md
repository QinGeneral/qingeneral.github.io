# Replugin 插件管理与权限管理

![图片取自Zoommy](http://upload-images.jianshu.io/upload_images/1214187-fae0c9a991b5e3c5.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

插件化能够提高我们程序的拓展能力，提高灵活性。Android中比较有特点的一个插件化框架是RePlugin。

RePlugin分为宿主和插件的概念。一个APP由 1个宿主 + n个插件组成。宿主的主要功能是管理插件的安装、卸载、更新；插件权限管理等等（当然也可以将管理功能作为一个插件）。那APP下的每一个模块就可以对应一个插件。当你需要添加功能、更新功能的时候，直接把新的插件或更新后的插件发布到线上即可。

插件入门教程请 [点击查看。](https://www.jianshu.com/p/b3c4421f0008)

## 本文包括以下内容：

- 插件安装、更新、卸载
- 线上插件：服务器管理插件信息
- 插件权限管理

## 1. 插件安装、更新、卸载

插件的基础操作包括插件的安装、更新、卸载等，RePlugin不支持插件的降级。RePlugin对此进行了很好的封装，仅需调用以下代码。

RePlugin中的插件分为外置插件和内置插件。内置插件即随应用安装包（宿主）附带的、在工程app/src/main/assets/plugins文件夹中的插件，内置插件的名称格式为[插件名].jar，文件名即为程序中的插件名。外置插件即应用运行时从sdcard安装的插件。另外，内置插件更新后也会变成外置插件。

### 安装与升级

插件的安装与升级是调用同一代码即可。如果插件正在运行，则不会立即升级，而是“缓存”起来。直到所有“正在运行插件”的进程结束并重启APP后才会生效。

```Java
RePlugin.install("sdcard路径");
```

另外可以在插件安装之后加入以下代码，提前释放插件的文件，提高插件的启动速度。因为在插件安装更新之后，不做任何操作，第一次启动会很慢。

```Java
PluginInfo pluginInfo = RePlugin.install("插件sdcard路径");

if (pluginInfo != null) {
  RePlugin.preload(pluginInfo);
}
```

## 卸载

要卸载插件，则需要使用 RePlugin.uninstall方法。只需传递一个“插件名”即可。

```Java
RePlugin.uninstall("pluginName");
```

## 启动

调用以下代码启动插件中的Activity

```Java
RePlugin.startActivity()
```

> 建议在用户第一次启动应用时，主动对所有的内置插件调用 preload 方法，并在界面显示处理进度。否则，用户每当第一次打开应用中的插件时，框架会先解压插件，耗时比较长

## 2. 线上插件

为了让应用真正拥有灵活更新其功能的能力，就需要把一些插件放到服务器上，按需下载、安装插件。

服务器端就不再详说，主要是可以查看插件列表，下载插件，插件权限管理等功能。下载功能的简单实现可以参考博客 [Tomcat文件下载服务器](https://www.jianshu.com/p/b3463dd28d95)

主要说一下服务器插件信息的数据结构，当然不同的需求有不同的结构。

```json
[{
    "showName": "插件展示给用户的名字",
    "realName": "程序中的插件名",  
    "isBuiltIn": "是否内置",
    "updateInfo": "更新信息",
    "iconTypeAndName": "插件图标名字mipmap/ic_launcher",
    "version": "插件版本号",
    "host2PluginActivities": [
      {
        "name": "插件中可以被启动的activity"
      }
    ]
},
...
]
```

## 3. 插件权限管理

当一个应用需要对不同用户控制其权限时，就要在服务器端对插件的权限进行管理。比如说公司内部软件需要对不同角色的人员给与不同的功能，限制其对其他部门功能的使用。

简单描述一下插件的权限管理功能。主要就是实现能够控制不同用户使用不同组合的插件。

可以采用以下的关系：

![角色插件关系对应](http://upload-images.jianshu.io/upload_images/1214187-b328bbd2f0cb0720.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

就是说“权限”是插件和用户的连接点，每个插件拥有一个对应的权限，一个用户拥有多个角色，一个角色对应多个权限。

那我们首先需要有三张表：用户表、角色表、插件信息表。我对三张表的处理和说明如下

### 用户表

用户表在插件管理中拥有字段 repluginRole 即可，代表用户的插件角色。

### 角色表repluginRole

字段 | 说明
---|---
id | 角色id
roleName | 角色名称
permission | 所拥有的权限

### 插件信息表 repluginPluginInfo

> 这里简化其他字段，只保留插件权限相关字段

字段 | 说明
---|---
id | 用户id
requirePermission | 插件要求的权限
isOnline | 插件是否在线，即是否发布

那么去服务器获取某员工插件列表的过程如下：

1. 获取该员工的角色，repluginRole字段
2. 通过repluginRole获取该角色所拥有的权限列表
3. 获取插件列表，用上一步的权限列表去匹配各个插件的权限，如果isOnline为true（插件已上线）且拥有插件权限就放入插件列表

> **Tips**  
目前RePlugin存在bug（2.2.1版本），即安装、更新插件并重启App关闭后，读取插件信息出错，无法加载刚刚更新的插件。
>
> 解决：
>
> 1. 关闭应用时，手动杀死：GuardService进程即可。GuardService进程为RePlugin框架后台处理插件安装等操作的进程。官方回复，2.2.2版本已经修复，但还未放出此版本。
> 2. 在Host工程的app module对应的build.gradle中设置persistentEnable = false，使用主进程为插件管理进程。这样做的原理同上，在关闭APP的时候关闭框架的插件管理进程。但是我这样做的时候这会导致APP启动特别慢，运行卡顿，还可能会崩溃。推荐用方法1，虽然这样做需要去处理各种APP关闭的情况。