/*!
* Properties Javascript Widget
* Author: flyend
* Contact: flyend@126.com(e-mail), 269644230(qq)
* Date: Thu Mar  2013
*/
(function(window,document,$){
	$.namespace("_$.widget.Properties");
	var PROPERTIES_NAME = "x-properties",
		PROPERTIES_KEY = PROPERTIES_NAME + "-name",
		PROPERTIES_COMPONENT = PROPERTIES_NAME + "-component",
		PROPERTIES_COMPONENT_OPEN = PROPERTIES_COMPONENT + "-open",
		PROPERTIES_TABLE = PROPERTIES_NAME + "-table",
		PROPERTIES_SHOW = PROPERTIES_NAME + "-show",
		PROPERTIES_TRIGGER = PROPERTIES_NAME + "-trigger";
	$.widget.Properties = Properties;
	function Properties(opt){
		this.properties = null;
		this.toString = function(){
			return "[object Properties]";	
		};
		this.create = function(){
			this.properties = document.createElement("div");
			this.properties.className = PROPERTIES_NAME;
			this.table = document.createElement("table");
			this.table.className = PROPERTIES_TABLE;
			this.properties.appendChild(this.table);
			return this.properties;	
		};
		this.id = function(id){
			id && (this.properties.setAttribute("id",id));
			return this;
		};
		this.getContext = function(){
			return this.properties || this.create();
		};
		if(!this.properties){
			this.properties = this.create();
		}
		document.body.appendChild(this.properties);
		this.init(opt);
	}
	Properties.prototype.init = function(opt){
		this.header = document.createElement("thead");
		this.body = document.createElement("tbody");
		if(opt["title"]){
			this.setHeader(opt);
			this.table.appendChild(this.header);
		}
		if(!opt["content"]){
			this.setContent();	
		}
		this.table.appendChild(this.body);
	};
	Properties.prototype.appendTo = function(el){
		el.appendChild(this.properties || this.getContext());
		return this;
	};
	Properties.prototype.setHeader = function(opt){
		var rows = document.createElement("tr"),
			th = document.createElement("th"),
			title = opt["title"];
		th.className = PROPERTIES_KEY;
		th.appendChild(document.createTextNode(title["name"]));
		rows.appendChild(th);
		th = document.createElement("th");
		th.appendChild(document.createTextNode(title["value"]));
		rows.appendChild(th);
		this.header.appendChild(rows);
		return this;
	};
	Properties.prototype.setContent = function(data){
		var rows,
			cell;
		
		if(!data){
			for(var i = 0; i ^ 5; i++){
				rows = document.createElement("tr");
				for(var j = 0; j ^ 2; j++){
					cell = document.createElement("td");
					rows.appendChild(cell);	
				}
				this.body.appendChild(rows);
			}
		}
		return this;
	};
	Properties.prototype.addAttribute = function(name,value){
		var rows = document.createElement("tr"),
			label = document.createElement("label"),
			cell,
			comp;
		label.appendChild(document.createTextNode(name));
		/*label.onclick = function(){
			
		};*/
		cell = document.createElement("td");
		//cell.onclick = fn;
		cell.appendChild(label);
		rows.appendChild(cell);
		cell = document.createElement("td");
		//cell.onclick = fn;
		if($.isString(value)){
			cell.appendChild(document.createTextNode(value));
		}
		else if($.isObject(value)){
			this.type = value["xtype"];
			cell.appendChild(document.createTextNode(value["text"]));
		}	
		rows.appendChild(cell);
		this.body.appendChild(rows);
		comp = new Component(this);
		comp.addField(cell);
		return this;
	};
	Properties.prototype.removeAttribute = function(){
		
	};
	Properties.prototype.setAttribute = function(){
		
	};
	Properties.prototype.getAttribute = function(){
		
	};
	function Component(what){
		this.component = document.createElement("div");
		this.component.className = PROPERTIES_COMPONENT;
		this.type = what.type;
		what.properties.appendChild(this.component);
	}
	Component.prototype.addField = function(el){
		var field = document.createElement("input"),
			component = this.component,
			offset = $(el).offset(),
			me = this,
			trigger,
			flag = 0;
		this.component.style.left = offset.left + "px";
		this.component.style.top = offset.top - 2 + "px";
		this.component.style.width = el.clientWidth + "px";
		//this.component.style.height = el.clientHeight + "px";
		this.component.appendChild(field);
		if(this.type){
			trigger = document.createElement("div");
			trigger.className = PROPERTIES_TRIGGER;
			this.component.appendChild(trigger);
			
			switch(this.type.toString()){
				case "[object Calendar]":
					console.log(this.type.toString())
					me.component.appendChild(me.type.getContext());
					this.type.bind("click",function(format,el,self){
						field.value = format;
						me.type.getContext().style.display = "none";
						trigger.open = undefined;
					});
				break;
			}
			$(trigger).bind("click",function(){
				if(!this.open){
					//$(me.component).addClass(PROPERTIES_COMPONENT_OPEN);
					this.open = !undefined;
					me.type.getContext().style.display = "block";
				}
				else{
					//$(me.component).removeClass(PROPERTIES_COMPONENT_OPEN);
					me.type.getContext().style.display = "none";
					this.open = undefined;
				}
			});
		}
		this.stacks = component;
		$(el).bind("click",function(){
			me.current(component);
			field.value = this.firstChild.nodeValue;
			field.focus();
			field.select();
			me.doDocument(el,(me.type ? me.type.getContext() : field),PROPERTIES_COMPONENT,{
				"show": function(){},
				"hide": function(){ me.type && (me.type.getContext().style.display = "none", trigger.open = undefined); el.firstChild.nodeValue = field.value; }
			});
		});
		$(field).bind("focus",function(){
			//this.value = el.firstChild.nodeValue;
		});
		$(field).bind("blur",function(){
			//el.firstChild.nodeValue = this.value;
			if(0){
				$(component).removeClass(PROPERTIES_SHOW);
			}
		});
		
	};
	Component.prototype.current = function(el){
		$(el).addClass(PROPERTIES_SHOW);
		if(this.stacks != el){
			$(this.stacks).removeClass(PROPERTIES_SHOW);
			this.stacks = el;
		}
		return{
			"prev": this.stacks,
			"cur": el
		};
	};
	Component.prototype.doDocument = function(te,el,type,o){
		var component = this.component,
			me = this;
		function bind(elem,type,fn,c){
			if(elem.addEventListener){
				elem.addEventListener(type,fn,c);	
			}
			else if(elem.attachEvent){
				elem.attachEvent("on" + type,function(){
					return fn.call(elem || window,window.event);	
				});
			}
			else
				elem["on" + type] = fn;
		}
		//$(document).bind("click",function(e){
		bind(document,"click",function(e){
			var e = e || that.event,
				target = e.target || e.srcElement,
				fn = function(o,c){
					while(o = o.parentNode){
						if(o.className && !!~o.className.indexOf(c))
							return 1;
					}
					return 0;
				};
			if(target == te){
				$(component).addClass(PROPERTIES_SHOW);
				o && o["show"] && o["show"]();
			}
			else if(!fn(target,type)){
				$(component).removeClass(PROPERTIES_SHOW);
				o && o["hide"] && o["hide"]();
			}	
		},0);
	};
})(this,document,_$);