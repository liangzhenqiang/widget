<%@ page contentType="text/html;charset=utf-8" %>
<%
	request.setCharacterEncoding("utf-8");
	StringBuffer sb = new StringBuffer();
	String score = request.getParameter("score");
	String sum = request.getParameter("sum");
	if(score != null && !score.equals("")){
		out.println("{\"sum\":25,\"count\":5, \"flag\": 0, \"score\":" + score + "}");
	}
	if(sum != null){
		if(request.getParameter("count") != null)
			out.println("{\"data\": " + sum + ", \"msg\":\"success\"}");
	}
%>