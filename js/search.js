// build time:Sat Jan 25 2020 19:10:48 GMT+0700 (Indochina Time)
var searchFunc=function(e,t,a){"use strict";var r="<i id='local-search-close'></i>";var l="<span>"+$("#local-search-result").data("start")+"</span>",s="<span class='local-search-empty'>"+$("#local-search-result").data("initialise")+"<span>",i="<span class='local-search-empty'>"+$("#local-search-result").data("empty")+"<span>";var c=document.getElementById(t);var n=document.getElementById(a);n.innerHTML=r+"<ul>"+s+"</ul>";$.ajax({url:e,dataType:"xml",success:function(e){var t=$("entry",e).map(function(){return{title:$("title",this).text(),content:$("content",this).text(),url:$("url",this).text()}}).get();n.innerHTML="";c.addEventListener("input",function(){var e='<ul class="search-result-list">';var a=this.value.trim().toLowerCase().split(/[\s\-]+/);n.innerHTML="";if(this.value.trim().length<=0){$("#local-search-result").html(l);return}t.forEach(function(t){var r=true;var l=[];if(!t.title||t.title.trim()===""){t.title="Untitled"}var s=t.title.trim();var i=s.toLowerCase();var c=t.content.trim().replace(/<[^>]+>/g,"");var n=c.toLowerCase();var u=t.url;var o=-1;var h=-1;var f=-1;if(n!==""){a.forEach(function(e,t){o=i.indexOf(e);h=n.indexOf(e);if(o<0&&h<0){r=false}else{if(h<0){h=0}if(t==0){f=h}}})}else{r=false}if(r){e+="<li><a href='"+u+"' class='search-result-title posttitle' target='_blank'>"+s+"</a>";var v=c;if(f>=0){var p=f-20;var m=f+80;if(p<0){p=0}if(p==0){m=100}if(m>v.length){m=v.length}var d=v.substr(p,m);a.forEach(function(e){var t=new RegExp(e,"gi");d=d.replace(t,'<em class="search-keyword">'+e+"</em>")});e+='<p class="search-result">'+d+"...</p>"}e+="</li>"}});e+="</ul>";if(e.indexOf("<li>")===-1){n.innerHTML=r+"<ul>"+i+"</ul>";return}n.innerHTML=r+e})}});$(document).on("click","#local-search-close",function(){$("#local-search-input").val("");$("#local-search-result").html(l)})};var getSearchFile=function(){var e="/search.xml";searchFunc(e,"local-search-input","local-search-result")};
//rebuild by neat 