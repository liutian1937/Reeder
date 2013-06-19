(function(){
	var Common = {
		isWebkit : function(){
			return (navigator.userAgent.toLowerCase().indexOf('webkit') > 0)?true:false;
		},
		css : function(obj,val){
			for(var attr in val){
				obj.style[attr] = val[attr];
			}
		},
		getParent : function(target,tag){
			if(target.tagName.toLowerCase() === tag){
				return target;
			}else if(target.getElementsByTagName(tag).length > 0){
				return false;
			}else {
				return Common.getParent(target.parentNode,tag);
			}
		}
	};
	var JScroll = function(params){
		var _this = this;
		if(!(_this instanceof JScroll)) {
			return new JScroll(params);
		};
		_this.params = params || {};
		_this.wrap = _this.params.wrap || document.getElementById('wrap');
		_this.callback = _this.params.callback || function(){};
		_this.touch = JTouch(_this.wrap);
		_this.eachHeight = 200;//鼠标滚轮一次的长度
		_this.init();
		window.onresize = function () {
			_this.init();
		};
	};
	JScroll.prototype={
		init : function () {
			var _this = this;
			
			_this.isAnimate = false;//判断是否有动画
			_this.tapActive = false; //单击事件是否激活
			_this.handleHash = {}; //事件绑定的哈希表
			_this.disTop = (_this.disTop &&  _this.disTop != 0)?_this.disTop:0; //滚动的距离，变化值
			
			_this.resultTop = 0;//开始或者结束的时候的距离，只在开始结束时改变
			
			/*
				bodyHeight （窗口高度） - wrapHeight (外围容器高度)  = limitHeight (底部临界值)
			*/
			_this.bodyHeight = Math.max(document.body.offsetHeight,document.body.clientHeight);
			_this.wrapHeight = _this.wrap.scrollHeight;
			_this.limitHeight =  _this.bodyHeight-_this.wrapHeight;//限制的滚动距离
			
			_this.wrap.style.height = _this.wrap.scrollHeight +'px';
			
			_this.nav = new Nav(_this.wrap);//实例化导航变化
			
			_this.nav.scroll(-_this.disTop);
			
			/*
				Touch事件的处理
			*/
			
			_this.touch.on('start',function(){
				_this.tapActive = true;
				_this.stop();
				if(!_this._limit()){
					_this.resultTop = _this.disTop;
				};
			}).on('tap',function(evt,data){
				var target, ret;
				if(_this.tapActive){
					target = evt.target || evt.srcElement;
					target = Common.getParent(target,'li');
					
					if(target && target.className != 'cateName'){
						ret = target.getElementsByTagName('a')[0].getAttribute('href');
						_this.callback(ret,target);
					};
				}
			}).on('swipe',function(evt,data){
				if(data['direction'] === 'up' || data['direction'] === 'down'){
					_this.move(data['y']);
					if(data['status'] == 'end'){
						_this.end();
					};
				}else{
					var target = evt.target || evt.srcElement;
					target = Common.getParent(target,'li');
					
					if(target && target.className != 'cateName'){
						_this.target = target;
						Common.css(target,{
							'WebkitTransform' : 'translate3d('+data['x']+'px,0,0)',
							'WebkitTransitionDuration' : '0ms',
							'WebkitTransitionTimingFunction':'linear'
						});
						if(data['status'] == 'end'){
							Common.css(target,{
							'WebkitTransform' : 'translate3d(0,0,0)',
							'WebkitTransitionDuration' : '100ms',
							'WebkitTransitionTimingFunction':'linear'
							});
							_this.target = null;
						};
					};
					
				}
			}).on('mousewheel',function(evt,data){
				var dis;
				if(!_this._limit()){
					_this.resultTop = _this.disTop;
				};
				
				if(data['direction'] === 'up'){
					if (_this.resultTop === 0){
						return false;
					}else if(_this.resultTop + _this.eachHeight > 0){
						dis = -_this.resultTop;
					}else {
						dis = _this.eachHeight;
					}
				}else{
					if (_this.resultTop === _this.limitHeight){
						return false;
					}else if(_this.resultTop - _this.eachHeight < _this.limitHeight){
						dis = _this.limitHeight - _this.resultTop;
					}else {
						dis = -_this.eachHeight;
					}
				};
				
				_this.run(dis,100);
			}).on('flick',function(evt,data){
				if(data['direction'] === 'up' || data['direction'] === 'down'){
					var dis,time = data['time']*5;
					if(_this.disTop < _this.limitHeight || _this.disTop > 0){
						return false;
					};
					dis = (data['direction'] === 'up')?-data['speed']*500 : data['speed']*500;
					_this.run(dis,time);
				};
			}).on('end',function(){
				_this.end();
				
				if(_this.target){
					Common.css(_this.target,{
					'WebkitTransform' : 'translate3d(0,0,0)',
					'WebkitTransitionDuration' : '100ms',
					'WebkitTransitionTimingFunction':'linear'
					});
					_this.target = null;
				}
				
			});
		},
		move : function (dis) {
			var _this = this, result = _this.resultTop + dis;
			_this.translate(result); //开始移动
			_this.disTop = result;
			_this.nav.scroll(-_this.disTop);//改变菜单的标题显示
		},
		run : function (dis,time) {
			var _this, result, t, b, c, d;
			_this = this;
			if(_this.isAnimate){
				return false;
			};
			result = _this.resultTop + dis;
			if(result >= 200){
				result = 200;
				dis = result - _this.resultTop;
			}else if(result <= _this.limitHeight - 200){
				result = _this.limitHeight - 200;
				dis = result - _this.resultTop;
			};
			
			t = 0;
			b = _this.resultTop;
			c = dis;
			d = parseInt(time/5,10);
			_this.translate(result,time); //开始移动
			function Run(){
				_this.isAnimate = true;
				_this.disTop = Math.ceil(_this._linear(t,b,c,d));
				if(t<d){
					t++;
					_this.timer = setTimeout(Run,5);
					_this.nav.scroll(-_this.disTop);//改变菜单的标题显示
				}else{
					_this.isAnimate = false;
					_this.disTop = result;
					_this.end();
				};
			};
			Run();
		},
		translate : function (dis,time) {
			var _this = this, dis = parseInt(dis,10), time;
			time = time?parseInt(time,10):0;
			if(Common.isWebkit()){
				Common.css(_this.wrap,{
					'WebkitTransform' : 'translate3d(0,'+dis+'px,0)',
					'WebkitTransitionDuration' : time+'ms',
					'WebkitTransitionTimingFunction':'linear'
				});
			}else{
				Common.css(_this.wrap,{
					'transform' : 'translate(0,'+dis+'px)',
					'transitionDuration' : time+'ms',
					'transitionTimingFunction':'linear'
				});
			}
		},
		stop : function () {
			var _this = this;
			if(_this.isAnimate){
				_this.tapActive = false;
				clearTimeout(_this.timer);
				_this.isAnimate = false;
				_this.translate(_this.disTop);
				_this.end();
			};
		},
		end : function () {
			var _this = this, time;
			if(_this._limit()){
				time = Math.min(Math.abs(_this.disTop),Math.abs(_this.limitHeight-_this.disTop));
				time = time < 300 ? time : 300;
				_this.translate(_this.resultTop,time); //到达边界，反弹效果
			}else{
				_this.resultTop = _this.disTop;
			}
			_this.nav.scroll(-_this.resultTop);
		},
		_limit : function () {
			var _this = this;
			if(_this.disTop < _this.limitHeight){
				_this.resultTop = _this.limitHeight;
				return true;
			}else if(_this.disTop > 0){
				_this.resultTop = 0;
				return true;
			}else {
				return false;
			}
		},
		_linear : function(t,b,c,d){
			return c*t/d + b;
		}
	};
	
	var Nav = function (obj) {
		var _this = this;
		_this.items = obj.getElementsByTagName('ul');//获取子元素ul的数组
		_this.wrapHeight = obj.scrollHeight;
		_this.titleHeight = 50;
		_this.init();
	}
	Nav.prototype = {
		init:function(){
			var _this = this,i = 0, x, y, width, fixed;
			_this.current = 0;//当前滚动到第几个
			_this.length = _this.items.length;//数组长度
			_this.topLimit = []; //建立limit数组
			_this.topY = []; //建立pageY数组
			_this.navObj = [];//缓存导航对象
			_this.cloneObj = [];//缓存导航备份对象
			
			if(document.getElementById('appendItem')){
				fixed = document.getElementById('appendItem');
				fixed.innerHTML = '';
			}else{
				fixed = document.createElement('ul');
				fixed.className = 'item';
				fixed.id = 'appendItem';
				document.body.appendChild(fixed);
			};
			width = _this.items[0].offsetWidth;
			x = _this._pageX(_this.items[_this.length-1].getElementsByTagName('li')[0]);
			Common.css(fixed,{
					'position' : 'fixed',
					'top' : '0px',
					'left': x+'px',
					'width' : width+'px'
			});
			
			for(i; i<_this.length; i += 1){
				y = _this._pageY(_this.items[i]);
				_this.topLimit.push(0);
				_this.topY.push(y);//将每个标题距离顶部的距离加入数组
				if(i > 0){
					_this.topLimit[i-1] = y-_this.titleHeight;
					if(i === _this.length -1){
						_this.topLimit[i] = _this.wrapHeight-_this.titleHeight;
					}
				};
				_this.navObj[i] = _this.items[i].getElementsByTagName('li')[0];
				_this.cloneObj[i] = _this.items[i].getElementsByTagName('li')[0].cloneNode(true);
				_this.cloneObj[i].style.display = 'none';
				fixed.appendChild(_this.cloneObj[i]);
			};
			
			_this.cloneObj[0].style.display = 'block';
			
			console.log(_this.topLimit);//打印limit数组
			
		},
		scroll:function(disTop){
			//处理滚动条的方法
			var _this = this, prev, distance, i = 0;
			if(disTop <= 0){
				_this._changeState(0,'show','top');
				_this._hideFixed();
				return false;
			}
			_this.current = _this._getCurrent(disTop);
			if(_this.current < 0){
				_this.current = 0;
			}else if(_this.current > _this.length){
				_this.current = _this.length;
			};
			
			for(i;i<_this.length;i++){
				if(i > _this.current){
					Common.css(_this.navObj[i],{
						'display' : 'block',
						'top' : '0px',
						'bottom' : 'auto'
					});
				};
			}
			
			if(disTop > _this.topY[_this.current] && disTop < _this.topLimit[_this.current]){
				_this._changeState(_this.current,'hide');				
			}else{
				_this._changeState(_this.current,'show','bottom');
			};
			
		},
		_changeState : function (index,state,position) {
			var _this = this, limit = _this.topLimit[index] - _this.topY[index] , obj = _this.navObj[index], i = 0;
			(state === 'show')?_this._hideFixed(index):_this._hideFixed(index,true);//当需要显示固定的标题的时候，隐藏所以fixed
			state = (state === 'show')?'block':'none';
				
			(position === 'top')?
				Common.css(obj,{
						'display' : state,
						'top' : '0px',
						'bottom' : 'auto'
				}):
				Common.css(obj,{
						'display' : state,
						'top' : 'auto',
						'bottom' : '0px'
				});
		},
		_hideFixed : function(index,showOne){
			var _this = this, i = 0;
			for(i;i<_this.length;i++){
				(i === index && showOne)?
				_this.cloneObj[i].style.display = 'block':
				_this.cloneObj[i].style.display = 'none';
			}
		},
		_getCurrent : function (dis){
			var _this = this, newArray;
			newArray = _this.topY.slice();
			newArray.push(dis);
			newArray.sort(function(a,b){return a-b});
			return newArray.indexOf(dis)-1;
		},
		_pageX:function(elem){
			//获取距离左侧的距离
			return elem.offsetParent?(elem.offsetLeft+this._pageX(elem.offsetParent)):elem.offsetLeft;
		},
		_pageY:function(elem){
			//获取距离顶部的距离
			return elem.offsetParent?(elem.offsetTop+this._pageY(elem.offsetParent)):elem.offsetTop;
		}
	};
	
	window.JScroll = JScroll;
})();