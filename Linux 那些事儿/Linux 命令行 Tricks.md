![知识是网状的](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/1605566598.07SmartPic.png)

最近老弟说要上手 Linux，所以借此机会简单介绍几个 Linux 的命令。用 Linux 大多数时候，简单来说，我们是指的终端命令行的操作。接下来我就说几个比较便捷、简单、有趣的操作。

> 本文只针对入门级，老鸟请绕道。  

## 1. `cd -`
我们都知道 `cd [dir]` 是进入某个目录，`cd ..` 是返回上一层目录。但是当我们进入了很深层级的目录的时候，想返回之前目录就可能执行多次 `cd ..`，此时我们可以使用 `cd -` 命令直接返回上一次所在的目录。

## 2. `cd`
在任何目录下，执行 `cd` 都可以返回到 home 目录。等价于 `cd ~/`。

## 3. `!!`
当我们执行一条很长的命令，但是执行结果表示需要更高的权限——root——时，这个时候是不是很沮丧？

有了 `!!` 命令，此时直接输入 `sudo !!` 即可。`!!` 会自动被上次输入的命令所替代。

## 4. 命令输入历史搜索
我们都知道 `Ctrl + P` 和 `Ctrl + N` 可以上下切换之前、之后输入的命令。但是当我们输入一个命令是很久之前，这个方法就不够有效了。

此时可以键入 `Ctrl + R`，然后输入你印象中的命令关键字，相关的命令就会出现了。这样是不是更加高效呢？

## 5. 复制、粘贴
在 Windows 上，我们通常用 `Ctrl + C` 和 `Ctrl + V` 进行内容的复制和粘贴，但是在 Linux 终端中我们发现这个行不通了。因为 `Ctrl + C` 被用来终止当前运行程序。那如何在 Linux 终端进行复制和粘贴呢？

答案是 `Ctrl + Shift + C` 和 `Ctrl + Shfit + V`。

## 6. `nohup`
当我们执行一个耗时的命令时，此时该命令正在占用我们的终端。我们如果不小心把命令行关掉，该命令的执行也就半途而废。哪有什么办法可以解决这个问题呢？

那就是 `nohup`。在你要执行的命令前添加 `nohup`，该命令就会在后台执行，其输出结果会写入到 `nohup.out` 文件中。

## 7. `screenfetch`
`screenfetch` 可以让我们在命令行查看当前系统信息，你可能需要执行以下命令安装该工具。

```shell
sudo apt install screenfetch
```

![](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/1605566142.31SmartPic.png)

## 8. `cowsay`
如果写代码写累了，你可以和你的牛🐮️说说话。

```shell
# install
sudo apt install cowsay

# talk
echo "hi" | cowsay
```

![](https://blog-pic-1251295613.cos.ap-guangzhou.myqcloud.com/1605566166.32SmartPic.png)

> `echo “hi” | cowsay` 这里用到了“管道”，一个强大的功能，感兴趣的话去探索一下吧。  

## 资源
内容由浅入深，根据自己情况按需阅读。

- [Linux 教程_w3cschool](https://www.w3cschool.cn/linux/)
- [鸟哥的 Linux 私房菜](https://book.douban.com/subject/4889838/)
- 《Linux 程序设计》
- 《UNIX 环境高级编程》
- 《深入 Linux 内核架构》

## 参考资料
[15 Essential Linux Command Line Tips and Tricks | by Michael Krasnov | Better Programming | Medium](https://medium.com/better-programming/15-essential-linux-command-line-tips-and-tricks-95e2bfa2890f)