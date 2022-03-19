# 从 Android 源代码来看『观察者模式』

![图片取自zoommy](https://ws3.sinaimg.cn/large/006tNc79ly1forqo8yiwcj30p00gzjrz.jpg)

这篇文章主要帮助大家理解什么是『观 察者模式』，同时结合Android中ListView和BaseAdapter的源代码来解释一下此模式。

---------------

### 首先，通俗的解释一下什么是『观察者模式』。

>『观察者模式』中有两个角色：老板、员工。
老板可以雇佣和解雇员工，可以命令员工去干活。

根据『观察者模式』的字面意思，很可能误解为：『观察者』在检测到『被观察者』发生变化时，自己做出一定反应。
但是，实际上这个『观察者』很懒，说是『观察者』，其实是等到『被观察者』通知他：『我变身了！』，然后『观察者』做出反应。
所以把『观察者』看作『员工』，『被观察者』看作『老板』更为合适，我们也可以叫它『雇佣者模式』吧！

--------------------------
### 然后，我们结合代码来看看『观察者模式』。
在Android中，包含了对应观察者模式的两个类：**DataSetObserver**和**DataSetObservable**。**DataSetObserver**便是『观察者』，就是『员工』，**DataSetObservable**便是『被观察者』，是『老板』。

**DataSetObserver.Java：**『员工』有两个函数，代表这老板有权利让他干这两种活。因为这里是Android中BaseAdapter要用到的DataSetObserver，所以『员工』只干这两种活。
```
public abstract class DataSetObserver {
    public void onChanged() {  
		// Do nothing    
	}    
  	public void onInvalidated() {        
  		// Do nothing    
  	}
}
```
**DataSetObservable.Java：**『老板』可以让雇佣的所有员工干活。另外继承Observable后，『老板』拥有了Observable的雇佣和解雇『员工』的能力。
```
	public class DataSetObservable extends Observable<DataSetObserver> {
	    public void notifyChanged() {
	        synchronized(mObservers) {
	            for (int i = mObservers.size() - 1; i >= 0; i--) {
	                mObservers.get(i).onChanged();
	            }
	        }
	    }
	    public void notifyInvalidated() {
	        synchronized (mObservers) {
	            for (int i = mObservers.size() - 1; i >= 0; i--) {
	                mObservers.get(i).onInvalidated();
	            }
	        }
	    }
	}
```
**Observable.Class：**『老板』雇佣和解雇『员工』。（实际上是通过ArrayList来保存和移除『员工』的）

	public abstract class Observable<T> {
	    public void registerObserver(T observer) {
	        ...省略代码
	    }
	    public void unregisterObserver(T observer) {
	        ...省略代码
	    }
	}

以上便是Android源代码对『观察者模式』的准备。两个抽象类和一个具体类描述了『员工』可以干的活和『老板』的权利。


### 那Android中ListView和BaseAdapter是如何利用『观察者模式』的呢？

在Android中我们经常要用到 ListView 组件。ListView 是用来显示一列类似的 ItemView 的。而且不同开发者，对 ItemView 的样式的显示效果的要求是不一样的，可谓千种万种。<br />
为此，Android 通过增加 Adapter 层，将 ItemView 的操作都封装到 Adapter 中，然后 ListView 拥有一个Adapter对象，通过调用此对象的接口完成多个 ItemView 的布局。这样来看，Adapter 完成了数据层的操作，ListView 是不用涉及到 ItemView 的数据层的。这种模式其实是『适配器模式』的变种。我们以后再看『适配器模式』。

##### 那当数据发生改变，要更新 UI 的时候怎么办呢？

Android 的做法是，在 Adapter 中添加一个『老板』对象，让 Adapter 拥有『老板』的所有权利。然后在 ListView 中，添加一个『员工』对象（继承 DataSetObserver，在重写父类方法时，更新 UI）。另外在 ListView 的 setAdapter 方法中，将『员工』和『老板』绑定起来，实现『老板』和『员工』的雇佣关系。最后开发者就可以调用 Adapter 的方法，让『老板』命令『员工』干活了！

接下来我们看一下代码实现。<br />
**BaseAdapter.Java：** 拥有DataSetObservable对象，就是说Adapter是『老板』的上司，拥有『老板』的所有权利。
```
	public abstract class BaseAdapter {
	    private final DataSetObservable mDataSetObservable = new DataSetObservable();
	    public void registerDataSetObserver(DataSetObserver observer) {
	        mDataSetObservable.registerObserver(observer);
	    }
	    public void unregisterDataSetObserver(DataSetObserver observer) {
	        mDataSetObservable.unregisterObserver(observer);
	    }
	    public void notifyDataSetChanged() {
	        mDataSetObservable.notifyChanged();
	    }
	    public void notifyDataSetInvalidated() {
	        mDataSetObservable.notifyInvalidated();
	    }
	}
```
**ListView.Java：** setAdapter()方法中，将 AdapterDataSetObserver 注册到 Adapter 的DataSetObservable中，实现『老板』和『员工』的雇佣关系。
```
	public class ListView {
		...代码省略
		@Override
	    public void setAdapter(ListAdapter adapter) {
	    	...代码省略
	    	mDataSetObserver = new AdapterDataSetObserver();
	    	mAdapter.registerDataSetObserver(mDataSetObserver);
	    	...代码省略
	    }
	    ...代码省略
	}
```
AdapterDataSetObserver 继承了 DataSetObserver，重写父类函数时，进行更新界面的操作。

『观察者模式』实现了对数据和界面的解耦。


以上就是笔者对『观察者模式』的理解了，若有谬误，敬请指出！谢谢！