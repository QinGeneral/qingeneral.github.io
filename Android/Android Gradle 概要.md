# Android Gradle 概要

Android 工程 Gradle 相关文件有：

工程目录下的build.gradle、settings.gradle；各个module目录下的build.gradle。

其中settings.gradle里的内容非常简单,比如：
```
include ':app', ':libraries:lib1'
```
这里定义了有哪些Gradle工程。

其他build.gradle文件的内容大致包括：

```
buildscript {
    repositories {
        mavenCentral()
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:0.11.1'
    }
}

apply plugin: 'android'

android {
    compileSdkVersion 19
    buildToolsVersion "19.0.0"
}

dependencies {
    compile ***
    implemention ....
}
```

各部分代码解释：
- ```buildscript { ... }``` 部分配置了驱动构建的代码。这部分的配置只会影响构建过程的代码，和你的工程没有关系。工程会定义它自己的仓库和相关依赖
- ```apply plugin: 'android'```应用Android插件
- ```android { ... }``` 这部分配置了 android 构建需要的所有参数。这里也是 Android DSL 的入口点。默认情况下，只有编译的目标SDK、构建工具的版本是必需的。就是 compileSdkVersion 和 buildtoolsVersion 两个配置属性。  
android 元素里的 defaultConfig 负责定义所有的配置；sourceSets属性可以设置代码、资源目录；signConfigs、buildType可以设置签名配置文件、密码、编译类型等内容；
- ```dependencies { ... }```dependencies 元素是标准 Gradle API 的一部分，并不属于 android 的元素。compile 配置用来编译 main application，它里面的一切都会被添加到编译的 classpath 中，并且也会被打包到最终的 APK 中。除了compile，还有androidTestCompile、debugCompile、releaseCompile来配置不同编译情况的依赖。

#### Gradle任务

> 总结于《Android Gradle插件中文指南》

Android使用了和Java同样的约定规则来和其他插件保持兼容，并且又添加了一些额外的引导任务（这些任务都是依赖于其他子任务，而非自己完成对应的工作）:

- assemble 这个任务会汇集工程的所有输出
- check 这个任务会执行所有校验检查
- connectedCheck 运行 checks 需要一个连接的设备或者模拟器，这些checks将会同时运行在所有连接的设备上。
- deviceCheck 通过 API 连接远程设备运行 checks。它被用于 CI (持续集成)服务器上。
- build 这个任务会同时执行 assemble 和 check 任务
- clean 这个任务会清理工程的所有输出

#### Gradle技巧

> 总结于《Android高级进阶》

##### Gradle共享变量

平常会遇到多个module的情况，这时module自己单独管理sdk版本比较麻烦，可以使用外部变量的方式来解决问题。

1. 在工程目录下新建common_config.gradle文件，用于公共变量
2. 输入代码如下
    ```
    project.ext {
        compileSdkVersion = 23
        ...
    }
    ```
3. 工程中各个module的 build. gradle 文件引用全局配置项如下。 
    ```
    apply from: "${project. rootDir}/common_config.gradle"
    android { 
        compileSdkVersion project.ext.compileSdkVersion
        ...
    }
    ```
4. 在module比较多时，按照第三步的配置就比较复杂。可以在工程目录下的build.gradle中如下配置：
    ```
    subprojects {
        apply from: "${project. rootDir}/common_config.gradle"
    }
    ```

##### 远程仓库

远程仓库包括Maven Central、JCenter。JCenter传输速度快、更加安全的特性，Android Studio 已将JCenter作为默认依赖源。

代码中，添加远程依赖的方式：
```
compile 'de.greenrobot:eventbus:2.4.1'
```

Gradle 会根据上面的依赖配置，向Maven Repository服务器查询是否存在该版本的函数库，如果存在，则会根据服务器类型拼接下载请求url。然后将对应的jar、aar和一些配置、签名文件下载到本地，以供项目使用。