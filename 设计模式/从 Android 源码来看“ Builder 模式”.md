# 从 Android 源码来看 “Builder 模式”

![图片取自zoomy](http://upload-images.jianshu.io/upload_images/1214187-029d8683ed61b39d.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

本文主要解释什么是Builder模式，及其作用。然后结合 Android 源码来看一下Builder模式的实现。

##### 什么是Builder模式

Build 是构建、建造的意思，Builder 模式又称建造者模式。

Builder模式中包括两个核心元素：产品和建造者。这两者可以比作房屋和砖瓦匠。在建造房屋这个过程中，如果建筑公司直接操作房子，除了要对墙壁的颜色、地板的材质、屋顶的形状作出选择外，还要注意建造房屋时的顺序：先打地基、再垒墙壁、最后封顶等等。记住构建房屋的每一步及其顺序，这对建筑公司来说是十分麻烦的。而如果建筑公司引入砖瓦匠的角色，将构建房子的流程等工作交给砖瓦匠，自己只需告诉砖瓦匠：“我要木质地板、白色的墙壁、红色屋顶”即可，构建房屋所涉及的复杂流程就无需关心。另外，当建造房屋的流程发生变化时，建筑公司仍然只需告诉砖瓦匠：“我要木质地板、白色的墙壁、红色屋顶”，而不需作出任何改变。

由上边的比喻可以看出，Builder模式是将房子本身的设计、表示和房子的构建进行分离。不使用此模式，开发者不仅需要关注一个产品的表示，比如AlertDialog的title、button等界面元素，还要关注构建产品的步骤。更加重要的是，如果建造房屋的流程发生变化，不能够再按照以前构建产品的方式创建产品的话，开发者就不得不修改代码来适配新的构建流程。Builder模式可以解决这些问题，为产品增加Builder角色，将构建过程交给Builder实现，开发者只需关心产品属性的设置即可。

就像建筑公司雇佣砖瓦匠需要发工资一样，使用Builder模式的缺点便是需要为增加的Builder对象分配内存。

##### 源码中的Builder模式

在Android源码中，比较常见的是AlertDialog的使用。代码如下：

```
val builder = AlertDialog.Builder(this)
builder.setMessage("message")
builder.setTitle("title")
...
builder.create().show()
```

以上代码，无论构建AlertDialog的流程如何变化，都无需改动代码。因为构建过程在```builder.create()```方法中，而```create（）```方法相对于开发者来说是隐藏的，无需关心的。唯一变化的是```create()```内部，而这是由Android框架实现的，也就是API发布方进行维护即可。这大大提高了代码的灵活性、可维护性、可扩展性。

AlertDialog的核心代码如下：

```
public class AlertDialog extends AppCompatDialog implements DialogInterface {

    final AlertController mAlert;
    protected AlertDialog(@NonNull Context context) {
        this(context, 0);
    }
    @Override
    public void setTitle(CharSequence title) {
        super.setTitle(title);
        mAlert.setTitle(title);
    }
    
    ...//省略部分类似setTitle()的代码
    
    public static class Builder {
        private final AlertController.AlertParams P;
        private final int mTheme;

        public Builder(@NonNull Context context) {
            this(context, resolveDialogTheme(context, 0));
        }
        
        public Builder setTitle(@Nullable CharSequence title) {
            P.mTitle = title;
            return this;
        }
        
        ...//省略部分类似setTitle()代码
        
        public AlertDialog create() {
            final AlertDialog dialog = new AlertDialog(P.mContext, mTheme);
            P.apply(dialog.mAlert);
            dialog.setCancelable(P.mCancelable);
            
            ...//省略部分代码
            
            return dialog;
        }

        ...//省略部分代码
    }
}
```

Builder 是在 AlertDialog 内部实现的静态类，其主要工作便是通过一系列set方法对 AlertController.AlertParams 对象进行设置，AlertParams类中包含了所有AlertDialog视图属性对应的成员变量，比如mTitle、mMessage等等。然后在```create()```方法中进行AlertDialog的构建。

Builder模式的实现比较简单，但是除了“AlertDialog初始化十分复杂，参数繁多”这种应用场景之外，还可以在以下场景中使用Builder模式：

- 构建产品时，不同构建顺序会对产品产生不同的效果
- 构建产品时，不同构建元素会对产品产生不同的效果
- 相同方法在以不同执行顺序执行时，产生不同结果

##### 总结

Builder模式用于将产品的构建和展示分离。这样开发者就不必知道产品构建细节，只需对产品的外观进行设计、配置即可。无需担心产品构建流程发生变化。其缺点是需要为Builder对象分配内存。但这也是大多数设计模式的共同缺点。