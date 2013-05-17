(function(window,document){
	var d = document, that = window;
	if(!_$["Waterfall"])
		_$["Waterfall"] = Waterfall;
	function Waterfall(opt){
		//opt.container.style.position = "relative";
		this.container = opt.container;
		this.columnWidth = opt.columnWidth;
		this.columnCount = opt.columnCount;
		this.items = opt.items;
		this.create(this);
		return this;
	};
	Waterfall.prototype.create = function(self){
		var a = this.load;
		a(self);
		_$.addEvent(that,"scroll",function(){
			a(self);
		},0);
	};
	Waterfall.prototype.load = function(factory){
		var scrollHeight = d.body.scrollHeight,
			screenHeight = d.documentElement.clientHeight,
			docHeight = d.documentElement.scrollTop + d.body.scrollTop,
			load;
		if(docHeight + screenHeight + 30 >= scrollHeight && !load){
			//console.log("loading>>>>>")
			//_$.ajax("http://192.168.1.108:8080/test/getPics.action",function(response){
			_$.ajax("waterfall.jsp?page=1",function(response){
				var data = _$.parseJSON(response);
				load = 1;
				new Mason(factory,data).create(factory).layout(factory,_$(factory.items).nodes);
			});
		}
	};
	Waterfall.prototype.reLayout=function(){
		var self = this;
		_$.addEvent(that,"resize",function(){
			new Mason(self).layout(self,_$(self.items).nodes)
		},0);
	};
	function Mason(factory,data){
		this.data = data;
		console.log(data);
		//this.create(factory);
		//this.layout(factory,_$(".item").nodes);
	}
	Mason.settings={
			
	};
	Mason.prototype={
		create: function(factory){
			var data = this.data;
			for(var i = 0, len = data.length; i < len; i++){
				var item = _$(factory.items).nodes[0].cloneNode(1),
					image = item.getElementsByTagName("img")[0];
				_$.addClass(item,"item");
				image.src = data[i].src;
				item.getElementsByTagName("p")[0].innerHTML = data[i].src;
				image.height = data[i].height;
				factory.container.appendChild(item);
			}
			return this;
		},
		layout: function(factory,items){
			var colHeight = [],
				colIndex = [],
				len = items.length,
				spaceHeight = parseInt(_$.getStyle(items[0],"marginBottom"), 10) || 10;
			var container = factory.container,
				columnWidth = factory.columnWidth,
				columnCount = factory.columnCount || (~~(container.offsetWidth / columnWidth));
			container.style.position = "relative";
			//container.style.width = columnWidth * columnCount +"px";
			for(var i = 0; i < columnCount; i++)
				colHeight[i] = 0;
			for(var i = 0; i < len; i++){
				items[i].height = items[i].offsetHeight + spaceHeight;
				colIndex[i] = i;
			}
			for(var i = 0; i < len; i++){
				var index = this.getIndex(colHeight);
				var item = items[i];
				item.style.position = "absolute";
				//item.style.width = columnWidth + "px";
				item.style.left = index * columnWidth + "px";
				item.style.top = colHeight[index] + "px";
				colHeight[index] += item.height;	
			}
			container.style.height = Math.max.apply({}, colHeight) + "px";
		},
		getIndex: function(arr){
			var len = arr.length,
				temp = arr[0],
				index = 0;
			for(var i = 0; i < len; i++){
				if(temp > arr[i]){
					temp = arr[i];
					index = i;
				}
			}
			return index;
		}
	};
})(this,document);