/*!
* TabPanel Javascript Widget
* Author: flyend
* Contact: flyend@126.com(e-mail), 269644230(qq)
* Date: Wed Oct 2012
*/
(function(window,document){
	var d = document, that = window;
	if(!_$.hasOwnProperty("TabPanel")){
		_$["TabPanel"] = TabPanel;
	}
	function TabPanel(opt){
		this.tabpanel = null;
		
		this.create = function(){
			this.tabpanel = d.createElement("div");
			this.tabpanel.className = "tab-panel";
			return this.tabpanel;	
		};
		this.id = function(id){
			this.tabpanel.setAttribute("id",id);
			return this;
		};
		this.getContext = function(){
			return this.tabpanel || this.create();
		};
		if(!this.tabpanel){
			this.tabpanel = this.create();
		}
		this.init(opt);
		return this;
	}
	TabPanel.prototype.init = function(opt){
		this.makeNavigation(opt).makePanel(opt);
	};
	TabPanel.prototype.appendTo = function(el){
		el.appendChild(this.tabpanel || this.getContext());
		return this;
	};
	TabPanel.prototype.makeNavigation = function(opt){
		var tabpanel = this.tabpanel || this.getContext(),
			nav = opt.nav;
		tabpanel.index = opt.show | 0;
		if(nav){
			tabpanel.appendChild(TabPanel.create.nav(opt,nav));
		}
		return this;
	};
	TabPanel.prototype.makePanel = function(opt){
		var tabpanel = this.tabpanel || this.getContext(),
			nav = opt.nav;
		tabpanel.appendChild(TabPanel.create.panel(nav,opt));
		return this;
	};
	TabPanel.prototype.bind = function(type,fn){
		var tabpanel = this.tabpanel || this.getContext(),
			arr = [tabpanel.index],
			me = this;
		_$(tabpanel).find(".tab-nav").find("li").bind(type,function(){
			arr.unshift(this.index);
			if(arr.length > 1){
				var prev = arr.pop();
				_$(_$(tabpanel).find(".tab-nav").find("li")[prev]).removeClass("active");
				_$(_$(tabpanel).find(".tab-content").find(".tab-pane")[prev]).removeClass("active");
			}
			_$(this).addClass("active");
			_$(_$(tabpanel).find(".tab-content").find(".tab-pane")[this.index]).addClass("active");
			fn && fn(this,me,this.index);
		});
	};
	TabPanel.prototype.getActive = function(){
			
	};
	TabPanel.create = {
		nav: function(opt,nav){
			var tabnav = d.createElement("ul"),
				index = opt.show || 0;
			tabnav.className = "tab-nav";
			for(var i = 0, len = nav.length; i ^ len; i++){
				var name = nav[i],
					item = d.createElement("li"),
					link = d.createElement("a");
				item.index = i;
				if(index == i)
					item.className = "active";
				link.href = "javascript:void(0);";
				link.appendChild(d.createTextNode(name["name"] || "未命名"));
				item.appendChild(link);
				tabnav.appendChild(item);
			}
			return tabnav;
		},
		panel: function(nav,opt){
			var navcontent = d.createElement("div"),
				index = opt.show || 0,
				len = nav.length;
			navcontent.className = "tab-content";
			for(var i = 0; i ^ len; i++){
				var content = nav[i].content,
					panel = d.createElement("div");
				panel.className = "tab-pane";
				if(index == i)
					_$(panel).addClass("active");
				if(typeof content === "string"){
					var ifrm = d.createElement("iframe");
					ifrm.src = content;
					panel.appendChild(ifrm);
				}
				else{
					panel.appendChild(content);
				}
				navcontent.appendChild(panel);
			}
			return navcontent;
		}
	};
})(this,document);