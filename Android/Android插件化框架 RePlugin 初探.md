# Android 插件化框架 RePlugin 初探

![图片取自Zoommy](http://upload-images.jianshu.io/upload_images/1214187-cdc201ccaaf09aff.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 为什么要使用Android插件化框架？  

写软件时，软件的扩展性至关重要。而软件的扩展性跟其代码的解耦程度相关。解耦程度大，就是模块化强。解耦程度小，即模块化弱。

插件化框架RePlugin，所做的就是将软件解耦，实现了代码的模块化。这对软件本身的后续开发、功能添加等，是十分有利的。大大降低了扩展软件的成本，代码的清晰度也提高了。

RePlugin带来的好处不止这些，它还给应用提供了“不用更新APP，直接更新、添加功能”的能力。能帮助我们以更低的用户成本，更加快速的进行迭代。

## Android插件化框架要解决什么问题？

从Android的FrameWork结构来看，Android插件化都要解决基本的三个问题：

1. 资源管理，比如drawable、string等资源
2. 四大组件的生命周期，主要是activity、service组件
3. ClassLoader类加载

## 目前已经开源的Android插件化框架

开源的插件化框架：

1. Atlas（阿里 [点击访问GitHub](https://github.com/alibaba/atlas)）
2. VirtualAPK（滴滴 [点击访问GitHub](https://github.com/didi/VirtualAPK)）
3. RePlugin（360 [点击访问GitHub](https://github.com/Qihoo360/RePlugin)）

其中，Atlas主要概念是组件化。RePlugin的优点是只hook了一处——ClassLoader。所以稳定性极强，适配十分简单。

## RePlugin 两个主要概念

RePlugin分为宿主和插件的概念。一个APP由 1个宿主 + n个插件组成。宿主的主要功能是管理插件的安装、卸载、更新；插件权限管理等等（当然也可以将管理功能作为一个插件）。那APP下的每一个模块就可以对应一个插件。当你需要添加功能、更新功能的时候，直接把新的插件或更新后的插件发布到线上即可。

## RePlugin 宿主配置教程

1. 添加 RePlugin Host Gradle 依赖

    在项目根目录的 build.gradle中添加 replugin-host-gradle 依赖：

    ```gradle
    buildscript {
        dependencies {
            classpath 'com.qihoo360.replugin:replugin-host-gradle:2.2.1'
            ...
        }
    }
    ```

2. 添加 RePlugin Host Library 依赖

    在 app/build.gradle 中应用 replugin-host-gradle 插件，并添加 replugin-host-lib 依赖:

    ```gradle
    android {
        // 要配置applicationId
        defaultConfig {
            applicationId "com.qihoo360.replugin.sample.host"
            ...
        }
        ...
    }

    // apply语句必须放置到android标签之后，以读取applicationId属性
    apply plugin: 'replugin-host-gradle'

    dependencies {
        compile 'com.qihoo360.replugin:replugin-host-lib:2.2.1'
        ...
    }
    ```

3. 配置 Application 类

    让工程的 Application 直接继承自 RePluginApplication。

    ```Java
    public class MainApplication extends RePluginApplication {

    }

    ```

    在AndroidManifest中配置这个Application。

    ```xml
     <application android:name=".MainApplication"
        ...
        />

    ```

只需三步就把RePlugin的宿主配置好了，之后即可在宿主的代码中调用RePlugin相关api，启动、管理插件。

> 注：如果插件需要使用宿主的依赖库，需要在宿主的Application类中加入以下代码把"插件使用宿主类"选项打开，默认是关闭  

    ```Java
    rePluginConfig.setUseHostClassIfNotFound(true);
    ```

## RePlugin 插件配置教程

1. 项目根目录的build.gradle，添加以下代码  

    ```gradle
    buildscript {
        dependencies {
            classpath 'com.qihoo360.replugin:replugin-plugin-gradle:2.2.1'
            ...
        }
    }
    ```

2. 在app/build.gradle中，添加以下代码

    ```gradle
    apply plugin: 'replugin-plugin-gradle'

    dependencies {
        implementation 'com.qihoo360.replugin:replugin-plugin-lib:2.2.1'
        ...
    }

    ```

两步即可将插件配置好。编写插件代码之后，将插件工程导出apk，改名为 [PluginName].jar 放到宿主工程的assets/plugins文件夹，启动APP即可。

> 注：
>
> - 配置插件别名时，在插件的AndroidManifest.xml中，添加以下内容即可（和activity标签并列）
>    ```xml
>    <meta-data
>        android:name="com.qihoo360.plugin.name"
>        android:value="[你的插件别名]" />
>    ```
> - 插件的版本号即app/build.gradle中配置的 versionCode
> - 更新插件时迭代插件版本号，重启应用，框架会自动重载、更新插件（RePlugin是这样设计的，但是有bug，解决方法见下，新版本的RePlugin已解决此bug但未发布，可自行去官网下载编译）
> - 当前版本的RePlugin框架的bug：更新插件后，重启应用不会自动加载插件。要解决这个bug，需要在APP关闭时，同时将:GuardService进程（这是插件管理进程，默认启动）关闭即可。
> - compileOnly(provide)  : 库只用于编译期，不会打入apk中；implement(compile) : 会打入apk中。在插件使用宿主的依赖库时，只需使用compileOnly即可，可以减小包的体积