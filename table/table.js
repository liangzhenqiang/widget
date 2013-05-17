/*!
* SmartTable Javascript Widget
* Author: flyend
* Contact: flyend@126.com(e-mail), 269644230(qq)
* Date: Mon Oct 2012
* Modified Fri Jan 11 2013
*/
(function(window,document){
	var d = document, that = window;
	if(!_$.hasOwnProperty("SmartTable")){
		_$["SmartTable"] = SmartTable;
	}
	function SmartTable(opt){
		this.table = null;
		
		this.create = function(){
			this.table = d.createElement("table");
			this.table.className = "table";
			this.page = d.createElement("div");
			this.page.className = "page";
			return this.table;	
		};
		this.id = function(id){
			this.table.setAttribute("id",id);
			return this;
		};
		this.getContext = function(){
			return this.table || this.create();
		};
		if(!this.table){
			this.table = this.create();
		}
		this.init(opt);
		return this;
	}
	SmartTable.prototype.init = function(opt){
		this.root = opt.root || "data";
		this.options = opt;
		this.makeTitle(opt).makeCell(opt);
		var me = this,
			updateTable = function(url){
				var column = opt["column"] || 10,
					url = SmartTable.util.hashpage(opt);
				url += opt["column"] && ((url.indexOf("?") > 0 ? "&" : "?") + "column=" + column) || "";
				SmartTable.ajax(url,function(res){
					me.loading.style.display = "block";
					var len = parseInt(res["length"],10) || 10,
						res = SmartTable.util.mapping(me.root,res);
					setTimeout(function(){me.table.replaceChild(SmartTable.create.tbody(res,me,opt),_$(me.table).find("tbody")[0]);},1000);
					me.page.innerHTML = SmartTable.create.tpage(me.nextPage.opt, Math.ceil(len / column));
				});
			};
		//alert("onhashchange" in window)
		if(("onhashchange" in that) ){
			_$(that).bind("hashchange",function(){
				updateTable(SmartTable.util.hashpage(opt));
			});
		}
		else{
			//Safari3.2和Opera9.8不支持hashchange
			var hash = location.hash,
				refname = "hash";
			var h = _$[refname] = new _$.History("#page=" + (hash && parseInt(hash.split(/page=/)[1]) || opt.page || 1), refname);
			h.change(function(href){
				updateTable(SmartTable.util.hashpage(opt));
			});
			_$(me.page).bind("click",function(e){
				var e = e || that.event,
					target = e.target || e.srcElement;
				if(target.tagName == "A"){
					var href = parseInt(target.href.match(/page=(\d+)/)[1],10),
						url = opt.url;
					url += (url.indexOf("?") > 0 ? "&" : "?") + "page=" + href;
					//alert(hash + "==" +target.href.match(/page=(\d+)/)[1])
					updateTable(url);
					h.add("#page=" + href || opt.page || 1);
				}
			});
		}
	};
	SmartTable.prototype.appendTo = function(el){
		this.loading = SmartTable.create.loading(this);
		el.appendChild(this.table || this.getContext());
		el.appendChild(this.loading);
		this.table.parent = el;
		return this;
	};
	SmartTable.prototype.addRow = function(data){
		var table = this.table || this.getContext(),
			rows = table.getElementsByTagName("tr"),
			lastRow,
			tpl = this.options["tpl"];
		//console.log(tpl)
		this.length = rows.length - 1;
		lastRow = rows[this.length].cloneNode(1);
		if(SmartTable.util.type.isObject(data)){
			var i = 0,
				tds = lastRow.getElementsByTagName("td");
			for(var p in data){
				if(tpl && tpl[p]){
					tds[i].innerHTML = tpl[p].replace(/{\w+}/g,function(){
						return data[p];	
					});
				}
				else
					tds[i].innerHTML = data[p];
				i++;
			}
			table.getElementsByTagName("tbody")[0].appendChild(lastRow);
		}
		return lastRow;
	};
	SmartTable.prototype.makeTitle = function(opt){
		var table = this.table || this.getContext(),
			titles = opt.titles;
		if(titles){
			table.appendChild(SmartTable.create.thead(titles));
		}
		return this;
	};
	SmartTable.prototype.makeCell = function(opt){
		var table = this.table || this.getContext(),
			me = this,
			url = opt.url;
		if(SmartTable.util.type.isArray(url)){
			table.appendChild(SmartTable.create.tbody(url,me,opt));
		}
		else if(SmartTable.util.type.isObject(url)){
			table.appendChild(SmartTable.create.tbody(SmartTable.util.mapping(me.root,url),me,opt));
		}
		else if(SmartTable.util.type.isString(url)){
			var column = opt["column"] || 10,
				url = SmartTable.util.hashpage(opt);
			url += opt["column"] && ((url.indexOf("?") > 0 ? "&" : "?") + "column=" + column) || "";
			SmartTable.ajax(url,function(res){
				var arrays;
				if(SmartTable.util.type.isArray(res)){
					arrays = res;
				}
				else if(SmartTable.util.type.isObject(res)){
					arrays = SmartTable.util.mapping(me.root,res);
				}
				//console.log(parseInt(res["length"],10));
				me.count = parseInt(res["length"],10);
				me.length = Math.ceil(me.count / column);
				//var res = SmartTable.util.mapping(me.root,res);
				table.appendChild(SmartTable.create.tbody(arrays,me,opt));
				if(me.nextPage.opt){
					var len = parseInt(res["length"],10) || 10;
					me.nextPage.opt["page"] = opt.page;
					me.page.innerHTML += SmartTable.create.tpage(me.nextPage.opt,Math.ceil(len / column));
					table.parent.appendChild(me.page);
				}
			});
		}
		else{
			alert("not support data!");	
		}
		return this;
	};
	SmartTable.prototype.getCount = function(){
		if(this.count){
			return this.count;	
		}
		return 0;
	};
	SmartTable.util = {
		"mapping": function(root,obj){
			for(var i = 0, p = root.split("."), l = p.length; i ^ l; i++)
				obj = obj[p[i]];
			return obj;
		},
		"hashpage": function(opt){
			var hash = location.hash,
				url = opt.url;
			url += (url.indexOf("?") > 0 ? "&" : "?") + "page=" + (hash ? parseInt(hash.split(/page=/)[1]) : opt.page || 1);
			return url;
		},
		"keyset": function(titles,tpl){
			/*fields key设计都是唯一的: {"1":id,"2":name}或[id,name]，JSON字段的匹配key将被覆盖*/
			var indexs = [], fields = {}, keys = [], index = 0, tpls = [], temp = {}, reg = [];
			for(var i in titles){
				var field = titles[i].fields;
				if(!titles[i].custom)
					temp[i] = 1;
				if(field){
					for(var j = 0; j ^ field.length; j++){
						var f = field[j];
						if(!fields.hasOwnProperty(f)){
							fields[f] = 1;
							temp[f] = 1;
							//keys.push(temp);
							reg.push(f);
						}
					}	
				}
				//模板对应的字段
				for(var p in tpl){
					if(i == p){
						tpls.push(p); 
						indexs.push(index);
					}
				}
				index++;
			}
			for(var p in temp){
				keys.push(p);
			}
			return {
				"field": keys,
				"index": indexs,
				"tpl": tpls,
				"reg": reg
			};
		},
		"type": {
			"isArray": function(obj){
				return Object.prototype.toString.call(obj) === "[object Array]";
			},
			"isObject": function(obj){
				return Object.prototype.toString.call(obj) === "[object Object]";
			},
			"isString": function(obj){
				return Object.prototype.toString.call(obj) === "[object String]";
			}
		}
	};
	SmartTable.prototype.nextPage = function(opt){
		this.nextPage.opt = opt;
	};
	SmartTable.prototype.bind = function(type,fn){
		var table = this.table || this.getContext();
		_$(table).bind(type,function(e){
			var e = e || that.event,
				target = e.target || e.srcElement;
			fn(target,this);
		});
	};
	SmartTable.prototype.reload = function(url,callback){
		var me = this,
			param = "",
			fn = function(o){
				var s = "", i = 0;
				for(var p in o){
					s += (i ^ 0 ? "&" : "") + p + "=" + o[p];
					i++;
				}
				return s;
			};
		if(typeof url === "string"){
			param = url;	
		}
		else if(typeof url === "object"){
			param += url["url"] + (url["url"].indexOf("?") > 0 ? "&" : "?");
			var params = url["params"];
			if(typeof params === "object"){
				param += fn(params);
			}
			else if(typeof params === "function"){
				param += fn(params());
			}
		}
		//重置
		SmartTable.ajax(param,function(res){
			me.loading.style.display = "block";
			var len = parseInt(res["length"],10),
				res = SmartTable.util.mapping(me.root,res);
			me.table.replaceChild(SmartTable.create.tbody(res,me,me.options),_$(me.table).find("tbody")[0]);
			if(len){
				me.page.innerHTML = SmartTable.create.tpage(me.nextPage.opt, Math.ceil(len / 4));
			}
			me.count = len | 0;
			me.length = Math.ceil(me.count / me.options["column"]) | 0;
			callback && callback(res,me);
		});
	};
	SmartTable.ajax = function(url,fn){
		_$.ajax(url,function(response,xhr){
			var res = _$.parseJSON(response);
			if(!res){
				alert("not data!");
				return;
			}
			fn && fn(res);
		});
	};
	SmartTable.getJSON = function(data,fields){
		var arr = [], len = data.length;
		for(var i = 0; i ^ len; ){
			var d = data[i++], o = {};
			for(var j = 0; j < fields.length; j++){
				o[fields[j]] = d[fields[j]];
			}
			arr.push(o);
		}
		return arr;
	};
	SmartTable.create = {
		thead: function(titles){
			var thead = d.createElement("thead"),
				trow = d.createElement("tr"),
				title,
				hcell;
			for(var i in titles){
				title = titles[i];
				hcell = d.createElement("th");
				hcell.innerHTML = title["name"];
				trow.appendChild(hcell);
			}
			thead.appendChild(trow);
			return thead;
		},
		tbody: function(json,self,opt){
			var tbody = d.createElement("tbody"),
				arr = SmartTable.util.keyset(opt.titles,opt.tpl),
				data = [];
			if(self.loading)
				self.loading.style.display = "none";
			if(!SmartTable.util.type.isArray(json)){
				tbody.appendChild(this.empty(self,"没有任务数据"));
				_$(self.table).addClass("x-table-invalid");
				opt.cal && opt.cal(data,tbody,self);
				return tbody;
			}
			if(!json.length){
				tbody.appendChild(this.empty(self,"not data!"));
				_$(self.table).addClass("x-table-empty");
				opt.cal && opt.cal(data,tbody,self);
				return tbody;
			}
			if(SmartTable.util.type.isArray(json[0])){
				//以定义的titles来显示行数				
				for(var i = 0, len = json.length; i ^ len; i++){
					tbody.appendChild(this.tcell(json[i],arr,opt));
				}
			}
			else if(SmartTable.util.type.isObject(json[0])){
				data = SmartTable.getJSON(json,arr.field);
				var len = data.length, item;
				for(var i = 0; i ^ len; i++){
					item = data[i];
					tbody.appendChild(this.tcell(item,arr,opt));
				}
			}
			else{
				tbody.appendChild(this.empty(self,"不能识别此类型数据!"));
			}
			if(opt.cal){
				opt.cal(data,tbody,self);	
			}
			return tbody;
		},
		tpage: function(opt,len){
			//if(!len)
			var pid = 1,
				i = 1,
				arr = [],
				href = location.href.replace(/#(page)=\d+/,"");
			if(opt.link){
				for(var p in opt.link){
					switch(p){
						case "first":
							pid = 1;
						break;
						case "prev":
							var hash = location.hash;
							hash = (hash && parseInt(hash.split(/page=/)[1]) || opt.page || 1);
							hash -= 1;
							hash < 1 && (hash = 1);
							pid = hash;
						break;
						case "next":
							var hash = location.hash;
							hash = (hash && parseInt(hash.split(/page=/)[1]) || opt.page || 1);
							hash += 1;
							hash > len && (hash = len);
							pid = hash;
						break;
						case "last":
							pid = len;
						break;
					}
					if(p != "count")
						arr.push("<a href='" + href + "#page=" + pid + "' class='" + p + "'>" + opt.link[p] + "</a>");
					if(i == 2){
						if(opt.link["count"]){
							var count = opt.link["count"] || 10,
								hash = location.hash,
								s = "<span>";
							hash = (hash && parseInt(hash.split(/page=/)[1]) || opt.page || 1);
							count > opt.length && (count = len);
							//console.log(hash);
							var begin = hash || opt.page || 1,
								end;
							end = begin + count - 1;
							if(begin > len - count){
								end = len;
							}
							for(var j = begin; j <= end; j++){
								 s += "<a href='" + href + "#page=" + j + "'" + (j == hash ? " class='on'" : "") +">" + j + "</a>";	
							}
							arr.push(s += "</span>");
						}
					}
					i++;
				}
			}
			return arr.join("");
		},
		tcell: function(item,arr,opt){
			var count = 0,
				hasType = SmartTable.util.type.isArray(item),
				cells = arr.index,
				regFields = arr.reg,
				cell,
				trow = d.createElement("tr"),
				maxlength,
				maxField;
			function len(s){
				var i = 0;
				for(var j = 0, l = s.length; j ^ l; j++)
					(s.charCodeAt(j) & 0xff00) && i++,
					i++;
				//return s.replace(/[^\x00-\xff]/g,"aa").length >> 1;
				return i >> 1;
			}
			for(var j in opt.titles){
				cell = d.createElement("td");
				maxlength = opt["titles"][j]["maxlength"];
				//if(maxlength && len(item[hasType ? count : j]) > maxlength){
					//item[hasType ? count : j] = item[hasType ? count : j].substring(0,maxlength) + "<span class='x-ellipsis' title='" + item[hasType ? count : j].substr(maxlength) + "'>...</span>";
				//}
				if(!opt.tpl){
					cell.innerHTML = ((maxlength && len(item[hasType ? count : j]) > maxlength) ? item[hasType ? count : j].substring(0,maxlength) + "<span class='x-ellipsis' title='" + item[hasType ? count : j].substr(maxlength) + "'>...</span>" : item[hasType ? count : j]) || opt.titles[j].custom || "not data";
					trow.appendChild(cell);
					continue;
				}
				for(var k = 0, l = cells.length; k ^ l; k++){
					if(count == cells[k]){
						var text = opt.tpl[arr.tpl[k]];
						cell.innerHTML = text.replace(/{\w+}/g,function(arg){
							for(var z = 0; z < regFields.length; z++){
								var regField = regFields[z],
									r = new RegExp("\\{" + regField + "\\}","g");									
								//if(r.test(arg))
									//return item[hasType ? count : regFields[z]];// || item[hasType ? count : j];
								if(r.test(arg)){
									if(regField == j && maxlength && len(item[hasType ? count : j]) > maxlength){
										return item[hasType ? count : j].substring(0,maxlength) + "<span class='x-ellipsis' title='" + item[hasType ? count : j].substr(maxlength) + "'>...</span>";
									}
									else
										return item[hasType ? count : regField];
								}
								
							}
						});
						/*var substitute = function(s,o){
							var ml = function(mo){
								if(o){
									if(maxlength && len(mo) > maxlength){
										return mo.substring(0,maxlength) + "<span class='x-ellipsis' title='" + mo.substr(maxlength) + "'>...</span>";
									}
									else
										return mo;
								}
								return "";
							};
							return s.replace(/{([^{}]*)}/g,function(a,b){
								//console.log(a);a={w},b=w//子模式;
								var r = o[b];
								return typeof r === "string" || r === "number" ? ml(r) : ml(a);
							});
						};
						cell.innerHTML = substitute(text,item);*/
						break;
					}
					else{
						cell.innerHTML = maxlength && len(item[hasType ? count : j]) > maxlength ? item[hasType ? count : j].substring(0,maxlength) + "<span class='x-ellipsis' title='" + item[hasType ? count : j].substr(maxlength) + "'>...</span>" : item[hasType ? count : j];
					}
					
				}
				trow.appendChild(cell);
				count++;
			}
			return trow;
		},
		loading: function(self){
			var el = d.createElement("div");
			el.className = "x-loading";
			el.style.display = "none";
			el.appendChild(d.createTextNode("loading..."));
			return el;			
		},
		empty: function(self,text){
			var cell = d.createElement("td"),
				trow = d.createElement("tr");
			cell.setAttribute("colSpan",_$(self.table).find("th").length);
			cell.appendChild(d.createTextNode(text));
			trow.appendChild(cell);
			return trow;
		}
	};
})(this,document);