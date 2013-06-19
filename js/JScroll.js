(function(){
	var utils = (function () {
		var me = {};

		var _elementStyle = document.createElement('div').style;
		var _vendor = (function () {
			var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
				transform,
				i = 0,
				l = vendors.length;

			for ( ; i < l; i++ ) {
				transform = vendors[i] + 'ransform';
				if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
			}

			return false;
		})();

		function _prefixStyle (style) {
			if ( _vendor === false ) return false;
			if ( _vendor === '' ) return style;
			return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
		}


		me.extend = function (target, obj) {
			for ( var i in obj ) {
				target[i] = obj[i];
			}
		};
		var _transform = _prefixStyle('transform');
		me.extend(me, {
			hasTransform: _transform !== false,
			hasPerspective: _prefixStyle('perspective') in _elementStyle,
			hasTouch: 'ontouchstart' in window,
			hasPointer: navigator.msPointerEnabled,
			hasTransition: _prefixStyle('transition') in _elementStyle
		});
		me.extend(me.style = {}, {
			transform: _transform,
			transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
			transitionDuration: _prefixStyle('transitionDuration'),
			transformOrigin: _prefixStyle('transformOrigin')
		});
		return me;
	})();
	var SCommon = {
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
				return SCommon.getParent(target.parentNode,tag);
			}
		}
	}
	var JScroll = function(params){
		var _this = this;
		if(!(_this instanceof JScroll)) {
			return new JScroll(params);
		};
		_this.params = params || {};
		_this.wrap = _this.params.wrap || document.getElementById('wrap');
		_this.wrapStyle = _this.wrap.style;
		_this.minusHeight = _this.params.minusHeight || 0; //自定义减去的高度
		_this.moveLimit = _this.params.moveLimit || 200; // 自定义滚动的时候限制高度
		_this.touch = JTouch(_this.wrap);
		_this.eachHeight = 200;//鼠标滚轮一次的长度
		_this.init();
		if(window.addEventListener){
			window.addEventListener('resize',function(){_this.init();},false);
		}else if(window.attachEvent){
			window.attachEvent('onresize',function(){_this.init();});
		};
	};
	JScroll.prototype={
		init : function (start) {
			var _this = this;
			
			_this.isAnimate = false;//判断是否有动画
			_this.tapActive = false; //单击事件是否激活
			_this.handleHash = {}; //事件绑定的哈希表
			_this.disTop = (_this.disTop &&  _this.disTop != 0)?_this.disTop:0; //滚动的距离，变化值
			if(start){
				//是否重新开始,disTop为0
				_this.disTop = 0;
				_this.translate(0); 
			};
			_this.resultTop = 0;//开始或者结束的时候的距离，只在开始结束时改变
			
			/*
				bodyHeight （窗口高度） - wrapHeight (外围容器高度)  = limitHeight (底部临界值)
			*/
			_this.bodyHeight = Math.max(document.body.offsetHeight,document.body.clientHeight);
			_this.wrapHeight = _this.params.childHeight?_this.wrap.getElementsByTagName(_this.params.childHeight)[0].scrollHeight:_this.wrap.scrollHeight ;
			_this.limitHeight =  _this.bodyHeight - _this.wrapHeight - _this.minusHeight;//限制的滚动距离
			
			_this.wrap.style.height = _this.wrapHeight +'px';
			_this.end();
			if(_this.params.initFn){
				_this.params.initFn(_this); //返回该实例化对象
			};
			if(_this.params.showBar){
				//是否显示滚动条
				_this._bar();
			};
			/*
				Touch事件的处理
			*/
			if(_this.params.stopEvent){
				_this.touch.stopEvent();
			}
			_this.touch.on('start',function(){
				_this.tapActive = true;
				_this.stop();
				if(!_this._limit()){
					_this.resultTop = _this.disTop;
				};
			}).on('tap',function(evt,data){
				var target, ret;
				if(_this.tapActive && _this.params.tapFn){
					target = evt.target || evt.srcElement;
					target = SCommon.getParent(target,'li');
					
					if(target && target.className != 'cateName'){
						ret = target.getElementsByTagName('a')[0].getAttribute('href');
						_this.params.tapFn(ret,target);
					};
				}
			}).on('swipe',function(evt,data){
				if(data['direction'] === 'up' || data['direction'] === 'down'){
					_this.move(data['y']);
					if(data['status'] == 'end'){
						
						if(_this.params.prevFn && _this.disTop >= 80){
							//拖拽到顶部然后释放的事件
							_this.params.prevFn('end');
						};
						if(_this.params.nextFn && _this.disTop <= _this.limitHeight - 80){
							//拖拽到底部然后释放的事件
							_this.params.nextFn('end');
						};
						
						_this.end();
					};
				}else if(_this.params.horizontal){
					//是否支持水平拖拽
					_this.params.horizontal(evt,data);
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
			});
		},
		move : function (dis) {
			var _this = this, result = _this.resultTop + dis;
			if(result >= _this.moveLimit){
				result = _this.moveLimit;
			}else if(result <= _this.limitHeight - _this.moveLimit){
				result = _this.limitHeight - _this.moveLimit;
			};
			
			if(_this.params.prevFn){
				//拖拽到顶部的事件
				if(result >= 80){
					_this.params.prevFn('start');//箭头翻转
				}else{
					_this.params.prevFn('back');//箭头翻转回来
				}
			};
			if(_this.params.nextFn){
				//拖拽到底部的事件
				if(result <= _this.limitHeight - 80){
					_this.params.nextFn('start');//箭头翻转
				}else{
					_this.params.nextFn('back');//箭头翻转回来
				};
			};
			
			_this.translate(result); //开始移动
			_this.disTop = result;
			_this._moveFn(); //滚动的时候，回调使用
		},
		run : function (dis,time) {
			var _this, result, t, b, c, d;
			_this = this;
			if(_this.isAnimate){
				return false;
			};
			result = _this.resultTop + dis;
			if(result >= _this.moveLimit){
				result = _this.moveLimit;
				dis = result - _this.resultTop;
			}else if(result <= _this.limitHeight - _this.moveLimit){
				result = _this.limitHeight - _this.moveLimit;
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
					_this._moveFn(); //滚动的时候，回调使用
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
			_this._transform(_this.wrap,0,dis,time);
			
			if(_this.params.showBar){
				_this._barMove(dis,time);
			};
		},
		_bar : function () {
			var _this = this, height, backHeight = _this.bodyHeight - _this.minusHeight;
			_this.percent = backHeight / _this.wrapHeight ;
			height = _this.percent * backHeight;
			if(!_this.Bar){
				_this.Bar = document.createElement('div');
				_this.Bar.className = 'bar';
				_this.wrap.parentNode.appendChild(_this.Bar);
			};
			SCommon.css(_this.Bar,{
				'height' : height + 'px'
			});
		},
		_barMove : function (dis,time) {
			var _this = this, barDis = - dis * _this.percent;
			SCommon.css(_this.Bar,{
				'opacity' : '1',
			});
			_this._transform(_this.Bar,0,barDis,time);
		},
		stop : function () {
			var _this = this;
			if(_this.isAnimate){
				_this.tapActive = false;
				clearTimeout(_this.timer);
				_this.isAnimate = false;
				_this.disTop = _this._getComputedStyle()['y'];
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
			_this._endFn(); //结束的时候回调使用
			
			if(_this.Bar){
				setTimeout(function(){
					SCommon.css(_this.Bar,{
						'opacity' : '0',
						'transitionDuration' : '500ms',
					});
				},500)
			};
			
		},
		_moveFn : function () {
			var _this = this;
			if(_this.params.moveFn){
				//移动过程中有回调函数
				_this.params.moveFn(_this);
			};
		},
		_endFn : function () {
			var _this = this;
			if(_this.params.endFn){
				//移动过程中有回调函数
				_this.params.endFn(_this);
			};
		},
		_transform : function (obj,x,y,time) {
			var _this = this;
			if(SCommon.isWebkit()){
				SCommon.css(obj,{
					'WebkitTransform' : 'translate3d('+x+'px,'+y+'px,0)',
					'WebkitTransitionDuration' : time+'ms',
					'WebkitTransitionTimingFunction':'linear'
				});
			}else{
				SCommon.css(obj,{
					'transform' : 'translate('+x+'px,'+y+'px)',
					'transitionDuration' : time+'ms',
					'transitionTimingFunction':'linear'
				});
			};
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
		},
		_getComputedStyle: function () {
			var matrix = window.getComputedStyle(this.wrap, null), x, y;
			matrix = matrix[utils.style.transform].split(')')[0].split(', ');
			x = +(matrix[12] || matrix[4]);
			y = +(matrix[13] || matrix[5]);
			return { x: x, y: y };
		}
	};
	window.JScroll = JScroll;
})();