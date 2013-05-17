/*!
* Numeric Javascript Widget
* Author: flyend
* Contact: flyend@126.com(e-mail), 269644230(qq)
* Date: Tue Jan 08 2013
*/
(function(window,document){
	var d = document, that = window;
	if(!_$.hasOwnProperty("Numeric")){
		_$["Numeric"] = Numeric;
	}
	function Numeric(opt){
		this.numeric = null;
		
		this.create = function(){
			this.numeric = d.createElement("span");
			this.numeric.className = "x-numeric";
			return this.numeric;	
		};
		this.id = function(id){
			this.numeric.setAttribute("id",id);
			return this;
		};
		this.getContext = function(){
			return this.numeric || this.create();
		};
		if(!this.numeric){
			this.numeric = this.create();
		}
		this.unit = opt["element"];
		_$(this.unit).addClass("x-unit");
		this.maximum = opt["maximum"] || 10;
		this.minimum = opt["minimum"] || 0;
		this.increment = opt["increment"] || 1;
		this.index = 1;
		opt["value"] && (this.unit.value = opt["value"] + (this.format = opt["format"] || ""), this.index = opt["value"]);
		this.init(this.unit);
		return this;
	};
	Numeric.prototype.init = function(el,opt){
		this.add = d.createElement("a");
		this.minus = d.createElement("a");
		this.add.href = "javascript:void(0);";
		this.minus.href = "javascript:void(0);";
		this.add.appendChild(d.createTextNode("+"));
		this.minus.appendChild(d.createTextNode("-"));
		this.add.className = "x-numeric-add";
		this.minus.className = "x-numeric-minus";
		var me = this,
			numeric = this.numeric;
		el.parentNode.insertBefore(numeric,el);
		numeric.appendChild(el);
		numeric.appendChild(this.add);
		numeric.appendChild(this.minus);
		_$(this.unit).bind("focus",function(){
			if(!this.ku){
				_$(this).bind("keydown",function(e){
					var e = e || that.event,
						charCode = e.charCode || e.keyCode || e.which,
						reg = new RegExp("^\\d+" + me.format);
					if(charCode == 38){
						if(reg.test(this.value)){
							var value = +me.unit.value.match(/^\d+/).shift();
							me.index = value + me.increment;
							me.calculator(this,me.index);
						}
					}
					else if(charCode == 40){
						if(reg.test(this.value)){
							var value = +me.unit.value.match(/^\d+/).shift();
							me.index = value - me.increment;
							me.calculator(this,me.index);
						}
					}
					//Numeric.selectionRange(this,me.index);
				});
				this.ku = !undefined;	
			}
		});
		_$(this.unit).bind("blur",function(){
			var reg = new RegExp("^\\d+" + me.format);
			if(!reg.test(this.value)){
				this.value = me.index + (me.format || "");	
			}
			if(+this.value.match(/^\d+/) > me.maximum){
				this.value = me.maximum + (me.format || "");
				this.index = me.maximum;
			}
			if(+this.value.match(/^\d+/) < me.minimum){
				this.value = me.minimum + (me.format || "");
				this.index = me.minimum;
			}
		});
		this.bind("click");
	};
	Numeric.prototype.bind = function(type,fn){
		var a = this.add,
			b = this.minus,
			unit = this.unit,
			me = this;
		_$(a).bind(type,function(){
			var value = +me.unit.value.match(/^\d+/).shift();
			me.index = value + me.increment;
			me.calculator(this,me.index);
			Numeric.selectionRange(unit,me.index,fn);
			unit.focus();
		});
		_$(b).bind(type,function(){
			var value = +me.unit.value.match(/^\d+/).shift();
			me.index = value - me.increment;
			me.calculator(this,me.index);
			Numeric.selectionRange(unit,me.index,fn);
			unit.focus();
		});
		return this;
	};
	Numeric.prototype.calculator = function(el,val){
		var unit = this.unit,
			me = this;
		if(me.index > me.maximum){
			unit.value = this.maximum + (this.format || "");
			me.index = me.maximum;
		}
		else if(me.index < me.minimum){
			unit.value = this.minimum + (this.format || "");
			me.index = me.minimum;	
		}
		else{
			unit.value = val + (this.format || "");	
		}
	};
	Numeric.selectionRange = function(el,index,fn){
		if(el.setSelectionRange){
			el.select();
			el.setSelectionRange(0,("" + index).length);
		}
		else if(el.createTextRange){
			var range = el.createTextRange();
			range.moveEnd("character",0);
			range.moveStart("character",0);
			range.collapse(false);
			range.moveStart("character",0);
			range.moveEnd("character",("" + index).length);
			el.select();	
		}
		fn && fn(index);	
	};
})(this,document);