# apt 和 apt-get 有什么不同之处？

[TOC]

![图片取自 zoommy](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/1598799435.14SmartPic.png)

在使用 Ubuntu 命令行时，我们会碰到 apt 和 apt-get 命令，这两个命令有什么不同呢？

## apt-get 命令

apt-get 命令可以让我们安装、更新、移除软件包。apt-get 是一个我们可以和 APT（Advanced Package Tool）包管理系统的命令行工具。除此之外，还有 apt-cache、apt-config 命令。

## apt 命令

apt 则是最新添加的一个命令，和 apt-get 的不同点主要有：
1. apt 包含了 apt-get 和 apt-cache 的功能
2. apt 有更多的输出和改进后的设计
3. 同样的功能，apt 的命令语法有不同之处
4. apt 中有两个独特的新功能

### 1. apt 包含了 apt-get 和 apt-cache 的功能

在 Ubuntu 16.05 之前，开发是通过 apt-get、apt-cache、apt-config 命令来和 APT 包管理系统交互的。这些工具提供了很多功能，但是一般来说开发者并没有使用他们提供的所有功能。

因此，Linux 想要创建一个更简单的工具——只具备基本功能即可。这一工具便是 apt，伴随 Ubuntu 16.05 和 Debian 8 发布。

其主要目标是去合并最多使用的 apt-get 和 apt-cache 命令的功能到一个命令下：apt。

### 2. apt 有更多的输出和改进后的设计

`apt update` 命令增加了展示有多少包可以升级的输出，如下图：

![apt update](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/1598798606.59SmartPic.png)

然后你可以使用 `apt list —upgradable` 命令查看可升级的包具体有哪些。这里在设计上作了改进：对于包名做了颜色特殊处理，如下图：

![](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/1598798728.43SmartPic.png)

另外，apt 命令在升级包的时候添加了进度条，让升级进度一目了然。

![](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/1598798745.63SmartPic.png)

### 3. 同样的功能，apt 的命令语法有不同之处

apt 在命令上做了一些调整，和之前的 apt-get、apt-cache 命令的用法有所不同，见下表。


| 功能 | 之前的命令 | apt 命令 | 
| --- | --- | --- | 
| 更新包仓库 | `apt-get update` | `apt update` | 
| 升级包 | `apt-get upgrade` | `apt upgrade` |
| 升级包且移除不必要的依赖 | `apt-get dist-upgrade` | `apt full-upgrade` |
| 安装包 | `apt-get install [package_name]` | `apt install [package_name]` |
| 移除包 | `apt-get remove [package_name]` | `apt-remove [package_name]` |
| 通过配置移除包 | `apt-get purge [package_name]` | `apt purge [package_name]` |
| 移除不必要的依赖 | `apt-get autoremove` | `apt autoremove` |
| 搜索包 | `apt-get search [package_name]` | `apt-get search [package_name]` |
| 展示包信息 | `apt-cache show [package_name]` | `apt show [package_name]` |
| 展示激活的包源 | `apt-cache policy` | `apt policy` |
| 展示已安装包和可用版本 | `apt-cache policy [package_name]` | `apt policy [package_name]` |

### 4. apt 中有两个独特的新功能

apt 中添加了两个新的功能：
1. 编辑包源列表 `apt edit-sources`
2. 列出标准包 `apt list`

## 什么时候使用 apt 而不是 apt-get？

大多数 Linux 用户都建议能用 apt 就用 apt，而不是 apt-get。不仅仅是因为 apt 更容易敲出来和容易记忆，也是因为 apt 执行更快一些。

不管怎么说，使用哪个命令只是习惯问题，尝试去习惯 apt 命令吧。