﻿Reeder (Web Version)
=========

<h1>访Reeder界面效果</h1>

<blockquote>
Author : ok8008@yeah.net<br/>
Demo ： http://liutian1937.github.io/Reeder/demo.html<br/>
图片未完全载入会影响效果，现在采用的兼听图片onload的方式，仍旧有不足，求点子
</blockquote>

<img src="http://liutian1937.github.io/Reeder/reeder.jpg" />
<p>一直很欣赏触控手势的代码实现，所以最近折腾了个Javascript触控手势库--<a title="Javascript触屏手势库-JTouch(更新V1.1)" href="http://www.niumowang.org/javascript/jtouch/" target="_blank">JTouch</a>，效果还有诸多不完善之处，苦于硬件设备不完善，针对ie10的兼容性一直没有跟上。在版本更新到1.1的时候，又颠覆了自己的好多想法，代码的改动量上比较大。小的改动随时都会出现，所以也就一直在1.1上改来改去。</p>
<p>Github地址：<a href="https://github.com/liutian1937/Reeder">https://github.com/liutian1937/Reeder</a></p>
<p>Demo地址：<a href="http://liutian1937.github.io/Reeder/demo.html" target="_blank">http://liutian1937.github.io/Reeder/demo.html</a></p>
<p>在改动JTouch的同时一直想要拿它去搞个什么东西，某天仔细研究了Reeder的界面效果，马上被其低调的奢华吸引了。所以决定拿JTouch做个Reeder的web版，当然只是界面的Web版...不过话说，我是想写个php的后端来配合这个界面的...</p>
<p>先说说Reeder是什么东西：</p>
<blockquote><p><strong>《Reeder》</strong>是一款评价极高的谷歌阅读器Google Reader软件，获得了2600多个5星评价。软件简约的UI和强大的功能都是其重要特色。首先，它支持与Google Reader云端同步，支持文件夹分类管理，还可以给RSS条目加星或做注释，还支持条目分享，图片缓存，状态保存等等。在其他服务的关联方面，Reeder还支持Instapaper/ReadItLater，还可以发送给Delicious/Pinbard或Twitter。</p></blockquote>
<h2>想法到产品的进化过程（比较水）</h2>
<p>想必很多人并不关心这个东西，因为我也是这样，来看这个的人肯定喜欢干货（直白的代码更有说服力）。但是我感觉说点这个还是有必要的，本人水平有限，扯淡也一般，所以扯点白话大家就凑合着看一下。首先个人是比较倾向于表现类的开发的，因为当你看到你写出来的东西实现了某个效果的时候是比较有成就感的。对于开发表现类的东西，我总结了个人的一些见解：</p>
<ol>
<li>你要清楚有哪些交互过程，有哪些动画，有哪里是需要用到数据交互的。</li>
<li>根据你的理解将这些东西进行分块，最好越详细越好，然后将这个块再组合起来，看哪些地方是通用的可以用公共的函数，哪些地方是需要单独封装的等等。（我一般会在纸上画这些东西）</li>
<li>这步比较轻松，躺在床上想就行了，至少我喜欢这样。看完第二部的模块之后，我并不会着手写代码，而是会花点时间想，当然经常睡着...</li>
<li>入手写demo，由于每个人水平不同，但是我们的目的是相同的，这一步要求个人根据自己水平写demo，不管用不用模块，用不用封装，不计较代码效率的也要写出表现效果来。（当然别写的你自己都不认识了）</li>
<li>写好demo，重新审查自己的代码，进行优化，简化，封装等等</li>
<li>在感觉自己把第5步做的还算ok了，去google搜索类似的小模块，参考别人的代码，然后完善自己的demo...</li>
</ol>
<h2>代码中用到了哪些东西（部分要点）</h2>
<ol>
<li><span style="line-height: 13px;">手势事件，我用的自己的JTouch库，貌似是多余了一点，因为手势并不多。失败之处，造成耦合。</span></li>
<li>Font Icon，文字小图标，支持将代码转换成小图标，我用的 IconMoon的文字库，<a href="http://icomoon.io/app/">http://icomoon.io/app/</a>（需要现代浏览器支持）</li>
<li>translate实现的动画效果，以及各种高度，宽度，滚动距离的判断，其中的算法给我折腾的很迷糊</li>
<li>兼容性与初始化的问题</li>
<li>异步加载数据，与监听图片完全载入</li>
<li>JTouch鼠标触控手势库，JNav实现的是左侧一直停留在顶部的导航，JScroll是支持手势操作的容器（放出的接口比较乱，请静待注释），Common是一些公共函数</li>
</ol>
<h2>实现的效果</h2>
<ul>
<li><span style="line-height: 13px;">内容与导航部分支持触控手势与鼠标手势</span></li>
<li>左侧导航跟随并滚动到底部静止</li>
<li>左侧控制选择前一篇后一篇</li>
<li>横向拖拽标题导航可以实现简单数据交互</li>
<li>右侧拖拽到顶部或者底部异步加载数据</li>
</ul>
<h2>不足之处</h2>
<ul>
<li><span style="line-height: 13px;">多浏览器兼容性方面</span></li>
<li>性能消耗</li>
<li>图片完全载入的监测</li>
<li>耦合性</li>
<li>...</li>
</ul>


