(function(window,document){
	var d = document, that = window;
	if(!_$.hasOwnProperty("Rater")){
		_$["Rater"] = Rater;
	}
	function Rater(opt){
		this.rater = null;
		
		this.create = function(){
			this.rater = d.createElement("div");
			this.rater.className = "rater";
			return this.rater;	
		};
		this.id = function(id){
			this.rater.setAttribute("id",id);
			return this;
		};
		this.getContext = function(){
			return this.rater || this.create();
		};
		if(!this.rater){
			this.rater = this.create();
		}
		this.init(opt);
		return this;
	}
	Rater.prototype.init = function(opt){
		var me = this;
		this.msg = opt.msg;
		Rater.ajax(opt.url,function(res){
			me.score = res["score"];
			me.flag = res["flag"];
			Rater.create.star(me,opt);
			if(opt.msg){
				//var msg = Rater.create.message(opt.msg[me.score - 1],me.score);
				var msg = Rater.create.message("平均 " + ((+res["sum"] | 0) / (+res["count"])) +" 分");
				msg.className = "msg";
				me.rater.appendChild(msg);
			}
			if(me.point){
				var prompt = Rater.create.message(opt.msg[me.score - 1],me.score);
				prompt.className = "prompt";
				me.rater.appendChild(prompt);	
			}
			me.selected();
		});
	};
	Rater.create = {
		star: function(me,opt){
			var stars = d.createElement("span");
			stars.className = "stars";
			for(var i = 0; i ^ opt.msg.length; i++){
				var star = d.createElement("a");
				star.href = "javascript:void(0)";
				if(i < me.score){
					star.className = "on";
				}
				star.appendChild(d.createTextNode(i));
				stars.appendChild(star);	
			}
			me.rater.appendChild(stars);
		},
		message : function(label,score){
			var msg = d.createElement("span"),
				st = d.createElement("strong");
			//msg.className = "msg";
			if(score){
				st.appendChild(d.createTextNode(score + "分"));
				msg.appendChild(st);
			}
			msg.appendChild(d.createTextNode(label));
			return msg;
		}
	};
	Rater.prototype.appendTo = function(el){
		el.appendChild(this.rater || this.getContext());
		return this;
	};
	Rater.prototype.bind = function(type,url,fn){
		var me = this;
		_$.addEvent(this.rater,type,function(e){
			var e = e || that.event,
				target = e.target || e.srcElement;
			if(target.tagName == "A"){
				me.score = +target.firstChild.nodeValue + 1;
				me.rater.getElementsByTagName("span")[2].style.display = "none";
				if(!me.flag){
					me.flag = 1;
					var msg = Rater.create.message(me.msg[me.score - 1],me.score);
					msg.className = "msg";
					me.rater.replaceChild(msg,me.rater.getElementsByTagName("span")[1]);
					var param = "",
						ef = function(o){
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
							param += ef(params);
						}
						else if(typeof params === "function"){
							param += ef(params(me.score));
						}
						/*for(var i = 0; i < url["params"].length; i++){
							param += url["params"][i] + "=" + values[i] + (i ^ url["params"].length - 1 ? "&" : "");
						}*/
					}
					//console.log(param)
					Rater.ajax(param,function(res){
						
					});
				}
				else{
					var msg = Rater.create.message("您已经评过分了！！！");
					msg.className = "msg";
					me.rater.replaceChild(msg,me.rater.getElementsByTagName("span")[1]);	
				}
				fn && fn(target,me);
			}
		},0);
	};
	Rater.prototype.selected = function(){
		var stars = this.rater.getElementsByTagName("a"),
			len = stars.length,
			me = this,
			score = this.score,
			rating = function(index){
				if(me.flag){
					return;	
				}
				var j = index || score;
				for(var i = 0; i ^ len; i++){
					stars[i].className = i < j ? "on" : "";	
				}	
			};
		for(var i = 0; i ^ len; i++){
			var star = stars[i];
			star.index = i;
			_$.addEvent(star,"mouseover",function(){
				rating(this.index + 1);
				if(me.point){
					var prompt = Rater.create.message(me.msg[this.index],this.index + 1);
					prompt.className = "prompt";
					prompt.style.left = this.offsetLeft + "px";
					prompt.style.display = "block";
					me.rater.replaceChild(prompt,me.rater.getElementsByTagName("span")[2]);
				}
			},0);
			_$.addEvent(star,"mouseout",function(){
				rating();
				if(me.point)
					me.rater.getElementsByTagName("span")[2].style.display = "none";
			},0);
		}
	};
	Rater.prototype.prompt = function(){
		this.point = 1;
		return this;
	};
	Rater.ajax = function(url,fn){
		_$.ajax(url,function(response,xhr){
			var res = _$.parseJSON(response);
			if(!res){
				alert("not data!");
				return;
			}
			fn && fn(res);
		});
	};
})(this,document);