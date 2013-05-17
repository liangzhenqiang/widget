/*!
* Data form validator Javascript Widget
* Author: flyend
* Contact: flyend@126.com(e-mail), 269644230(qq)
* Date: Wed Oct 2012
*/
(function(window,document){
	var d = document, that = window;
	if(!_$.hasOwnProperty("SmartForms")){
		_$["SmartForms"] = SmartForms;
	}
	function SmartForms(opt){
		this.forms = opt.forms;
		//this.constructor = "[object SmartForms]";
		this.init(opt);
		return this;
	}
	SmartForms.prototype.init = function(opt){
		var forms = this.forms;
		if(!~forms.className.indexOf(".x-form")){
			_$(forms).addClass("x-form");
		}
		if(opt["action"])
			forms["action"] = opt["action"];
		if(opt["method"])
		
			forms["method"] = opt["method"];
		if(opt["name"])
			forms["name"] = opt["name"];
		if(opt["style"]){
			//forms["uistyle"] = opt["style"];
			_$(forms).addClass(opt["style"]);
			SmartForms.util.style(forms,opt["style"],opt);
		}
		if(opt.proxy)
			forms.proxy = opt.proxy;
	};
	SmartForms.prototype.fx = function(opt){
		var forms = this.forms,
			me = this,
			xmap = {};
		this.options = opt;
		forms["arrays"] = {};
		for(var name in opt){
			var elements = forms[name],
				events = opt[name]["listeners"],
				validate = opt[name]["validate"],
				xtype = opt[name]["xtype"],
				placeholder = opt[name]["placeholder"],
				message = opt[name]["message"];
			if(!elements)
				continue;
			if(opt[name]["value"]){
				elements.value = opt[name]["value"];
			}
			//控件自定义的默认事件				
			if(xtype){
				switch(xtype){
					case "date":
						xmap[name] = "x-calendar";
					break;
					case "mail":
						if(opt[name]["options"]["services"])
							xmap[name] = "x-mail-services";
					break;
				}
				SmartForms.events.defaultEvent.call(forms,elements,xtype,opt[name]);
			}
			//验证默认事件
			if(validate){
				/*for(var p in validate){
					var val = validate[p].value;
					if(val && /^#.+$/.test(val)){
						_$(forms[val.substr(1)]).bind("blur",function(){
							SmartForms.events.defaultValidate.call(forms || this.form,this,opt);
						});
						console.log(val.substr(1))	
					}
				}*/
				_$(elements).bind("blur",function(){
					var elem,
						xtype = opt[this.name]["xtype"];
					if(xtype && xtype == "number"){
						elem = this.parentNode;	
					}
					else
						elem = this;
					SmartForms.events.defaultValidate.call(forms || this.form,this,elem,opt);
				});
				/*_$(elements).bind("focus",function(){
					SmartForms.events.defaultValidate.call(forms || this.form,this,opt);
				});	*/
				forms.arrays[name] = name;
			}
			if(message){
				SmartForms.util.message.call(forms,elements,message);
			}
			//用户自定义事件
			if(events){
				for(var j in events){
					if(typeof events[j] === "function"){
						(function(a){
							var ev = events[a];
							_$(elements).bind(a,function(){
								ev.call(forms || this.parentNode,this);
							});
						})(j);
					}
				}
			}
			//placeholder
			if(placeholder){
				SmartForms.util.placeHolder.call(forms,elements,placeholder,opt);
			}
		}
		//console.log(xmap)
		SmartForms.doSpace(xmap,forms);
		//submit
		_$.each(forms.elements,function(v,k){
			if(this.type == "submit")
				me.submit = this;
		});
		forms.onsubmit = function(){
			var next = [];
			if(me.submit)
				me.submit.focus();//离开 IE不执行
			for(var p in forms.arrays){
				next.push(p);
			}
			if(next.length){
				var n = next.shift();
				//alert(n);
				this[n].focus();//失去焦点删除
				//this[n].value = "";
				return false;
			}
			//console.log(forms.arrays)			
			if(this.proxy){
				//url = this["action"] || "/",
				var query = SmartForms.util.query(this);
				query = query += this.proxy["params"] ? "&" + this.proxy["params"] : "";
				console.log(query);
				//相同名称只提交其中一个值
				this.proxy["callback"] && this.proxy["callback"](this,query,me,this.proxy);
				return false;
			}
			return true;
		};
	};
	SmartForms.prototype.reset = function(){
		var forms = this.forms,
			opt = this.options,
			el;
		forms.reset();
		for(var p in opt){
			var validate = opt[p]["validate"],
				placeholder = opt[p]["placeholder"],
				message = opt[p]["message"];
			el = forms[p];
			if(validate)
				forms.arrays[p] = p;
			if(placeholder){
				SmartForms.util.placeHolder.call(forms,el,placeholder,opt);
			}
			if(message){
				var elem;
				if(opt[p]["xtype"] == "number")
					elem = el.parentNode;
				else
					elem = el;
				SmartForms.util.message.call(forms,elem,message);
			}
			else{
				//SmartForms.util.message.call(forms,forms[p],"");
			}
		}
		//_$(".x-msg").css("display","none");
		SmartForms.util.style(forms);
		//console.log(forms.arrays)
		//this.fx(this.options);
	};
	SmartForms.events = {
		defaultValidate: function(el,ms,opt){
			//if(!opt[el.name]["validate"]["required"])
				//return;
			var validate = SmartForms.validate,
				v = opt[el.name]["validate"],
				s = "",
				f = "",
				arr = [];
			//delete v["required"];
			for(var i in v){
				if(i != "success"){
					if(validate[i]){
						if(!validate[i](el,v,this)){
							s += v[i]["error"];
							SmartForms.util.prompt.fail(ms,s,opt);
							this["arrays"][el.name] = el.name;
							arr.push(i);
						}
					}
					else{
						//用户自定义验证
						if(typeof v[i]["value"] === "function"){
							var flag = !!v[i]["value"].call(el,this);
							if(!flag){
								s += v[i]["error"];
								SmartForms.util.prompt.fail(ms,s,opt);
								this["arrays"][el.name] = el.name;
								arr.push(i);
							}	
						}
					}
					f += v[i]["success"] || "";
				}
			}
			//不符合控件
			for(var p in this.arrays){
				arr.push(p);	
			}
			//console.log(this.arrays)
			if(el.value.length && !arr.length){
				SmartForms.util.prompt.success(ms,f || v["success"] || "验证通过",opt);
				delete this["arrays"][el.name];	
			}
			else{
				//el.focus();
			}
		},
		defaultEvent: function(el,type,opt){
			switch(type){
				case "date":
					var me = this;
					_$(el).bind("click",function(){
						this.setAttribute("autocomplete","off");
						SmartForms.widget.calendar(el,opt["options"],me);
					});
					_$(el).bind("focus",function(){
						//SmartForms.validate.max(this,opt,me);
					});
					_$(el).bind("blur",function(){
						//console.log(opt)
						var fn = SmartForms.util.message;
						if(!SmartForms.validate.date(this)){
							this.value = "";
							me["arrays"][this.name] = this.name;
							fn(this,"无效的日期");
						}
						else{
							var val = this.value.split(/[^\d+]/);
							if(!+val[0] || !+val[1] || !+val[2] || +val[1] > 12 || +val[2] > 31){
								this.value = "";
								me["arrays"][this.name] = this.name;
								fn(this,"无效的日期");
							}
						}
					});
				break;
				case "mail":
					var services = opt["options"]["services"],
						me = this;
					if(services){
						el.setAttribute("autocomplete","off");
						_$(el).bind("keyup",function(e){
							if(!el.created){
								SmartForms.widget.mail.make(this,services,me);
								el.created = !undefined;
							}
							SmartForms.widget.mail.sg(this,services,e,me);
						});
						/*_$(el).bind("blur",function(e){
							SmartForms["x-mail-services"].style.display = "none";
						});*/
					}
					_$(el).bind("blur",function(){
						if(!SmartForms.validate.email(this)){
							me["arrays"][this.name] = this.name;
							//SmartForms.util.message(this,"无效的Email");
							//this.focus();
						}
						else{
							SmartForms.util.message(this,"");
							SmartForms["x-mail-services"].style.display = "none";//widget验证不通过就显示
						}
						
					});
				break;
				case "password":
					var strength = opt["options"]["strength"];
					if(strength){
						_$(el).bind("focus",function(e){
							if(!el.created){
								SmartForms.widget.password.make(this);
								el.created = !undefined;
							}
						});
						_$(el).bind("keyup",function(e){
							SmartForms.widget.password.kg(this,e);
						});
					}
				break;
				case "number":
					SmartForms.widget.number(el,opt);
				break;
			}	
		}
	};
	SmartForms.settings = {
		
	};
	SmartForms.util = {
		parent: function(el,tag){
			do{
				if(el.tagName == tag)
					return el;
			}while(el = el.parentNode);
			return null;
		},
		info: function(el){
			var parent = el.parentNode,	
				t;
			if(el.nextSibling && el.nextSibling.nodeType == 1 && !!~el.nextSibling.className.indexOf("x-msg")){
				return el.nextSibling;
			}
			t = d.createElement("strong");
			t.className = "x-msg";
			if(el.nextSibling){
				parent.insertBefore(t,el.nextSibling);
			}
			else
				parent.appendChild(t);
			return t;
		},
		style: function(form,style,opt){
			var elements = form.getElementsByTagName("input"),
				el,
				arr = [],
				len = elements.length;
			for(var i = 0; i ^ len; i++){
				el = elements[i];
				if(el.type == "radio" || el.type == "checkbox"){
					el.checked && _$(el.parentNode).addClass("on") || _$(el.parentNode).removeClass("on");
					el.type == "radio" && el.checked && (arr[0] = el.parentNode);
				}
			}
			if(opt){
				_$(form).bind("click",function(e){
					var e = e || that.event,
						target = e.target || e.srcElement;
					if(target.tagName == "INPUT"){
						switch(target.type){
							case "checkbox":
								target.checked ? _$(target.parentNode).addClass("on") : _$(target.parentNode).removeClass("on");
								//console.log(target.checked);
							break;
							case "radio":
								arr.unshift(target.parentNode);
								if(arr.length > 1){
									_$(arr.pop()).removeClass("on");
								}
								_$(target.parentNode).addClass("on");
							break;
						}
					}
				});
			}
		},
		placeHolder: function(el,value,opt){
			el.value = value;
			_$(el).bind("focus",function(){
				if(this.value == value)
					this.value = "";
			});
			_$(el).bind("blur",function(){
				if(!this.value)
					this.value = value;	
			});
		},
		message: function(el,msg){
			var t = SmartForms.util.info(el);
			t.innerHTML = msg;
		},
		prompt: (function(){
			function s(m,msg,opt){
				var p = SmartForms.util.info(m);
				p.innerHTML = msg;
				_$(p).hasClass("error") && _$(p).removeClass("error");
				_$(p).addClass("success");
			}
			function f(m,msg,opt){
				var p = SmartForms.util.info(m);
				p.innerHTML = msg;
				_$(p).hasClass("success") && _$(p).removeClass("success");
				_$(p).addClass("error");
			}
			return {
				"success": s,
				"fail": f	
			};
		})(),
		query: function(form){
			var url = form["action"] || "/",
				fields = form.elements,
				field,
				query = "";
			for(var i = 0, l = fields.length; i ^ l; i++){
				field = fields[i];
				if(field.name){
					if(url.indexOf("?") > 0){
						//query += "&" + field.name + "=" + (field.value || "");
						if(field.type == "radio" || field.type == "checkbox"){
							if(field.checked){
								query += "&" + field.name + "=" + (field.value || "");	
							}
						}
						else{
							query += "&" + field.name + "=" + (field.value || "");	
						}
					}
					else{	
						if(field.type == "radio" || field.type == "checkbox"){
							if(field.checked){
								query += (i ^ 0 ? "&" : "?") + field.name + "=" + (field.value || "");	
							}
						}
						else{
							query += (i ^ 0 ? "&" : "?") + field.name + "=" + (field.value || "");	
						}
					}
				}
			}
			return query;
		}
	};
	SmartForms.validate = {
		required: function(el){
			return (el.value.length ^ 0);
		},
		email: function(el){
			//return !/^\w+@\w+.\w+$/.test(el.value);
			return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(el.value);
		},
		minlength: function(el){
			return el.value.length <= 3;
		},
		equalTo: function(el,opt,form){
			//console.log(opt)
			var name = opt["equalTo"]["value"] || "";
			name = name.substr(1);
			if(!el.binded){
				var msg = SmartForms.util.info(el);
				_$(form[name]).bind("blur",function(){
					//console.log(this.isValidate)
					if(this.value != el.value){
						form.arrays[el.name] = el.name;
						if(msg){
							msg.innerHTML = "";
							msg.innerHTML += opt["equalTo"]["error"];
						}
					}
					else{
						msg.innerHTML = "";
						msg.innerHTML += opt["equalTo"]["success"] || opt["success"] || "验证通过";
						delete form.arrays[el.name];	
					}
				});
				el.binded = !undefined;
			}
			return el.value == form[name].value;
		},
		maxlength: function(el,opt){
			return (el.value.length >= (+opt["maxlength"]["value"] | 0));
		},
		rangelength: function(){
			
		},
		range: function(){
			
		},
		max: function(el,opt,form){
			var name = opt["max"]["value"],
				msg,
				va = el.value,
				vb;
			if(va && name){
				name = name || "";
				name = name.substr(1);
				va && (va = va.split(/[^\d+]/));
				//va[0] && (va = +va[0] + +va[1] + +va[2]);
				vb = form[name].value;
				vb && (vb = vb.split(/[^\d+]/));
				var flag = (+va[0]) > (+vb[0]) || ((+va[1]) > (+vb[1]) || (+va[2]) >= (+vb[2]));// && ((+va[2]) >= (+vb[2])));
				if(!el.binded){
					var fn = function(elem){
						var tva = el.value.split(/[^\d+]/),
							msg = SmartForms.util.info(elem);
						if(elem.value){
							var tvb = elem.value.split(/[^\d+]/),
								tv = (+tva[0]) > (+tvb[0]) || ((+tva[1]) > (+tvb[1]) || (+tva[2]) >= (+tvb[2]));
							if(!tv){
								form.arrays[el.name] = el.name;
								msg.innerHTML = opt["max"]["error"];
								SmartForms.util.info(el).innerHTML = opt["max"]["error"];
							}
							else{
								delete form.arrays[el.name];
								msg.innerHTML = opt["max"]["success"] || "验证通过";
								SmartForms.util.info(el).innerHTML = opt["max"]["success"] || "验证通过";
							}
						}
					};
					_$(form[name]).bind("blur",function(){
						fn(this);
					});
					_$(form[name]).bind("focus",function(){
						fn(this);
					});
					el.binded = !undefined;
				}
				if(flag){
					SmartForms.util.info(form[name]).innerHTML = opt["max"]["success"] || "验证通过";
				}
				else{
					SmartForms.util.info(form[name]).innerHTML = opt["max"]["error"];
				}
				return flag;
			}
			return !1;
		},
		min: function(){
			
		},
		date: function(el){
			return /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(el.value);
		},
		number: function(el){
			return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(el.value);
		},
		url: function(){
			
		},
		accept: function(){
			
		},
		creditcard: function(){
			
		}
	};
	SmartForms.widget = {
		calendar: function(el,opt,form){
			SmartForms.loadJs("../calendar/calendar.js",function(){
				var now = opt && opt["date"];
				now && !el.value.length && (el.value = now, el.select());
				if(!SmartForms["x-calendar-temp"]){
					SmartForms["x-calendar-temp"] = new _$.Calendar({
						"date": now || el.value,
						"format": opt && opt["format"] || "yyyy-MM-dd",
						"css": {"left": _$(el).offset().left + "px", "top": _$(el).offset().top + 30 + "px"}
					}).appendTo(d.body).bind("click",function(format,td,self){
						el.value = format;
						el.focus();
						self.hide();
						if(SmartForms.validate.date(el)){
							delete form["arrays"][el.name];	
						}
						SmartForms.util.message(el,"");
					});
				}
				else{
					//console.log(el.value)
					SmartForms["x-calendar-temp"].css({"left": _$(el).offset().left + "px", "top": _$(el).offset().top + 30 + "px"}).redate(el.value || now).bind("click",function(format,td,self){
						el.value = format;
						el.focus();
						self.hide();
						if(SmartForms.validate.date(el)){
							delete form["arrays"][el.name];	
						}
						SmartForms.util.message(el,"");
					});
					SmartForms["x-calendar-temp"].hide() ? SmartForms["x-calendar-temp"].hide() : SmartForms["x-calendar-temp"].show();
					//d.xCalendar = d.xCalendar.getContext();
				}
				if(!el.keyup){
					_$(el).bind("keyup",function(e){
						SmartForms["x-calendar-temp"].direction(this,e);
					});
					el.keyup = !undefined;
				}
				SmartForms["x-calendar"] = SmartForms["x-calendar-temp"].getContext();
			});
		},
		mail: function(){
			var cls = "x-mail-services",
				o = SmartForms[cls] = d.createElement("ul");
			return {
				"make": function(el,opt,form){
					var item,
						offset = _$(el).offset();
					o.className = cls;
					_$(o).css({"width": el.offsetWidth + "px", "left": offset.left + "px", "top": (offset.top + el.offsetHeight + 2) + "px"});
					for(var i = 0, l = opt.length; i ^ l; i++){
						item = d.createElement("li");
						item.appendChild(d.createTextNode("@" + opt[i]));
						item.onclick = function(){
							el.value = this.innerHTML.replace(/<[^>]*>/g,"");
							o.style.display = "none";
							el.focus();
							delete form["arrays"][el.name];
							SmartForms.util.message(el,"");
						};
						o.appendChild(item);
					}
					d.body.appendChild(o);
					this.index = -1;
					return o;
				},
				"sg": function(el,opt,e,form){
					var val = el.value;
					val = val.replace(/^\s*|\s*$/,"").replace(/\\+/,"@");
					if(!val.length || (!!~val.indexOf("@") && /^.+@(\?|\+|\.|\$|\^|\*|\(|\)|\\)+/.test(val))){
						o.style.display = "none";
						return;
					}
					var e = e || that.event,
						charCode = e.charCode || e.keyCode || e.which,
						items = o.getElementsByTagName("li"),
						length = items.length,
						suffix = val.substr(val.indexOf("@") + 1),
						temp = 0,
						reg = new RegExp("" + suffix + "");//执行两次shift+@
					if(charCode != 13)
						o.style.display = "block";				
					this.arrays || (this.arrays = []);
					this.map || (this.map = {});
					if(charCode != 38 && charCode != 40){
						for(var i = 0; i ^ length; i++){
							this.map[i] = items[i];
							if(!!~val.indexOf("@") && reg.test(opt[i])){
								var end = val.split("@");
								items[i].innerHTML = "<span>" + end[0] + "</span>" + "@" + (opt[i].replace(reg,end[1]));
							}
							else{
								items[i].innerHTML = "<span>" + val + "</span>" + "@" + opt[i];
							}
							if(!!~val.indexOf("@")){
								if(reg.test(opt[i])){
									items[i].style.display = "block";
									temp++;
									items[i].className = "";				
								}
								else{
									items[i].style.display = "none";
									this.index = -1;
									this.arrays[0] = 0;
									delete this.map[i];
								}
							}
							if(val.length && !(val.indexOf("@") != -1)){
								items[i].style.display = "block";
								items[i].className = "";
							}
						}
						if(!!~val.indexOf("@")){
							temp ? _$(o).removeClass("x-mail-noservices") : _$(o).addClass("x-mail-noservices");
						}
					}
					else
						this.kg(this.map,el,charCode,form);
				},
				"kg": function(items,el,charCode,form){
					var arr = [], len = 0;
					for(var p in items){
						arr[len] = items[p];
						len++;
					}
					if(len <= 1)
						this.arrays[0] = 0;
					//if(len <= 2)
						//this.arrays[0] = 0;
					if(charCode == 40){
						this.index++;
						this.index ^ len || (this.index = 0);
						this.arrays.unshift(this.index);
						//console.log(this.arrays)
						if(this.arrays.length > 1){
							arr[this.arrays.pop()].className = "";
						}
						arr[this.arrays[0]].className = "x-mail-current";
						el.value = arr[this.arrays[0]].innerHTML.replace(/<[^>]*>/g,"");
						if(SmartForms.validate.email(el)){
							delete form["arrays"][el.name];
						}
					}
					else if(charCode == 38){
						if(this.index == -1)
							this.index = len;
						this.index-- || (this.index = len - 1);
						this.arrays.unshift(this.index);
						if(this.arrays.length > 1){
							arr[this.arrays.pop()].className = "";
						}
						arr[this.arrays[0]].className = "x-mail-current";
						el.value = arr[this.arrays[0]].innerHTML.replace(/<[^>]*>/g,"");
						if(SmartForms.validate.email(el)){
							delete form["arrays"][el.name];
						}
					}
				}
			};
		}(),
		password: function(){
			var o = d.createElement("div"),
				elem = d.createElement("span"),
				n = d.createElement("em"),
				cls = "x-form-strength";
			o.className = cls;
			return{
				"make": function(el){
					var offset = _$(el).offset();
					_$(o).css({"left": offset.left + "px", "top": (offset.top + el.offsetHeight + 5) + "px"});
					n.appendChild(d.createTextNode("密码强度："));
					o.appendChild(n);
					o.appendChild(elem);
					d.body.appendChild(o);
				},
				"kg": function(el,e){
					var length = el.value.length,
						count = 0,
						label = "",
						cn = "",
						width = 150;
					if(!length){
						elem.style.paddingLeft = 0;
						return;
					}
					/[a-z]/.exec(el.value) && count++;
					/[A-Z]/.exec(el.value) && count++;
					/\d/.exec(el.value) && count++;
					(/[^a-zA-Z0-9\s]/.exec(el.value) && el.value.length >= 8) && count++;
					count == 1 ? (cn = "",label = "&nbsp;弱") : count == 2 ? (cn = "x-moderate",label = "中等") : count == 3 ? (cn = "x-good",label = "优良") : (cn = "x-strength",label = "&nbsp;强");
					elem.className = cn;
					n.innerHTML = "密码强度：" + label;// n.innerHTML.replace(/(.*)/, label);
					//console.log(width)
					elem.style.paddingLeft = (5 * length) > width ? width : (5 * length) + "px";
				}
			};
		}(),
		number: function(el,opt){
			var opt = opt["options"];
			SmartForms.loadJs("../numeric/numeric.js",function(){
				_$(new _$.Numeric({
					"element": el,
					"maximun": opt && opt["maximun"],
					"minimun": opt && opt["minimun"],
					"increment": opt && opt["increment"],
					"format": opt && opt["format"]
				}).bind("click",opt && opt["callback"] &&  opt["callback"]).getContext()).addClass("x-widget");
			});
		}
	};
	SmartForms.loadJs = function(url,callback){
		var head = _$("head")[0],
			script = d.createElement("script"),
			s = !1;
		script.src = url;
		//if(!head.loaded){
			script.onload = script.onreadystatechange = function(){
				if(!s && !this.readyState || this.readyState  == "loaded" || this.readyState  == "complete"){
					s = !0;
					callback && callback(this);
					script.parentNode.removeChild(script);
				}
			};
			head.appendChild(script);
			/*head.loaded = !0;
		}
		else{
			callback && callback();
		}*/
	};
	SmartForms.doSpace = function(obj,form){
		function fn(o,c){
			//console.log(c);
			for(var p in obj){
				if(o.name == p){
					return 1;
				}	
			}
			while(o = o.parentNode){
				if(o.className && !!~o.className.indexOf(c))
					return 1;
			}
			return 0;
		}
		_$(d).bind("click",function(e){
			var e = e || that.event,
				target = e.target || e.srcElement,
				temp;
			for(var p in obj){
				temp = obj[p];
				//console.log(target.name == p);
				if(!fn(target,temp)){
					SmartForms[temp] && (SmartForms[temp].style.display = "none");
				}	
			}
		});
	};
	SmartForms.prevOperation = function(array,index){
		var obj = {};
		array.unshift(index);
		if(array.length > 1){
			obj["prev"] = array.pop();	
		}
		obj["cur"] = array[0];
		return obj;
	};
})(this,document);