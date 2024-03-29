# Git 入门

### 安装 Git

打开官网 https://git-scm.com/ ， 你可点击对应系统的安装包的下载标识进行下载，然后安装即可。

另外，你还可以通过以下几种方式安装 Git：
- 在 Linux 系统如 CentOS 下，通过 yum 进行安装 ```yum install git``` ；Ubuntu 下通过 apt 进行安装 ```apt-get install git```
- macOS 下你可通过 homebrew 安装 Git ```brew install git```
#### macOS 下安装 git

### 开始使用 Git

首先使用 ```git --version``` 查看一下你安装 git 的版本。
本文中的一些 Git 命令基于 macOS，Git 版本 2.17.1。

#### 配置全局变量

我们需要配置一些 Git 需要的变量，该全局变量会存储在 ~/.gitconfig 或者 /etc/gitconfig 文件中。

配置用户名和邮箱：
git config --global user.name "Your name"
git config --global user.email ***@**.com

因为有时我们需要经常对 Git 进行操作，所以可以通过设置 Git 命令别名来加快我们操作 Git 的速度：
如果你希望该电脑的所有用户都可以使用配置的命令别名，你可以如下设置将 status 的别名设置为 st，以后运行 git st 即代表 git status ：sudo git config  --system alias.st status。如果只想给当前用户添加命令别名，可进行如下设置：git config --global alias.st status

开启 Git 颜色展示：
git config --global color.ui true

#### 开启 Git 之旅

我们这里使用 GitExample 文件夹为例。假设我们现在处于该目录下，运行 git init 命令即可初始化一个 Git 仓库。