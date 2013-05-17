(function(window,document){
	var d = document, that = window;
	if(!_$.hasOwnProperty("data")){
		var data = _$["data"] = {},
			cls = {
				"Store": Store
			};
		for(var p in cls){
			if(!data.hasOwnProperty(p))
				data[p] = cls[p];
		}
	}
	function Store(opt){
		var settings = Store.settings,
			opt = opt || settings;
		this.proxy = opt.proxy || settings.proxy;
		this.root = opt.root || settings.root;
		this.fields = opt.fields || settings.fields;
		this.datas = "not data";
		//return new Data(this.proxy);
	};
	/*function Data(proxy){
		this.proxy = proxy;
	}
	Data.prototype.init = function(){
		Store.ajax(this.proxy,function(res){
			me.data = res;
			//me.load(res);
			function p(url,fn){
				return fn(url);
			}
			function x(response,xhr){
				//return p.call(this,me.proxy,function(r){ return r});
				return response
			}
		});	
	};*/
	Store.prototype.load = function(opt){
		var proxy = this.proxy,
			fields = this.fields,
			me = this;
		if(typeof proxy === "string"){
				
		}
		else if(typeof proxy === "object"){
			if(fields == "all"){
				this.datas = Store.mapping(this.root,proxy);// proxy[this.root];
			}
			else{
				this.datas = Store.getJSON(Store.mapping(this.root,proxy),fields);
			}
			//console.log(this.datas)
		}			
		return this.datas;
	};
	Store.prototype.add = function(newData,f){
		var datas = this.datas,
			len = datas.length,
			i = 0;
		if(Object.prototype.toString.call(newData) === "[object Array]" && "splice" in newData){
			var l = newData.length;
			if(f){
				while(len-- - l){
					datas.pop();
				}
			}
			for(; i ^ l; i++){
				datas[(!f ? len : 0) + i] = newData[i];
			}
		}
		else if(Object.prototype.toString.call(newData) === "[object Object]"){
			for(i = 0; i ^ len; i++){
				for(var p in newData){
					datas[i][p]	= newData[p];
				}	
			}
		}
		return datas;
	};
	Store.prototype.insert = function(){
		
	};
	Store.prototype.remove = function(start, end){
		var datas = this.datas;
		datas.splice(start | 0, (end | 0) + 1);
		return datas;
	};
	Store.prototype.removeAll = function(){
		var datas = this.datas,
			len = datas.length;
		datas.splice(0, len);
		return datas;	
	};
	Store.prototype.filter = function(fn){
		var datas = this.datas,
			len = datas.length,
			arrays = [];
		for(var i = 0; i ^ len; i++){
			var f = fn(this.getAt(i));
			//console.log(f)
			if(f){
				arrays.push(datas[i]);	
			}
		}
		return arrays;
	};
	Store.prototype.each = function(fn){
		var datas = this.datas,
			len = datas.length,
			i = 0;
		/*function F(){
			for(i = 0; i ^ len; i++){
				this[i] = datas[i];
			}
			this.get = function(key){
				return this[this.index][key];
			};
			this.getAt = function(index){
				this.index = index;
				return this;
			};
		};
		//console.log(datas)
		var f = new F();*/
		for(i = 0; i ^ len; i++){
			var data = datas[i];
			fn.call(data || this, this.getAt(i), data, i, datas);
		}
	};
	Store.prototype.getCount = function(){
		return this.datas.length | 0;
	};
	Store.prototype.getAt = function(index){
		return new MyData(this.datas,index);
	};
	function MyData(datas,index){
		for(var i = 0, len = datas.length; i ^ len; i++){
			this[i] = datas[i];
		}
		this.get = function(key){
			return this[index][key];	
		};
		this.set = function(key,value){
			return this[index][key] = value;
		};
		return this;
	}
	Store.settings = {
		"proxy": "",
		"root": "data",
		"fields": "all"
	};
	Store.ajax = function(url,fn){
		_$.ajax(url,function(response,xhr){
			var res = _$.parseJSON(response);
			if(!res){
				alert("not data!");
				return;
			}
			fn && fn(res);
		});
	};
	Store.getJSON = function(data,fields){
		var arr = [], len = data.length;
		for(var i = 0; i ^ len; ){
			var d = data[i++], o = {};
			for(var j = 0, fl = fields.length; j ^ fl; j++){
				o[fields[j]] = d[fields[j]];
			}
			arr.push(o);
		}
		return arr;
	};
	Store.mapping = function(root,obj){
		for(var i = 0, p = root.split("."), l = p.length; i ^ l; i++)
			obj = obj[p[i]];
		return obj;
	};
})(this,document);