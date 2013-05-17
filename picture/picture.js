/*!
* Picture Identification Javascript Widget
* Author: flyend
* Contact: flyend@126.com(e-mail), 269644230(qq)
* Date: Thu Mar  2013
*/
(function(window,document,$){
	$.namespace("_$.widget.SmartPicture");
	var PICTURE_NAME = "x-picture",
		PICTURE_DRAGGING = PICTURE_NAME + "-dragging",
		PICTURE_EXIT = PICTURE_NAME + "-exit",
		PICTURE_SHOW = PICTURE_NAME + "-show",
		PICTURE_ZOOM = PICTURE_NAME + "-zoom",
		PICTURE_REGION = PICTURE_NAME + "-region",
		PICTURE_EDIT = PICTURE_NAME + "-edit",
		PICTURE_DELETE = PICTURE_NAME + "-delete",
		PICTURE_MOVE = PICTURE_NAME + "-move",
		PICTURE_TAG = PICTURE_NAME + "-tag",
		PICTURE_TAGFACE = PICTURE_NAME + "-face",
		PICTURE_TAGNAME = PICTURE_NAME + "-name",
		PICTURE_ARROE = PICTURE_NAME + "-arrow",
		PICTURE_REGION_RESIZE_LT = PICTURE_REGION + "-lt",
		PICTURE_REGION_RESIZE_RT = PICTURE_REGION + "-rt",
		PICTURE_REGION_RESIZE_LB = PICTURE_REGION + "-lb",
		PICTURE_REGION_RESIZE_RB = PICTURE_REGION + "-rb";
	$.widget.SmartPicture = SmartPicture;
	function SmartPicture(image){
		this.toString = function(){
			return "[object SmartPicture]";	
		};
		this.image = image;
		this.picture = document.createElement("div");
		this.picture.className = PICTURE_NAME;
	}
	var flag = false, dragging = false;
	SmartPicture.prototype.identity = function(opt){
		this.show = true;//开启tag
		this.deletable = opt["deletable"];
		this.tags = {};
		this.length = 0;
		var tags = opt["tags"],	tag, me = this;
		this.image.onload = function(){
			var offset = $(this).offset(),
				t,
				o;
			//alert(offset["left"] - 30//margin bug)
			$(me.picture).css({"width": me.image.offsetWidth + "px", "height": me.image.offsetHeight + "px", "left": offset["left"] + "px", "top": offset["top"] + "px"});
			for(var i = 0; i ^ tags.length; i++){
				tag = tags[i];
				o = {
					"width": tag["width"] || 5,
					"height": tag["height"] || 5,
					"x": tag["x"] | 0,
					"y": tag["y"] | 0,
					"text": tag["text"]
				};
				t = me.addTag(document.createTextNode(tag["text"]),o);
				t.data = o;
			}
			document.body.appendChild(me.picture);
			/*me.picture.onmouseover = function(){alert(9)}*/
		};
		this.image.src = this.image.src;
		/*this.image.onmouseover = function(){
			//picture.style.display = "block";
			return false;
		};*/
	};
	SmartPicture.prototype.addIdentity = function(opt){
		var p = new SmartPictureUI(this),
			r = new Region(),
			me = this;
		this.zoom = p.zoom();
		this.region = r.region;
		this.exit = p.exit(function(el){
			me.close();
			opt["exit"] && opt["exit"](this);
		});
		this.show = false;//关闭tag
		flag = true;
		function position(el){
			el.style.display = "block";
			el.style.left = (parseInt(me.region.style.left,10) || me.region.offsetLeft) + "px";
			el.style.top = (parseInt(me.region.style.top,10) || me.region.offsetTop) + (parseInt(me.region.style.height,10) || me.region.offsetHeight) + "px";
		}
		r.setDraggable({
			"in": function(){ me.tag.style.display = "none"; },
			"out": function(){
				position(me.tag);
			}	
		});
		p.append(this.exit).append(this.zoom);
		if(!this.tag){
			this.tag = p.photoTag(opt["element"]);
			p.append(this.tag);
		}
		p.move(this.zoom).drag(this.region,{
			"in": function(){
				p.append(me.region);
			},
			"out": function(){
				me.zoom.style.display = "none";
				if(!p.tag){
					p.append(me.tag);
					p.tag = !undefined;
				}
				position(me.tag);
			}
		});
	};
	SmartPicture.prototype.addTag = function(value,opt){
		var tag = document.createElement("div"),
			face = document.createElement("div"),
			name = document.createElement("div"),
			arrow = document.createElement("div"),
			span = document.createElement("span"),
			em = document.createElement("em"),
			me = this;
		arrow.className = PICTURE_ARROE;
		face.className = PICTURE_TAGFACE;
		name.className = PICTURE_TAGNAME;
		tag.className = PICTURE_TAG;
		if(opt){
			opt["width"] && (tag.style.width = opt["width"] + "px");
			opt["x"] && (tag.style.left = opt["x"] + "px");
			opt["y"] && (tag.style.top = opt["y"] + "px");
			opt["height"] && (face.style.height = opt["height"] + "px");
		}
		else{
			$(tag).css({"width": this.region.offsetWidth + "px", "left": this.region.offsetLeft + "px", "top": this.region.offsetTop + "px"});
			face.style.height = this.region.offsetHeight + "px";
		}
		if(this.deletable){
			var del = document.createElement("a");
			del.href = "javascript:void(0);";
			del.className = PICTURE_DELETE;
			del.innerHTML = "X";
			$(del).bind("click",function(){
				var temp = tag;
				me.removeTag(tag);
				me.deletable.call(me,temp,this);
				//temp = null;
			});
			face.appendChild(del);
		}
		//name.innerHTML = value;
		arrow.appendChild(em);
		arrow.appendChild(span);
		name.appendChild(arrow);
		name.appendChild(value);
		tag.appendChild(face);
		tag.appendChild(name);
		this.picture.appendChild(tag);
		tag.onmouseover = function(){
			//if(me.show){
				$(this).addClass(PICTURE_SHOW);
			//}
		};
		tag.onmouseout = function(){
			//if(me.show){
				$(this).removeClass(PICTURE_SHOW);
			//}
		};
		tag.index = this.getTagAll();
		this.tags[tag.index] = tag;
		//console.log(this.tags)
		return tag;
	};
	SmartPicture.prototype.removeTag = function(tag){
		tag.parentNode.removeChild(tag);
		delete this.tags[tag.index];
	};
	SmartPicture.prototype.removeTagAll = function(){
		for(var i in this.tags){
			var tag = this.tags[i];
			tag.parentNode.removeChild(tag);
		}
	};
	SmartPicture.prototype.getTagAll = function(){
		return this.length++;
	};
	SmartPicture.prototype.close = function(){
		this.show = true;//开启tag
		if(this.exit && this.exit.parentNode)
			this.exit.parentNode.removeChild(this.exit);
		if(this.zoom && this.zoom.parentNode)
			this.zoom.parentNode.removeChild(this.zoom);
		if(this.region && this.region.parentNode)
			this.region.parentNode.removeChild(this.region);
		if(this.tag)
			this.tag.style.display = "none";
		flag = false;
		dragging = false;
	};
	SmartPicture.prototype.getWidth = function(){
		return this.image.width || this.image.offsetWidth;
	};
	SmartPicture.prototype.getHeight = function(){
		return this.image.height || this.image.offsetHeight;
	};
	SmartPicture.prototype.getX = function(){
		return this.image.offsetLeft;
	};
	SmartPicture.prototype.getY = function(){
		return this.image.offsetTop;
	};
	/*
	* Draggable
	*/
	function Draggable(e){
		var e = e || window.event;
		this.target = e.target ? e.target : e.srcElement;
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.registerListener = function(f,callback){
			document.onmousemove = f;
			callback && callback();
		};
		this.removeListener = function(f,callback){
			document.onmouseup = function(e){
				document.onmousemove = null;
				document.onmouseup = null;
				callback && callback();
			};
		};
	}
	Draggable.dnd = function(target,moved,o){
		var body = document.body;
		this.registerListener(moved,function(){
			$(body).addClass(PICTURE_DRAGGING);
			body.onselectstart = function(){return true; };
			o && o["in"] && o["in"](target);
			if(target.setCapture){
				target.setCapture();
			}
		});
		this.removeListener(moved,function(){
			if(target.releaseCapture){
				target.releaseCapture();
			}
			$(body).removeClass(PICTURE_DRAGGING);
			body.onselectstart = function(){return false; };
			o && o["out"] && o["out"](target);
		});
	};
	function SmartPictureUI(what){
		this.picture = what.picture;
		//this.flag = what.flag;
	}
	SmartPictureUI.prototype.append = function(el){
		this.picture.appendChild(el);
		return this;
	};
	SmartPictureUI.prototype.exit = function(callback){
		var exit = document.createElement("a");
		exit.href = "javascript:void(0);";
		exit.className = PICTURE_EXIT;
		exit.onclick = function(){
			callback && callback(this);	
		};
		exit.appendChild(document.createTextNode("退出"));
		return exit;
	};
	SmartPictureUI.prototype.zoom = function(){
		var zoom = document.createElement("div");
		zoom.className = PICTURE_ZOOM;
		this.zoom = zoom;
		return zoom;
	};
	SmartPictureUI.prototype.photoTag = function(el){
		var tag  = document.createElement("div"),
			arrow = document.createElement("div"),
			span = document.createElement("span"),
			em = document.createElement("em");
		tag.className = PICTURE_EDIT;
		arrow.className = PICTURE_ARROE;
		//em.appendChild(document.createTextNode("◆"));
		//span.appendChild(document.createTextNode("◆"));
		arrow.appendChild(em);
		arrow.appendChild(span);
		tag.appendChild(arrow);
		tag.appendChild(el);
		return tag;
	};
	SmartPictureUI.prototype.drag = function(el,o){
		var width = this.picture.offsetWidth,
			height = this.picture.offsetHeight,
			left = parseInt(this.picture.style.left,10) || this.picture.offsetLeft,
			top = parseInt(this.picture.style.top,10) || this.picture.offsetTop,
			moved = function(e){
				var e = e || event,
					w = (e.clientX - left + Math.max(document.body.scrollLeft,document.documentElement.scrollLeft)) - location.x,
					h = (e.clientY - top + Math.max(document.body.scrollTop,document.documentElement.scrollTop)) - location.y,
					mw = location.x + w,
					mh = location.y + h;
				if(mw >= width)
					return;
				if(mh >= height)
					return;
				el.style.width = w + "px";
				el.style.height = h + "px";
			},
			location = {};
		this.picture.onmousedown = function(e){
			/*if(e.preventDefault)
				e.preventDefault();*/
			//dragging = true;
			if(flag){
				var e = e || window.event,
					target = e.target || e.srcElement;
				if(target == this){
					location.x = e.clientX - left + Math.max(document.body.scrollLeft,document.documentElement.scrollLeft);
					location.y = e.clientY - top + Math.max(document.body.scrollTop,document.documentElement.scrollTop);
					//alert(Math.max(document.body.scrollTop,document.documentElement.scrollTop));
					Draggable.call(this,e);
					Draggable.dnd.call(this,el,moved,{
						"in": function(a){
							el.style.display = "block";
							el.style.left = location.x + "px";
							el.style.top = location.y + "px";
							o && o["in"] && o["in"]();
						},
						"out": function(a){
							o && o["out"] && o["out"]();
						}
					});
					flag = false;
				}
			}
			return false;
		};
	};
	SmartPictureUI.prototype.move = function(el){
		var width = this.picture.offsetWidth,
			height = this.picture.offsetHeight,
			left = parseInt(this.picture.style.left,10) || this.picture.offsetLeft,
			top = parseInt(this.picture.style.top,10) || this.picture.offsetTop;
		this.picture.onmousemove = function(e){
			if(!dragging){
				var e = e || window.event,
					target = e.target || e.srcElement,
					x = e.clientX - left,
					y = e.clientY - top + Math.max(document.body.scrollTop,document.documentElement.scrollTop);
				if(target == el){
					//zoom
					return;
				}
				if(target == this){
					x += 15;
					y += 15;
					if(x + el.offsetWidth >= width)
						x = width - el.offsetWidth;
					if(y + el.offsetHeight >= height)
						y = height - el.offsetHeight;
					el.style.left = x + "px";
					el.style.top = y + "px";//this
					$(this).addClass(PICTURE_MOVE);
				}
				else{
					$(this).removeClass(PICTURE_MOVE);
				}
			}
		};
		return this;
	};
	/*
	* Region
	*/
	function Region(what){
		this.region = document.createElement("div");
		this.region.className = PICTURE_REGION;
		this.width = 0;
		this.height = 0;
		this.x = 0;
		this.y = 0;
		this.append({"lt": PICTURE_REGION_RESIZE_LT, "lb": PICTURE_REGION_RESIZE_LB, "rt": PICTURE_REGION_RESIZE_RT, "rb": PICTURE_REGION_RESIZE_RB});	
	}
	Region.prototype.append = function(o){
		var region = this.region,
			r;
		for(var i in o){
			r = document.createElement("span");
			r.className = o[i];
			//this.setDraggable(r);
			region.appendChild(r);	
		}
	};
	Region.prototype.setDraggable = function(callback){
		var region = this.region,
			location = {},
			rs = {},
			me = this;
		rs[PICTURE_REGION] = {
			"begin": function(target,e){
				location.x = e.clientX;
				location.left = me.getX();
				location.y = e.clientY;
				location.top = me.getY();
			},
			"moved": function(e){
				var e = e || window.event,
					left = e.clientX - location.x + location.left,
					top = e.clientY - location.y + location.top,
					maxwidth = region.parentNode.offsetWidth,
					maxheight = region.parentNode.offsetHeight;
				if(left + region.offsetWidth >= maxwidth)
					left = maxwidth - region.offsetWidth;
				if(top + region.offsetHeight >= maxheight)
					top = maxheight - region.offsetHeight;
				top <= 0 && (top = 0);
				left <= 0 && (left = 0);
				region.style.left = left + "px";
				region.style.top = top + "px";
			}
		};
		rs[PICTURE_REGION_RESIZE_LT] = {
			"begin": function(target,e){
				var l = parseInt($(region.parentNode).css("left"),10) || region.parentNode.offsetLeft,
					t = parseInt($(region.parentNode).css("top"),10) || region.parentNode.offsetTop;
				location.x = e.clientX - l;
				location.left = target.offsetWidth;
				location.y = e.clientY - t + Math.max(document.body.scrollTop,document.documentElement.scrollTop);
				location.top = target.offsetHeight;
				location.pleft = l;
				location.ptop = t;
			},
			"moved": function(e){
				var e = e || window.event,
					x = e.clientX - location.pleft + Math.max(document.body.scrollLeft,document.documentElement.scrollLeft) - 3,
					y = e.clientY - location.ptop + Math.max(document.body.scrollTop,document.documentElement.scrollTop) - 3,
					width = location.left + location.x - x,
					height = location.top + location.y - y;
				if(x <= 0){
					x = 0;
					return;
				}
				if(y <= 0){
					y = 0;
					return;
				}
				region.style.height = height + "px";
				region.style.width = width + "px";
				region.style.left = x + "px";
				region.style.top = y + "px";
			}
		};
		rs[PICTURE_REGION_RESIZE_RT] = {
			"begin": function(target,e){
				var t = parseInt($(region.parentNode).css("top"),10) || region.parentNode.offsetTop;
				location.x = e.clientX;
				location.width = target.offsetWidth;
				location.y = e.clientY - t + Math.max(document.body.scrollTop,document.documentElement.scrollTop);
				location.height = target.clientHeight;
				location.left = target.offsetLeft;
				location.ptop = t;
			},
			"moved": function(e){
				var e = e || window.event,
					x = e.clientX,
					y = e.clientY - location.ptop + Math.max(document.body.scrollTop,document.documentElement.scrollTop),
					width = x - location.x + location.width,
					height = location.height + location.y - y,
					maxwidth = region.parentNode.offsetWidth;
				if(y <= 0)
					y = 0;
				if(x <= 0)
					x = 0;
				//console.log(location.y - region.offsetHeight)
				if(location.left + width >= maxwidth)
					return;
				region.style.width = width + "px";
				region.style.height = height + "px";
				region.style.top = y + "px";
			}
		};
		rs[PICTURE_REGION_RESIZE_LB] = {
			"begin": function(target,e){
				var l = parseInt($(region.parentNode).css("left"),10) || region.parentNode.offsetLeft;
				location.x = e.clientX - l;
				location.width = region.offsetWidth;
				location.y = e.clientY;
				location.height = region.offsetHeight;
				location.pleft = l;
			},
			"moved": function(e){
				var e = e || event,
					x = e.clientX - location.pleft - 3,
					y = e.clientY,
					width = location.width + location.x - x,
					height = y - location.y + location.height;
				if(x <= 0)
					return;
				region.style.width = width + "px";
				region.style.height = height + "px";
				region.style.left = x + "px";
			}	
		};
		rs[PICTURE_REGION_RESIZE_RB] = {
			"begin": function(target,e){
				location.x = e.clientX;
				location.width = target.offsetWidth;
				location.y = e.clientY;
				location.height = target.clientHeight;
				location.left = target.offsetLeft;
				location.top = target.offsetTop;			
			},
			"moved": function(e){
				var e = e || window.event,
					width = e.clientX - location.x + location.width,
					height = e.clientY - location.y + location.height,
					maxwidth = region.parentNode.offsetWidth,
					maxheight = region.parentNode.offsetHeight;
				if(location.left + width >= maxwidth)
					return;
				if(location.top + height >= maxheight)
					return;
				region.style.width = width +"px";
				region.style.height = height + "px";
			}
		};
		region.onmousedown = function(e){
			var e = e || window.event,
				target = e.target || e.srcElement,
				key = target.className.split(" ")[0],
				call = rs[key],
				self = this,
				dragClass = key + "-on";
			dragging = true;
			//e.preventDefault();
			Draggable.call(this,e);
			if(call){
				call["begin"].call(target,this,e);
				Draggable.dnd.call(this,this,call["moved"],{
					"in": function(a){
						$(self).addClass(dragClass);
						callback && callback["in"] && callback["in"](target);
					},
					"out": function(a){
						$(self).removeClass(dragClass);
						me.setX(self.offsetLeft).setY(self.offsetTop).setWidth(self.offsetWidth).setHeight(self.offsetHeight);
						callback && callback["out"] && callback["out"](target);
					}
				});
				flag = true;
			}
		};
	};
	Region.prototype.show = function(){
		this.region.style.display = "block";
		return !0;
	};
	Region.prototype.hide = function(){
		this.region.style.display = "none";
		return !1;	
	};
	Region.prototype.getWidth = function(){
		var region = this.region;
		return parseInt($(region).css("width"),10) || region.offsetWidth;
	};
	Region.prototype.setWidth = function(width){
		this.width = width;
		return this;
	};
	Region.prototype.getHeight = function(){
		var region = this.region;
		return parseInt($(region).css("height"),10) || region.offsetHeight;
	};
	Region.prototype.setHeight = function(height){
		this.height = height;
		return this;
	};
	Region.prototype.getX = function(){
		var region = this.region;
		return parseInt($(region).css("left"),10) || region.offsetLeft;
	};
	Region.prototype.setX = function(x){
		this.x = x;
		return this;
	};
	Region.prototype.getY = function(){
		var region = this.region;
		return parseInt($(region).css("top"),10) || region.offsetTop;
	};
	Region.prototype.setY = function(y){
		this.y = y;
		return this;
	};
})(this,document,_$);