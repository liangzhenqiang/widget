if(!window.onhashchange){
	(function($){
		function History(){
			this.listener = null;
			this.iframe = null;
			this.init();
		}
		~(function(){
			var flag = false,
				me = this;
			this.init = function(){
				if (_$.browser.ie && _$.browser.ie < 8) {
					var f = document.createElement("iframe");
					//alert(document.body);
					document.body.appendChild(f);
					me.iframe = f;
					me.makeHistory();
					me.hashchange = function(){
						if (flag) {
							flag = false;
							return;
						}
						me.fire();
					}
				}
			};
			this.makeHistory = function(url) {
				if (!url) {
					return ;
				}
				var frameDoc = me.iframe.contentWindow.document;
				frameDoc.open();
				frameDoc.write([
					"<html>",
						"<head>",
							"<script type='text/javascript'>",
								"function pageLoaded() {",
									"try {top.window._$.hash.fireOnHashChange(\""+url+"\");} catch(ex) {}",
								"}",
							"</script>",
						"</head>",
						"<body onload='pageLoaded();'>",
							"<input type='value' value='"+url+"' id='history' size='100' />",
						"</body>",
					"</html>"
				].join(""));
				frameDoc.close();
			};
			this.fireOnHashChange = function(url) {
				location.hash = "#" + url.replace(/^#/, "");
				if (me.hashchange) {
					me.hashchange();
				}
			};
			this.add = function(url) {
				flag = true;
				if (_$.browser.ie && _$.browser.ie < 8) {
					me.makeHistory(url);
				}
			};
			this.fire = function(url) {
				if (!url) {
					url = document.location.hash.slice(1);
				}
				me.listener(url);
			};
			this.change = function(fn) {
				me.listener = typeof fn === 'function' ? fn : function() {};
			};
		}).call(History.prototype);
		//window.attachEvent("onload",function(){
			$.hash =  History;
		//});
	})(_$);
}