# Android 四大组件 1：Activity

![Activity相关会问些什么](http://upload-images.jianshu.io/upload_images/1214187-1a8e4fe137b26455.jpeg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

本文包括以下内容（针对Android面试，部分细节略去）：

1. Activity生命周期
2. Activity四种启动模式及其应用场景
3. IntentFilter匹配规则  

（Activity和Fragment、Service交互会在其他文章中写到）

## 1. Activity生命周期

![ Activity生命周期](http://upload-images.jianshu.io/upload_images/1214187-2e8c745b7fea7541.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

onStart、onStop代表着应用是否可见  
onResume、onPause代表应用是否在前台

启动A: onCreate -> onStart -> onResume  
A启动B：A.onPause -> A.onStop （如果B采用透明主题，则A.onStop不会调用）  
启动B后，返回A：onRestart -> onStart -> onResume  
back键：onPause -> onStop -> onDestroy  
A启动B，A的onPause执行之后，B才启动。在onPause之中做轻量级工作，能加快B的启动速度

onSaveInstanceState（onStop之前调用，和onPause没有必然的先后顺序）  
onRestoreInstanceState（onStart之后调用，和onResume没有必然的先后顺序）  
以上两个方法调用条件：  

- 应用被杀死  
- 配置改变（比如手机方向，添加android:configChanged属性后不会触发，会调用onConfiguration函数）  
- Home键、启动新Activity（单独触发onSaveInstanceState）

## 2. Activity启动模式

四种模式可根据字面意思理解，不过还要注意一些细节

- standard 标准模式：
  - 每次启动会创建一个新的Activity
  - A启动B，B会位于A的栈中
  - 默认的启动模式
- singleTop 栈顶复用模式
  - 要启动的Activity在栈顶则直接使用，不创建新的Activity
  - 第二次启动在栈顶，会调用onNewIntent、onResume方法，onCreate、onStart不会调用
- singleTask 栈内复用模式
  - 要启动的Activity在栈内则直接使用，不创建新的Activity
  - 第二次启动在栈顶，会调用onNewIntent、onResume方法，onCreate、onStart不会调用
  - 可通过TaskAffinity属性指定要启动的Activity将位于的栈名
  - 具有clearTop效果：在栈内，要启动的A之上有B、C，会让B、C出栈，然后复用A
- singleInstance 单一实例模式
  - 要启动的Activity会新建一个栈，并且此Activity会独占这个栈
  
注：可以使用 adb shell dumpsys Activity 查看Activity栈信息，来分析Activity启动时栈的情况

应用场景

- standard：Activity默认模式，一般Activity都用这个
- singleTop：当外界多次跳转到一个页面是可以使用这个模式，比如从一些下拉栏通知界面点击进入一个页面的情景，避免了因为多次启动导致的需要返回多次的情况
- singleTask：可用于应用的主界面，比如浏览器主页，外界多次启动时不会受子页面干扰，clearTop效果也会清楚主页面之上的页面
- singleInstance：可用于和程序分离的页面，比如通话页面、闹铃提醒页面

注：在A -> B -> C 时，B不要采用singleInstance，否则，退出再打开时，会是B页面（此属性未验证）

## 3. IntentFilter匹配规则

Intent隐式启动的三个属性：action、category、data  

匹配规则  
action：代码中有一个及以上与“xml过滤规则”中的相同即可  
category：代码中所有的必须与“xml过滤规则”中的相同  
data：同action

注：  
代码中隐式启动时，会默认添加android.intent.category.DEFAULT，所以xml必须含有此属性才能隐式启动  
Service尽量采用显示启动