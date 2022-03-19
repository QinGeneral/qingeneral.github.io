# RePlugin 阅读源码环境搭建

![图片取自zoommy](http://upload-images.jianshu.io/upload_images/1214187-ff14d3a074c780f9.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

RePlugin是一个开源的Android插件化框架，只hook一处的思想不禁让人想读一下它的源代码。另外了解一下RePlugin的源代码也能够方便自己代码的编写和对设计模式的认识。

RePlugin框架本身是基于AndroidStudio开发的，主要包括两种类型的库：

- Android Library
- Gradle 插件  

每种库又分为宿主和插件，最后RePlugin包括四部分：

- replugin-host-gradle
- replugin-host-lib
- replugin-plugin-gradle
- replugin-plugin-lib

可以在官网查看其目录结构和下载源码 [点击查看](https://github.com/Qihoo360/RePlugin)。

本文包括以下内容：

- 使用AndroidStudio搭建RePlugin源码阅读和编译环境
  - 我的软件版本
  - 下载源码和新建工程
  - 导入RePlugin的4个module
  - 编译修改后的module
  - 导入sample代码，并使用自己的RePlugin
- 自定义Gradle插件

## RePlugin源码阅读环境搭建

### 0. 我的软件版本

- AndroidStudio 3.0
- RePlugin 2.2.2
- 运行系统 macOS High Sierra

### 1. 下载源码和新建工程

[点击去官网下载](https://github.com/Qihoo360/RePlugin)，或者直接使用终端命令：
> git clone https://github.com/Qihoo360/RePlugin.git

下载完成后，目录结构如下：  

![RePlugin目录](http://upload-images.jianshu.io/upload_images/1214187-e04d44ad4be9dbf4.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其中除了replugin-sample目录是官方示例代码外，其他目录为框架源码。也是我们需要导入到AndroidStudio进行阅读、修改、编译的代码。

AndroidStudio 新建工程比较简单，不再详述。

### 2. 导入RePlugin的4个module

4个module的导入方法一致，见下图：

![导入module](http://upload-images.jianshu.io/upload_images/1214187-2219c73e8d11abc1.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后选择Source Directory 到RePlugin文件夹下的module文件夹。确定即可。

重复以上步骤四次，将RePlugin的四个module分别导入。导入后，工程结构如下：

![工程结构](http://upload-images.jianshu.io/upload_images/1214187-5c8889fe30445b89.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其中app是新建工程自带module，其他四个分别对应RePlugin的四个module。

### 3. 编译修改后的module

其中replugin-host-lib和replugin-plugin-lib为Android Library，可通过 ***implementation project(':replugin-host-lib')*** 的方式在同一工程中直接使用，无需导出jar、aar包的过程。但是对于replugin-host-gradle和replugin-plugin-gradle这两个gradle插件，就需要使用先编译再配置引用的方式使用。以replugin-host-gradle为例，过程如下：

#### a. 找到host-gradle的build.gradle文件，添加以下代码，之后点击![Sync with Gradle File](http://upload-images.jianshu.io/upload_images/1214187-61ecd3e9d9f8ae0d.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)按钮，同步工程

```gradle
    uploadArchives {
        repositories {
            mavenDeployer {
                //提交到远程服务器：
                // repository(url: "http://www.xxx.com/repos") {
                //    authentication(userName: "admin", password: "admin")
                // }
                //本地的Maven地址设置为/Users/***/repos
                repository(url: uri('/Users/****/repos'))
            }
        }
    }
```

build.gradle文件所在
![build.gradle文件所在](http://upload-images.jianshu.io/upload_images/1214187-0fdab154e06c701b.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### b. 编译gradle插件

打开Gradle标签页面，选择replugin-host-gradle下的upload/uploadArchives，这个选项是上一步加入的代码后新增的选项。双击编译，等编译完成后，去配置的文件夹 /Users/****/repos 下查看。

![编译gradle插件](http://upload-images.jianshu.io/upload_images/1214187-a2383ab31c521d8c.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![编译后目录结构](http://upload-images.jianshu.io/upload_images/1214187-61157b1f5f151aa8.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### c. 导入sample代码，并使用自己的RePlugin

导入sample代码和之前导入module过程一致，不在累述。

以下是修改配置文件，使用本地RePlugin的过程：

找到工程的build.gradle文件，一般在第一个，修改如下：

```gradle
    buildscript {
        ext.kotlin_version = '1.1.51'
        ext.repluginHostGradleVersion = '2.2.2'
        ext.repluginPluginGradleVersion = '2.2.2'
        repositories {
            google()
            jcenter()
        }
        dependencies {
            classpath 'com.android.tools.build:gradle:3.0.0'
            classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"

            classpath 'com.jfrog.bintray.gradle:gradle-bintray-plugin:1.6'
            classpath 'com.github.dcendents:android-maven-gradle-plugin:1.4.1'
            // NOTE: Do not place your application dependencies here; they belong
            // in the individual module build.gradle files
        }
    }
```

我这里使用RePlugin版本均为2.2.2，可自行根据情况修改。以下两个是新加入的内容。

```gradle
    classpath 'com.jfrog.bintray.gradle:gradle-bintray-plugin:1.6'
    classpath 'com.github.dcendents:android-maven-gradle-plugin:1.4.1'
```

然后找到samplehost module的build.gradle文件，在顶部添加以下内容：

```gradle
    buildscript {
        repositories {
            maven {
                url uri("/Users/****/repos")
            }
            mavenLocal()
            jcenter()
            mavenCentral()
        }
        dependencies {
            classpath "com.qihoo360.replugin:replugin-host-gradle:$repluginHostGradleVersion"
        }
    }
```

其中uri中的内容为编译gradle插件时配置的本地目录。

最后修改samplehost module的build.gradle文件的dependencies，主要是替换replugin-host-lib依赖，如下：

```gradle
    dependencies {
        compile fileTree(include: ['*.jar'], dir: 'libs')
        compile 'com.android.support:appcompat-v7:25.3.1'
    //    compile 'com.qihoo360.replugin:replugin-host-lib:2.2.1'
        implementation project(':replugin-host-lib')
    }
```

最后运行samplehost即可。另外，每次修改gradle插件内容后，需要重新uploadArchives编译发布插件到本地，才能在自己的samplehost中使用修改后的插件。

到此，RePlugin源码阅读、修改、编译的环境就搭好了，相对简单。主要是gradle插件的配置。之后就可以探索RePlugin的世界了。

这里涉及到主要是gradle插件，以下说一下自定义gradle插件。

## 自定义gradle插件

因为已经有写的很好的博客，在此不再重复编写。这篇文章写得十分全面，很有条理。以下内容转自博客，格式稍有修改：[huachao1001的简书](http://www.jianshu.com/users/0a7e42698e4b/latest_articles)

---

我的CSDN博客同步发布：在AndroidStudio中自定义Gradle插件

转载请注明出处：【huachao1001的简书：http://www.jianshu.com/users/0a7e42698e4b/latest_articles】

一直都想好好学习AndroidStudio中的gradle，总感觉不懂如何在AndroidStudio中自定义gradle插件的程序员就不是个好程序员，这次上网查了一下相关资料，做了一个总结~

##### 1 创建Gradle Module

AndroidStudio中是没有新建类似Gradle Plugin这样的选项的，那我们如何在AndroidStudio中编写Gradle插件，并打包出来呢？

(1) 首先，你得新建一个Android Project

(2) 然后再新建一个Module，这个Module用于开发Gradle插件，同样，Module里面没有gradle plugin给你选，但是我们只是需要一个“容器”来容纳我们写的插件，因此，你可以随便选择一个Module类型（如Phone&Tablet Module或Android Librarty）,因为接下来一步我们是将里面的大部分内容删除，所以选择哪个类型的Module不重要。

(3) 将Module里面的内容删除，只保留build.gradle文件和src/main目录。由于gradle是基于groovy，因此，我们开发的gradle插件相当于一个groovy项目。所以需要在main目录下新建groovy目录

(4) groovy又是基于Java，因此，接下来创建groovy的过程跟创建java很类似。在groovy新建包名，如：com.hc.plugin，然后在该包下新建groovy文件，通过new->file->MyPlugin.groovy来新建名为MyPlugin的groovy文件。

(5) 为了让我们的groovy类申明为gradle的插件，新建的groovy需要实现org.gradle.api.Plugin接口。如下所示：

    package  com.hc.plugin
    
    import org.gradle.api.Plugin
    import org.gradle.api.Project
    
    public class MyPlugin implements Plugin<Project> {
    
        void apply(Project project) {
            System.out.println("========================");
            System.out.println("hello gradle plugin!");
            System.out.println("========================");
        }
    }

因为我本人对groovy也不是特别熟悉，所以我尽可能的用Java语言，使用System.out.println而不是用groovy的pintln ""，我们的代码里面啥也没做，就打印信息。

(6) 现在，我们已经定义好了自己的gradle插件类，接下来就是告诉gradle，哪一个是我们自定义的插件类，因此，需要在main目录下新建resources目录，然后在resources目录里面再新建META-INF目录，再在META-INF里面新建gradle-plugins目录。最后在gradle-plugins目录里面新建properties文件，注意这个文件的命名，你可以随意取名，但是后面使用这个插件的时候，会用到这个名字。比如，你取名为com.hc.gradle.properties，而在其他build.gradle文件中使用自定义的插件时候则需写成：

    apply plugin: 'com.hc.gradle'
    然后在com.hc.gradle.properties文件里面指明你自定义的类
    
    implementation-class=com.hc.plugin.MyPlugin

现在，你的目录应该如下：

![自定义插件目录结构](https://upload-images.jianshu.io/upload_images/2154124-6984521e8de4c2be?imageMogr2/auto-orient/strip%7CimageView2/2/w/355)

(7) 因为我们要用到groovy以及后面打包要用到maven,所以在我们自定义的Module下的build.gradle需要添加如下代码：

    apply plugin: 'groovy'
    apply plugin: 'maven'
    
    dependencies {
        //gradle sdk
        compile gradleApi()
        //groovy sdk
        compile localGroovy()
    }
    
    repositories {
        mavenCentral()
    }
    
##### 2 打包到本地Maven
前面我们已经自定义好了插件，接下来就是要打包到Maven库里面去了，你可以选择打包到本地，或者是远程服务器中。在我们自定义Module目录下的build.gradle添加如下代码：

    //group和version在后面使用自定义插件的时候会用到
    group='com.hc.plugin'
    version='1.0.0'
    
    uploadArchives {
        repositories {
            mavenDeployer {
                //提交到远程服务器：
               // repository(url: "http://www.xxx.com/repos") {
                //    authentication(userName: "admin", password: "admin")
               // }
               //本地的Maven地址设置为D:/repos
                repository(url: uri('D:/repos'))
            }
        }
    }
    
其中，group和version后面会用到，我们后面再讲。虽然我们已经定义好了打包地址以及打包相关配置，但是还需要我们让这个打包task执行。点击AndroidStudio右侧的gradle工具，如下图所示：

![上传Task](https://upload-images.jianshu.io/upload_images/2154124-dee002020407f413?imageMogr2/auto-orient/strip%7CimageView2/2/w/330)

可以看到有uploadArchives这个Task,双击uploadArchives就会执行打包上传啦！执行完成后，去我们的Maven本地仓库查看一下：

![打包上传后](https://upload-images.jianshu.io/upload_images/2154124-1af199ab6f69db44?imageMogr2/auto-orient/strip%7CimageView2/2/w/648)

其中，com/hc/plugin这几层目录是由我们的group指定，myplugin是模块的名称，1.0.0是版本号（version指定）。

##### 3 使用自定义的插件

接下来就是使用自定义的插件了，一般就是在app这个模块中使用自定义插件，因此在app这个Module的build.gradle文件中，需要指定本地Maven地址、自定义插件的名称以及依赖包名。简而言之，就是在app这个Module的build.gradle文件中后面附加如下代码：

    buildscript {
        repositories {
            maven {//本地Maven仓库地址
                url uri('D:/repos')
            }
        }
        dependencies {
            //格式为-->group:module:version
            classpath 'com.hc.plugin:myplugin:1.0.0'
        }
    }
    //com.hc.gradle为resources/META-INF/gradle-plugins
    //下的properties文件名称
    apply plugin: 'com.hc.gradle'

好啦，接下来就是看看效果啦！先clean project(很重要！),然后再make project.从messages窗口打印如下信息：

![使用自定义插件](https://upload-images.jianshu.io/upload_images/2154124-7a8da12d21022b83?imageMogr2/auto-orient/strip%7CimageView2/2/w/652)

好啦，现在终于运行了自定义的gradle插件啦！

##### 4 开发只针对当前项目的Gradle插件

前面我们讲了如何自定义gradle插件并且打包出去，可能步骤比较多。有时候，你可能并不需要打包出去，只是在这一个项目中使用而已，那么你无需打包这个过程。

只是针对当前项目开发的Gradle插件相对较简单。步骤之前所提到的很类似，只是有几点需要注意：
- 新建的Module名称必须为BuildSrc
- 无需resources目录

目录结构如下所示：

![针对当前项目的gradle插件目录](https://upload-images.jianshu.io/upload_images/2154124-af6974ef3a95646b?imageMogr2/auto-orient/strip%7CimageView2/2/w/276)

其中，build.gradle内容为：

    apply plugin: 'groovy'

    dependencies {
        compile gradleApi()//gradle sdk
        compile localGroovy()//groovy sdk
    }

    repositories {
        jcenter()
    }

SecondPlugin.groovy内容为：

    package  com.hc.second

    import org.gradle.api.Plugin
    import org.gradle.api.Project

    public class SecondPlugin implements Plugin<Project> {

        void apply(Project project) {
            System.out.println("========================");
            System.out.println("这是第二个插件!");
            System.out.println("========================");
        }
    }

在app这个Module中如何使用呢？直接在app的build.gradle下加入

    apply plugin: com.hc.second.SecondPlugin

clean一下，再make project，messages窗口信息如下：

![打印信息](https://upload-images.jianshu.io/upload_images/2154124-65c7313cf2a8343d?imageMogr2/auto-orient/strip%7CimageView2/2/w/513)

由于之前我们自定义的插件我没有在app的build.gradle中删除，所以hello gradle plugin这条信息还会打印.

参考资料：http://kvh.io/cn/tags/EmbraceAndroidStudio/

献上源码：http://download.csdn.net/detail/huachao1001/9565654