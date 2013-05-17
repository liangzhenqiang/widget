<%@ page contentType="text/html; charset=utf-8" pageEncoding="utf-8" %>
<%
	StringBuilder sb = new StringBuilder();
	if(request.getParameter("page").equals("1")){
		String s = "";
		String[] arr = {
			"http://cued.xunlei.com/demos/publ/images/YqIUYxcWnDr.jpg",
			"http://cued.xunlei.com/demos/publ/images/uzEDkvAA.jpg",
			"http://cued.xunlei.com/demos/publ/images/ZNzPHxdixsN.jpg",
			"http://cued.xunlei.com/demos/publ/images/aGlMTQO.jpg",
			"http://cued.xunlei.com/demos/publ/images/ahmTnlSbuDrMA.jpg",
			"http://cued.xunlei.com/demos/publ/images/aiPNkRa.jpg",
			"http://cued.xunlei.com/demos/publ/images/aiqLnoSJkx.jpg",
			"http://cued.xunlei.com/demos/publ/images/bj+bvzzQrvlHJZv.jpg",
			"http://cued.xunlei.com/demos/publ/images/bkDVCeCPWSx.jpg",
			"http://cued.xunlei.com/demos/publ/images/bkIWlqVrarRHJZvp.jpg",
			"http://cued.xunlei.com/demos/publ/images/bosZRjcuedfNvRHJZv.jpg",
			"http://img.tuli.com/kwfs/AAAd8wAAAEMAAicO",
			"http://img.tuli.com/kwfs/AAAd8gAAAkYAAicO"
		};
		String[] height={"126","129","142","285","190","243","264","244","272","269","290","294","240"};
		int len = arr.length;
		s += "[";
		for(int i = 0; i < len; i++){
			s += "{";
			s += "\"src\": " + "\"" + arr[i] + "\",";
			s += "\"height\": " + "\"" + height[i] +"\"";
			s += "}";
			if((i ^ len-1) != 0)
				s += ",";
		}
		s += "]";
		sb.append(s);
		out.println(sb.toString());
	}
%>