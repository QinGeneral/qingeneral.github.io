![](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/1608644603.02SmartPic.png)

[TOC]

## 初期形态

代码管理的最早形态是使用类似现在百度同步盘的方式同步、管理代码。但是代码冲突问题时有发生，只能人工解决。

之后出现了改善工具：
- diff：比较文本文件、目录差异
- patch：相当于 diff 反向操作

```shell
# 生成差异文件
diff -u hello1 hello2 > diff.txt

# 根据 hello1、diff 生成 hello2
cp hello1 hello3
patch hello3 < diff.txt

# 根据 hello2、diff 生成 hello1
cp hello2 hello4
patch -R hello4 < diff.txt
```

Linus 在 1991～2002 年使用 diff、patch 维护 Linux 代码差异。

diff、patch 缺陷：无法处理二进制文件。Git 解决了此问题。

## 开山鼻祖 CVS Concurrent Versions System

> CVS（ConcurrentVersionsSystem）诞生于1985年，是由荷兰阿姆斯特丹 VU 大学的 DickGrune 教授实现的。当时 DickGrune 和两个学生共同开发一个项目，但是三个人的工作时间无法协调到一起，迫切需要一个记录和协同开发的工具软件。于是 DickGrune 通过脚本语言对 RCS（Revision Control System）（一个针对单独文件的版本管理工具）进行封装，设计出有史以来第一个被大规模使用的版本控制工具。
> 
> —— 蒋鑫. Git权威指南 (Chinese Edition) (Kindle 位置 559-562). 机械工业出版社. Kindle 版本. 

CVS 存在的问题：
- 创建 tag、branch 效率低
- tag、branch 分散在 RCS 文件中，不可见
- 缺乏对合并的追踪，会导致重复合并
- 不支持**原子提交**，会导致提交数据不完整

> CVS 成功地为后来的版本控制系统确立了标准，像提交说明（commitlog）、检入（checkin）、检出（checkout）、里程碑（tag）、分支（branch）等概念在CVS中早就已经确立。  
>   
> —— 蒋鑫. Git权威指南 (Chinese Edition) (Kindle 位置 578-579). 机械工业出版社.   

## SVN Subversion

SVN 优化了很多特性，如：
- 实现了原子提交：SVN 不会像 CVS 那样出现文件的部分内容被提交而其余的内容没有被提交的情况
- 全局版本号：和 CVS 每个文件都拥有一个版本号相比，便捷许多
- 文件轻拷贝：里程碑和分支创建速度加快很多

这些优化也使得它在版本控制工具中成为最佳选择之一。但 SVN 本质上是一种集中式版本管理工具，这种版本控制太依赖于服务器，如果服务器出现问题，版本控制将不可用；如果网络较差，提交代码将变得十分漫长。

除了以上集中式版本控制系统固有问题之外，再加上 SVN 本身设计的一些问题，使用其进行版本管理也并存在很多不如意之处。比如：
- 项目文件在版本库中必须按照一定的目录结构进行部署，否则就可能无法建立里程碑和分支
- 创建里程碑和分支会破坏精心设计的授权
- 分支太随意从而导致混乱。SVN 的分支创建非常随意：可以基于 /trunk 目录创建分支，也可以基于其他任何目录创建分支，因此 SVN 很难画出一个有意义的分支图。再加上一次提交可以同时包含针对不同分支的文件变更，使得事情变得更糟

## Git

### BitKeeper 和 Git 由来

BitKeeper 是一种分布式版本控制系统。分布式版本控制系统优势：不要中央版本库，每个人都可以自己本地查看提交日志、提交、创建里程碑和分支、合并分支、回退等操作，而不需要网络连接。

分布式版本控制系统和集中式版本控制系统区别粗略的讲，就像是分封制和郡县制的区别。

假设现在要书写史书，集中式即郡县制，郡县制背后是强大的中央集权，相当于中央的史书绝对权威，各个郡县对史书进行修改后必须上报中央才能生效。距离首都近的城市还好，提交修改十分便捷，如果海南要提交对史书的修改，得数月才能跑到首都，进行修改。要想拉取新的分支，写写野史，必须先上报中央，批准后才能进行。这里的离首都的距离，就相当于网速，任何修改、提交、拉分支必须经过网络和中央仓库交互后才能进行。

分布式则相当于春秋战国时期，诸侯做大，诸侯每个人都有一份史书，都可以在自己的国家进行修改。任何修改的提交，甚至想要创建新的分支，写写野史，也无须上报周天子，在自家就可以完成。想同步到周天子时再派人去周天子那里同步一下即可。

这就是集中式和分布式版本控制系统的根本区别。

> 2005 年发生的一件事最终导致了 Git 的诞生。在 2005 年 4 月，[AndrewTridgell](https://en.wikipedia.org/wiki/Andrew_Tridgell)（即大名鼎鼎的 [**Samba** - Wikipedia](https://en.wikipedia.org/wiki/Samba_(software)) 的作者）试图对 BitKeeper 进行反向工程，以开发一个能与 BitKeeper 交互的开源工具。这激怒了 BitKeeper 软件的所有者 BitMover 公司，要求收回对 Linux 社区免费使用 BitKeeper 的授权。迫不得已，Linus 选择了自己开发一个分布式版本控制工具以替代 BitKeeper。  
>   
> —— 蒋鑫. Git权威指南 (Chinese Edition) (Kindle 位置 663-666). 机械工业出版社. Kindle 版本.   

### 基本知识

- 工作区 `Workspace`
- 暂存区 `Index/Stage`
- 仓库 `Repository`
- 远程仓库 `Remote`

![](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/1608622204.07SmartPic.png)

### 目录结构

```shell
mkdir demo
cd demo
git init
ls -l .git

# output
# 
# config
# description
# HEAD
# hooks/
# info/
# objects/
# refs/
```

- `description` 文件仅供 GitWeb 程序使用，我们无需关心
- `config` 文件包含项目特有的配置选项
- `info` 目录包含一个全局性排除（global exclude）文件， 用以放置那些不希望被记录在 .gitignore 文件中的忽略模式（ignored patterns）
- `hooks` 目录包含客户端或服务端的钩子脚本（hook scripts）

剩下的四个文件很重要，是 `Git` 的核心组成部分：
- `HEAD` 文件：指向目前被检出的分支
- `index` 文件：保存暂存区信息
- `objects` 目录：存储所有数据内容
- `refs` 目录：存储指向数据（分支 `heads`、远程仓库 `remotes/origin` 和标签 `tags` 等）的提交对象的指针

接下来通过拆解 `git add`、`git commit`、`git checkout` 命令，结合 `HEAD`、`refs/heads/master`、`objects/` 文件变化，探索一下 Git 的背后。

### 实践操作
#### `git checkout` : HEAD

```shell
cat .git/HEAD
# output
# ref: refs/heads/master

git checkout -b test

cat .git/HEAD
# output
# ref: refs/heads/test
```

#### `git add filename` : 工作区文件添加到暂存区

```shell

# 生成 object
git hash-object -w filename

# 添加到暂存区
git update-index --add filename

# 上述两个命令相当于
git add filename
```

```shell
# 查看暂存区
git ls-files --stage

# 上述命令相当于
git status
```

#### `git commit` : 将暂存区文件提交

```shell

# 保存当前目录结构
git write-tree

# 保存快照 commit，-p 可指定父快照
echo "first commit" | git commit-tree 90f3b20385d2b20cf85477a65e4ef7e2eff71353 [-p id]

# git log 无内容，因为当前 HEAD 没有绑定到刚刚提交的快照
git log

# HEAD 对应 refs/head/master，将快照 id 放到该文件即可
echo 785f188674ef3c6ddc5b516307884e1d551f53ca > .git/refs/heads/master

git log

# 以上命令相当于
git commit -m "first commit"
```

### 总结

#### `objects/` 中的对象类型

- `blob`: `git hash-object` 生成的为 `blob object`。命名取自文件的 SHA-1 值
- `tree`: `wirte-tree` 生成的是 `tree object`。该对象将多个文件组织到一起
- `commit`: `commit-tree` 生成的是 `commit object`。该对象表示一次 commit。

tree 对象相当于 Linux 中的目录，blob 对象相当于 Linux 中的文件。tree 和 blob 关系如下图：

![](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/1608626786.26SmartPic.png)


`refs/heads/master` 和 `.git/objects` 各个类型对象之间的关系：

![](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/1608622360.52SmartPic.png)

- 灰色为 `refs/heads/master` 文件
- 绿色为 `.git/objects/` 中的 `commit object` 文件
- 紫色为 `.git/objects/` 中的 `tree object` 文件
- 红色为 `.git/objects/` 中的 `blob object` 文件

#### 命令拆解与文件转换关系

![](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/1608628789.46SmartPic.png)

##### `git checkout -b test`

`git checkout` 切换分支，本质上是对 `HEAD` 文件的内容修改，令其指向 `refs/` 中的不同文件。

##### `git add`

`git add` 分为两步：
1. 将工作区中的文件转为 `objects/` 中的 blob 对象，并以 SHA1 命名
2. 将该对象的 SHA1 记录到 `index` 文件中

##### `git commit`

`git commit` 分为三步：
1. 根据 `index` 中的记录，生成 `objects/` 中的 tree 对象
2. 根据生成的 tree 对象创建 commit 对象
3. 把 commit 对象的 SHA1 放入 `refs/heads/master`

#### `HEAD`、`refs/heads/master`、`objects/` 关系

![](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/1608628811.32SmartPic.png)

- `HEAD` 指向 `refs/` 中的文件
- `refs/` 中的文件都是存有某个 commit 对象的 id
- commit 对象文件中存有 tree 对象的 id、提交作者、提交日志
- tree 对象中存有其下的 blob 对象、tree 对象 id 列表和对应文件名
- blob 对象中则存有对应文件的内容

## 问题

### Git 是保存差异吗？

经过实践操作和搜索发现，Git 每次修改文件都会生成一份完整的 blob 文件，而非保存差异。只是会在和远程仓库交互的时候，会进行压缩和差异处理来决定上传差异文件还是完整的文件。

就是说平常 Git 存储的完整文件——松散 loose 对象格式，但是 Git 会时不时对这些文件进行打包，删除原始文件，当向远程服务器推送的时候也会执行这个操作。自己可以执行 git gc 主动触发这一操作。

详细解答可以看：[Git 内部原理 - 包文件](https://git-scm.com/book/zh/v2/Git-%E5%86%85%E9%83%A8%E5%8E%9F%E7%90%86-%E5%8C%85%E6%96%87%E4%BB%B6)

## 参考资料
- [常用 Git 命令清单 - 阮一峰的网络日志](https://www.ruanyifeng.com/blog/2015/12/git-cheat-sheet.html)
- [Git教程 - 廖雪峰的官方网站](https://www.liaoxuefeng.com/wiki/896043488029600)
- [Git的诞生 - 简书](https://www.jianshu.com/p/0fbeca3dcecf)
- [Git 原理入门 - 阮一峰的网络日志](http://www.ruanyifeng.com/blog/2018/10/git-internals.html)
- [How does git work internally. A Friendly introduction | by Shalitha Suranga | Medium](https://shalithasuranga.medium.com/how-does-git-work-internally-7c36dcb1f2cf)
- [Git - 底层命令与上层命令](https://git-scm.com/book/zh/v2/Git-%E5%86%85%E9%83%A8%E5%8E%9F%E7%90%86-%E5%BA%95%E5%B1%82%E5%91%BD%E4%BB%A4%E4%B8%8E%E4%B8%8A%E5%B1%82%E5%91%BD%E4%BB%A4)
-  [《Git权威指南》 - 豆瓣](https://book.douban.com/subject/6526452/)