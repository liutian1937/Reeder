/*
	Name: Javascript Common Function
	Link: niumowang.org
	Author: ok8008@yeah.net
*/
Ajax = function(){
    function request(url,opt){
        function fn(){}
        var async   = opt.async !== false,
            method  = opt.method    || 'GET',
            data    = opt.data      || null,
            success = opt.success   || fn,
            failure = opt.failure   || fn;
            method  = method.toUpperCase();
        if(method == 'GET' && data){
            url += (url.indexOf('?') == -1 ? '?' : '&') + data;
            data = null;
        }
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.onreadystatechange = function(){
            _onStateChange(xhr,success,failure);
        };
        xhr.open(method,url,async);
        if(method == 'POST'){
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;');
        }
        xhr.send(data);
        return xhr; 
    }
    function _onStateChange(xhr,success,failure){
        if(xhr.readyState == 4){
            var s = xhr.status;
            if(s>= 200 && s < 300){
                success(xhr);
            }else{
                failure(xhr);
            }
        }else{}
    }
    return {request:request};   
}();

(function(){
	//异步加载图片
	var AsyncImg = function(){
		var _this = this, img ;
		if(!(this instanceof AsyncImg)){
			return new AsyncImg();
		}
		img = new Image();
		_this.img = img;
		if (!-[1,]){
			img.onreadystatechange = function () {
				if (img.readyState == "complete"){
					if(_this.callback){
						_this.callback(_this.img.src);
					}
				}else{
					if(_this.error){
						_this.error();
					};
				}
			};
		} else {
			img.onload = function () {
				if (img.complete == true){
					if(_this.callback){
						_this.callback(_this.img.src);
					}
				};
			};
			img.onerror = function(){
				if(_this.error){
					_this.error();
				};
			};
		};
	};
	AsyncImg.prototype.getUrl = function (url){
		this.img.src = url;
		return this;
	};
	AsyncImg.prototype.callback = function (fn){
		this.callback = fn;
		return this;
	};
	AsyncImg.prototype.error = function (fn){
		this.error = fn;
		return this;
	};
	window.AsyncImg = AsyncImg;
})();

var Common = {
	size : 14,
	lineHeight : 30,
	getId : function (id) {
		return document.getElementById(id) || id;
	},
	hasClass : function (element,value) {
		var reg = new RegExp('(\\s|^)' + value + '(\\s|$)');
		return element.className.match(reg);
	},
	removeClass : function (element,value) {
		if (Common.hasClass(element,value)){
			var reg = new RegExp('(\\s*)' + value + '(\\s*)');
			element.className = element.className.replace(reg, ' ');
		}
	},
	removeAllClass : function (name) {
		var i = 0, len, list = Common.getId('itemWrap').getElementsByTagName('li');
		len = list.length;
		for (i; i<len; i += 1) {
			Common.removeClass(list[i],name);
		};
	},
	siblings : function (direction,className) {
		var i = 0, len, list = Common.getId('itemWrap').getElementsByTagName('li'), ret;
		len = list.length;
		if(direction === 'next'){
			for (i; i<len; i += 1) {
				if(Common.hasClass(list[i],className)){
					ret = i + 1;
					if(list[ret] && list[ret].className === 'cateName'){
						ret += 1;
					};
					if(list[ret]){
						Common.removeClass(list[i],className);
						Common.addClass(list[ret],className);
						return list[ret];
					}else{
						return false;
					};
					return false;
				};
			};
		}else{
			for (i; i<len; i += 1) {
				if(Common.hasClass(list[i],className)){
					ret = i-1;
					if(list[ret] && list[ret].className === 'cateName'){
						ret -= 1;
					};
					if(list[ret]){
						Common.removeClass(list[i],className);
						Common.addClass(list[ret],className);
						return list[ret];
					}else{
						return false;
					};
					return false;
				};
			};
		}
	},
	addClass : function (element,value) {
		if(!element.className){
			element.className = value;
		}else{
			if (!Common.hasClass(element,value)){
				var oValue = element.className;
				oValue += " ";
				oValue += value;
				element.className = oValue;
			};
		}
	},
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
	},
	pageY:function(elem){
		//获取距离顶部的距离
		return elem.offsetParent?(elem.offsetTop+Common.pageY(elem.offsetParent)):elem.offsetTop;
	},
	transform : function (obj,x,y,time) {
		var _this = this;
		if(Common.isWebkit()){
			Common.css(obj,{
				'WebkitTransform' : 'translate3d('+x+'px,'+y+'px,0)',
				'WebkitTransitionDuration' : time+'ms',
				'WebkitTransitionTimingFunction':'linear'
			});
		}else{
			Common.css(obj,{
				'transform' : 'translate('+x+'px,'+y+'px)',
				'transitionDuration' : time+'ms',
				'transitionTimingFunction':'linear'
			});
		};
	},
	next : function () {
		//左侧，显示下一条
		var obj = Common.siblings('next','cur');
		var distance = Common.pageY(obj)+JLeft.disTop;
		if(distance < 120 ){
			distance = -distance + JLeft.bodyHeight/2;
			JLeft.run(distance,120);
		}else if(distance > JLeft.bodyHeight){
			distance = -distance + JLeft.bodyHeight/2;
			JLeft.run(distance,120);
		}else{
			JLeft.run(-120,120);
		}
	},
	prev : function () {
		//左侧，显示上一条
		var obj = Common.siblings('prev','cur');
		var distance = Common.pageY(obj)+JLeft.disTop;
		if(distance < 120 ){
			distance = -distance + JLeft.bodyHeight/2;
			JLeft.run(distance,120);
		}else if(distance > JLeft.bodyHeight){
			distance = -distance + JLeft.bodyHeight/2;
			JLeft.run(distance,120);
		}else{
			JLeft.run(120,120);
		}
	},
	fontSize : function(type) {
		var wrap = Common.getId('postWrap').getElementsByTagName('section')[0];
		switch (type){
			case 'plus' : 
				Common.size = (Common.size >= 20)? 20 : Common.size + 2;
				Common.lineHeight = (Common.lineHeight >= 42)? 42 : Common.lineHeight + 4;
				break;
			case 'minus' : 
				Common.size = (Common.size <= 14)? 14 : Common.size - 2;
				Common.lineHeight = (Common.lineHeight <= 30)? 30 : Common.lineHeight - 4;
				break;
			case 'back' : 
				Common.size = 14;
				Common.lineHeight = 30;
				break;
			case 'keep' :
				break;
		}
		Common.css(wrap,{
			'font-size' : Common.size/10 +'rem',
			'line-height': Common.lineHeight+'px'
		});
		JRight.init();//初始化JRight
	}
};