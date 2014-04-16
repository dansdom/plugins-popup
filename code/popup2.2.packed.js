/*
	jQuery Popup Plugin 
	Copyright (c) 2011 Daniel Thomson
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/
(function(a){a.Popup=function(b,e,d){this.el=a(e);this.namespace="popup";this.opts=a.extend(!0,{},a.Popup.settings,b);this.init();"function"===typeof d&&d.call()};a.Popup.settings={transparentLayer:!0,transparentOpacity:70,gallery:!1,galleryCounter:!1,titleHeight:30,controlHeight:40,imageDesc:!1,autoSize:!0,boxWidth:400,boxHeight:300,centerImage:!0,shadowLength:42,transition:500,popupID:"popupBox",contentClass:"popupContent",closeBox:"popupClose",hasCloseButton:!0,centerOnResize:!0,loaderPath:"loader.gif", overflow:"visible",ajax:!1,ajaxType:"text",fixedTop:!1,fixedLeft:!1,onOpen:function(){},onClose:function(){}};a.Popup.prototype={init:function(){console.log("init popup");var b=this;this.destroy();this.el.isOpen=!1;this.el.boxSrc=this.el.attr("name");this.opts.gallery||(this.fragment=a(this.el.boxSrc));this.el.closeBtn=this.opts.hasCloseButton?'<a href="" class="'+this.opts.closeBox+'">close</a>':"";a(this.el).on("click."+this.namespace,function(a){a.preventDefault();b.openBox()})},findScreenPos:function(){var b= {},e=a(window);b.winY=e.height();b.winX=e.width();b.scrY=e.scrollTop();b.scrX=e.scrollLeft();return b},createBox:function(){var b=this,e,d;0===a("#"+this.opts.popupID).length&&(e='<div id="'+this.opts.popupID+'"><table cellpadding="0" cellspacing="0"><tbody><tr class="popupTop"><td class="popupTL corner pngbg"></td><td class="popupTM pngbg"></td><td class="popupTR corner pngbg"></td></tr><tr class="popupMid"><td class="popupML pngbg"></td><td class="'+this.opts.contentClass+'"></td><td class="popupMR pngbg"></td></tr><tr class="popupBot"><td class="popupBL corner pngbg"></td><td class="popupBM pngbg"></td><td class="popupBR corner pngbg"></td></tr></tbody></table></div>', a("body").append(e),a("#"+this.opts.popupID).css("display","none"));!0===this.opts.transparentLayer&&0===a(".transparency").length&&(e='<div class="transparency" style="z-index:99;background:#000;opacity:'+this.opts.transparentOpacity/100+";filter:alpha(opacity = "+this.opts.transparentOpacity+');top:0;left:0;position:absolute"></div>',a("body").append(e),a(window).bind("scroll."+this.namespace,function(){d=b.findScreenPos();a(".transparency").css({height:d.winY+d.scrY,width:d.winX+d.scrX})}),a(window).bind("resize."+ this.namespace,function(){d=b.findScreenPos();a(".transparency").css({height:d.winY+d.scrY+"px",width:d.winX+d.scrX+"px"})}));!1===this.opts.transparentLayer&&0<a(".transparency").length&&a(".transparency").remove();a(document).bind("keydown."+this.namespace,function(a){27==a.keyCode&&!0===b.el.isOpen&&b.closeBox()});a(".transparency").bind("click."+this.namespace,function(){!0===b.el.isOpen&&b.closeBox()});a("#"+this.opts.popupID+" ."+this.opts.contentClass).children().remove();d=this.findScreenPos(); a(".transparency").css({display:"block",filter:"alpha(opacity = "+this.opts.transparentOpacity+")",opacity:this.opts.transparentOpacity/100,height:d.winY+d.scrY+"px",width:d.winX+d.scrX+"px"})},styleBox:function(b,e){var d=this,c="#"+this.opts.popupID,f="."+this.opts.contentClass+" img",g,k,l,h,n,p,m,q,r;e&&(a(f).attr("src",e.src),a(f).attr("height",b.imgHeight+"px"),a(f).attr("width",b.imgWidth+"px"));b?(f=b.imgHeight+this.opts.titleHeight+this.opts.controlHeight,g=b.imgWidth,!1===this.opts.autoSize&& (f=this.opts.boxHeight+this.opts.titleHeight+this.opts.controlHeight,g=this.opts.boxWidth)):(f=this.opts.boxHeight,g=this.opts.boxWidth);k=g+2*this.opts.shadowLength;l=f+2*this.opts.shadowLength;m=d.findScreenPos();h=this.centerBox(m,k,l);this.opts.fixedTop&&(h.topPos=this.opts.fixedTop);this.opts.fixedLeft&&(h.leftPos=h.fixedLeft);p=h.topPos;n=h.leftPos;!0===this.opts.centerOnResize&&a(window).bind("resize."+this.namespace,function(){m=d.findScreenPos();h=d.centerBox(m,k,l);d.opts.fixedTop&&(h.topPos= d.opts.fixedTop);d.opts.fixedLeft&&(h.leftPos=h.fixedLeft);a(c).css({top:h.topPos+"px",left:h.leftPos+"px"})});"block"===a(c).css("display")&&b&&!0===this.opts.autoSize?(q=parseFloat(a(c).css("height"))-2*this.opts.shadowLength-(this.opts.titleHeight+this.opts.controlHeight),r=parseFloat(a(c).css("width"))-2*this.opts.shadowLength,a(c+" .galleryTitle").css({height:this.opts.titleHeight+"px"}),a(c+" .galleryControls").css({height:this.opts.controlHeight+"px",overflow:this.opts.overflow}),a(c+" img").css({height:q+ "px",width:r+"px"}),a(c+" .imgPane").css({width:"100%"}),a(c+" img").animate({height:b.imgHeight+"px",width:b.imgWidth+"px"},{queue:!1,duration:this.opts.transition}),a(c).animate({height:l+"px",width:k+"px",left:n+"px",top:p+"px"},{queue:!1,duration:this.opts.transition}),a(c+" .imgPane").animate({height:f-this.opts.titleHeight-this.opts.controlHeight+"px"},{queue:!1,duration:this.opts.transition}),a(c+" .popupContent").animate({height:f+"px",width:g+"px"},{queue:!1,duration:this.opts.transition}), a(c+" .popupTM, "+c+" .popupBM").animate({width:b.imgWidth+"px"},{queue:!1,duration:this.opts.transition})):(a(c).css({height:l+"px",width:k+"px",position:"absolute","z-index":100,overflow:this.opts.overflow}),a(c+" .imgPane").css({height:f-this.opts.titleHeight-this.opts.controlHeight+"px"}),a(c+" .popupContent").css({height:f+"px",width:g+"px"}),a(c+" .popupML div, "+c+" .popupMR div").css({height:f+"px"}),a(c+" .galleryTitle").css({height:this.opts.titleHeight+"px",overflow:this.opts.overflow}), a(c+" .galleryControls").css({height:this.opts.controlHeight+"px",overflow:this.opts.overflow}),a(c+" .corner").css({height:this.opts.shadowLength+"px",width:this.opts.shadowLength+"px"}),a(c+" .popupTM").css({height:this.opts.shadowLength+"px",width:g+"px"}),a(c+" .popupBM").css({height:this.opts.shadowLength+"px",width:g+"px"}),a(c).css({left:n+"px",top:p+"px"}));a(c).fadeIn("slow")},centerBox:function(a,e,d){var c={};c.leftPos=(a.winX-e)/2+a.scrX;c.topPos=(a.winY-d)/2+a.scrY;0>c.topPos&&(c.topPos= 0);0>c.leftPos&&(c.leftPos=0);return c},isContentImage:function(){var a=this.el.boxSrc.split(".");switch(a[a.length-1]){case "jpg":a=!0;break;case "gif":a=!0;break;case "png":a=!0;break;case "bmp":a=!0;break;default:a=!1}return a},displayImage:function(){var b=this,e="#"+this.opts.popupID+" ."+this.opts.contentClass;a(e).append('<div class="imgPane"><img class="loader" src="'+this.opts.loaderPath+'" width="" height="" alt="" /></div>');!0===this.opts.imageDesc&&a(".imgPane").css("position","relative").append('<div class="imageDesc" style="position:absolute;bottom:0;left:0;width:100%;background:#000;opacity:0.8;filter:alpha(opacity = 80);">'+ this.el.imageDesc+"</div>");!1===this.opts.autoSize&&!0===this.opts.centerImage&&(a(e+" .imgPane").prepend("<span style='display:inline-block;height:"+this.opts.boxHeight+"px;line-height:"+this.opts.boxHeight+"px;width:1px'>&nbsp;</span>"),a(e+" .imgPane").css({"line-height":this.opts.boxHeight+"px","text-align":"center"}),a(e+" .imgPane img").css({display:"inline","vertical-align":"middle"}));if(!0===this.opts.gallery)if(!1!==this.el.galleryTitle){if(a(e).append('<div class="galleryControls"><a href="" class="prev">previous</a><a href="" class="next">next</a></div>'), a(e).prepend('<div class="galleryTitle"><h2>'+this.el.galleryTitle+"</h2>"+this.el.closeBtn+"</div>"),!0===this.opts.galleryCounter){var d=a("*[title='"+this.el.galleryTitle+"']").index(this.el)+1,c=a("*[title='"+this.el.galleryTitle+"']").length;a(e).find(".galleryControls").append("<p class='galleryCounter'>Displaying "+d+" of "+c+"</p>")}}else a(e).prepend('<div class="galleryTitle">'+this.el.closeBtn+"</div>");var f=new Image,g={};f.onload=function(){g.imgHeight=f.height;g.imgWidth=f.width;b.styleBox(g, f)};f.src=this.el.boxSrc;this.addCloseButton();this.addGalleryControls()},styleNodeBox:function(){console.log(this.fragment);a("#"+this.opts.popupID+" ."+this.opts.contentClass+" img.loader").remove();a("#"+this.opts.popupID+" ."+this.opts.contentClass).append('<div class="galleryTitle">'+this.el.closeBtn+"</div>");a("#"+this.opts.popupID+" ."+this.opts.contentClass).append(this.fragment);a("#"+this.opts.popupID+" ."+this.opts.contentClass+" "+this.el.boxSrc).css("display","block");this.styleBox(); this.addCloseButton()},getAjaxContent:function(){var b=this;a("#"+this.opts.popupID+" ."+this.opts.contentClass).html('<img class="loader" src="'+this.opts.loaderPath+'" width="" height="" alt="" />');a.ajax({url:b.el.boxSrc,dataType:b.opts.ajaxType,success:function(a){b.fragment=a;b.styleNodeBox()},error:function(){b.fragment="ajax request failed";b.styleNodeBox()}})},addGalleryControls:function(){var b=this;a("#"+this.opts.popupID+" .next").bind("click."+this.namespace,function(){b.cycleImage(1); return!1});a("#"+this.opts.popupID+" .prev").bind("click."+this.namespace,function(){b.cycleImage(-1);return!1});a(document).bind("keydown."+this.namespace,function(a){39==a.keyCode&&!0===b.el.isOpen?b.cycleImage(1):37==a.keyCode&&!0===b.el.isOpen&&b.cycleImage(-1);27==a.keyCode&&!0===b.el.isOpen&&b.closeBox()})},addCloseButton:function(){var b=this;a("#"+b.opts.popupID+" ."+b.opts.closeBox).bind("click."+b.namespace,function(){!0===b.el.isOpen&&b.closeBox();return!1})},openBox:function(){this.el.galleryTitle= a(this.el).attr("title");this.el.imageDesc=a(this.el).attr("longdesc");this.createBox();var b=this.findScreenPos();this.el.winY=b.winY;this.el.winX=b.winX;this.el.scrY=b.scrY;this.el.scrX=b.scrX;this.isContentImage()?this.displayImage():!0===this.opts.ajax?this.getAjaxContent():this.styleNodeBox();if(!1===this.el.isOpen)this.opts.onOpen();this.el.isOpen=!0},closeBox:function(){a("#"+this.opts.popupID).stop().fadeOut("slow").css("display","none");a("#"+this.opts.popupID).remove();a(".transparency").fadeOut("slow"); if(!0===this.el.isOpen)this.opts.onClose();a(document).unbind("keydown."+this.namespace);this.el.isOpen=!1},cycleImage:function(b){var e=a("*[title='"+this.el.galleryTitle+"']").index(this.el),d=a("*[title='"+this.el.galleryTitle+"']").length;b=e+b;0>b&&(b=d-1);b==d&&(b=0);this.el.isOpen=!1;a(document).unbind("keydown."+this.namespace);a("*[title='"+this.el.galleryTitle+"']:eq("+b+")").popup("openBox")},option:function(b){this.opts=a.extend(!0,{},this.opts,b)},changeContent:function(b){this.fragment= a(b)},destroy:function(){this.el.unbind("."+this.namespace)}};a.fn.popup=function(b,e){var d;"string"===typeof b?(d=Array.prototype.slice.call(arguments,1),this.each(function(){var c=a.data(this,"popup");c?a.isFunction(c[b])&&"_"!==b.charAt(0)?c[b].apply(c,d):alert("the plugin contains no such method: "+b):alert("The plugin has not been initialised yet when you tried to call this method: "+b)})):this.each(function(){var c=a.data(this,"popup");c?c.option(b):a.data(this,"popup",new a.Popup(b,this,e))}); return this}})(jQuery);
