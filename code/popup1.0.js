/*
	jQuery Popup Plugin
	Copyright (c) 2011 Daniel Thomson
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/

// release notes: version 1.0
// version 1.1 - added support for gallery on non img object, now it just has to have the gallery name in the title attribute
//			   - about to add the option for image caption
//			   - also about to add option for gallery counter
// level of error suppresion -> low
// This module is designed as a popup function to use whenever and wherever you might need a popup. call this module on any DOM element you wish like this:
// $(document).ready(function(){
//    			$(".yourClassNameHere").popup({
//					plugin : options,
//					go : here
//				})
//         });
//
//  You can link multiple popup items together to form a 'gallery'. to do this you need to set the option 'gallery' to true. Also you need to set
//  the title attribute of the DOM element to the gallery name that you want. All other DOM elements with the same class and title attribute will
//  be linked into the navigation structure of this gallery, and the title of this gallery will be displayed above the image in the popup box.
//  galllery navigation is also bound to the left and right arrow keys on the keyboard
//  the link to the popup goes onto the name attribute
//  You can also control the height and width of the navigation box and title box with the following options:
//  galleryTitleHeight, galleryControlHeight
//
//  Other interesting options avaliable:
//  autoSize: 								allows the box to expand and contract to the image size with an animation of the length: transition
//  centerOnResize: 						will center the popup when you resize the browser window
//  popupClass, contentClass, closeBox: 	allows custom classes for these DOM element just in case you need them for your application
//  shadowLength: 							the box itself has a structure around it to allow for custom drop shadows.
//											This value adjusts the size of this 'outer' layer of the box
//  boxWidth, boxHeight:					Sets the dimensions of the box if autoSize is false, and if content node is not an image
//


(function($){

	$.fn.popup = function(config)
	{
		// config - default settings
		var settings = {
							'transparentLayer' : true,			// would you like a transparent layer underneath the popup?
							'gallery' : false,  				// set true for navigation options between popups of the same title attribute
							'galleryTitleHeight' : 30,  		// height in pixels of the gallery title box
							'galleryControlHeight' : 40,  		// height in pixels of the gallery navigation box
							'autoSize' : true,  				// set whether the box with image in it will resize to the image size
							'boxWidth' : 400,					// when autoSize is set to false, or no image then set the dimensions of the box in pixels
							'boxHeight' : 300,					// when autoSize is set to false, or no image then set the dimensions of the box in pixels
							'centerImage' : true,
							'shadowLength' : 42,            	// set the width of the padding around the box for your drop shadows
							'transition' : 500, 				// transition speed from one box to the next
							'popupClass' : "popupBox",  		// custom class for the popup box
							'contentClass' : "popupContent",	// custom class for the popup content
							'closeBox' : "popupClose",  		// class the close button has
							'centerOnResize' : true				// set whether the box centers itself when the browser resizes
					   };

		// if settings have been defined then overwrite the default ones
		if (settings) $.extend(settings, config);
		
		// iterate over each object that calls the plugin and do stuff
		this.each(function(){
			// do pluging stuff here
			// each box calling the plugin now has the variable name: myPopup
			var myPopup = $(this);

			$(myPopup).click(function()
			{
				// *** set content source and gallery title variables ***
                myPopup.boxSrc = $(this).attr("name");
                myPopup.galleryTitle = $(this).attr("title");

                // *** create the markup for popup box ***
                $.fn.popup.createBox(settings);

                // *** find the screen dimensions ***
                var dimensions = $.fn.popup.findScreenPos();
                myPopup.screenHeight = dimensions.screenHeight;
                myPopup.screenWidth = dimensions.screenWidth;
                myPopup.scrollHeight = dimensions.scrollHeight;
                myPopup.scrollWidth = dimensions.scrollWidth;

				// *** either display content as an image OR as a DOM node ***
                if ($.fn.popup.isContentImage(myPopup))
				{
					// find the index of this image in the gallery
					$.fn.popup.displayImage(myPopup,settings);
				}
				else
				{
					$.fn.popup.styleNodeBox(myPopup,settings);
				}
      			return false;

   			});
			// end of plugin stuff
		});

		// return jQuery object
		return this;
	}


	//////////////////////////////
	// Private Functions		//
	//////////////////////////////

	// ******  find the screen height and width measurements to position box in (go IE!)  ******
	$.fn.popup.findScreenPos = function()
	{
		var dimensions = {};
		if (typeof(window.innerHeight) == 'number')
   		{
   	  	    dimensions.screenHeight = window.innerHeight;
   	  	    dimensions.screenWidth = window.innerWidth;
   	  	    dimensions.scrollHeight = window.pageYOffset;
   	  	    dimensions.scrollWidth = window.pageXOffset;
  		}
   		else
   		{
   	  	 	if (document.documentElement && document.documentElement.clientHeight)
	  		{
 	   	 	    dimensions.screenHeight = document.documentElement.clientHeight;
 	   	 		dimensions.screenWidth = document.documentElement.clientWidth;
 	   	 		dimensions.scrollHeight = document.documentElement.scrollTop;
 	   	 		dimensions.scrollWidth = document.documentElement.scrollLeft;
	  		}
 	  		else
	  		{
 	   	  	 	if (document.body && document.body.clientHeight)
	  	  		{
 	   	   	 	   	dimensions.screenHeight = document.body.clientHeight;
 	   	 	 		dimensions.screenWidth = document.body.clientWidth;
 	   	 	 		dimensions.scrollHeight = document.body.scrollTop;
 	   	 	 		dimensions.scrollWidth = document.body.scrollLeft;
 	  	  		}
 	  		}
   		}
   		return dimensions;
	}


	// ******  create the markup for the popup box  ******
	$.fn.popup.createBox = function(opts)
	{
		if ($("."+opts.popupClass).length == 0)
  		{
			var popupBox = '<div class="'+opts.popupClass+'"><div class="popupTop"><div class="popupTL corner"></div><div class="popupTM"></div><div class="popupTR corner"></div></div><div class="popupMid"><div class="popupML"></div><div class="'+opts.contentClass+'"><p>something</p></div><div class="popupMR"></div></div><div class="popupBot"><div class="popupBL corner"></div><div class="popupBM"></div><div class="popupBR corner"></div></div></div>';
			$("body").append(popupBox);
			$("."+opts.popupClass).css("display","none");
			// add transparency layer if transparency is true.
			if (opts.transparentLayer == true && $(".transparency").length == 0)
			{
			   	var transparentLayer = '<div class="transparency" style="z-index:99;background:#000;opacity:0.5;filter:alpha(opacity = 50);height:100%;width:100%;top:0;left:0;position:absolute"></div>';
				$("body").append(transparentLayer);                   
				// add event listeners for browser resizing and scrolling to adjust the transparent layer size
				window.onscroll = function(){
					var dimensions = $.fn.popup.findScreenPos();
					$(".transparency").css({height:dimensions.screenHeight + dimensions.scrollHeight,width:dimensions.screenWidth + dimensions.scrollWidth});
				}
				window.onresize = function(){
					var dimensions = $.fn.popup.findScreenPos();
					$(".transparency").css({height:dimensions.screenHeight + dimensions.scrollHeight,width:dimensions.screenWidth + dimensions.scrollWidth});
				}
			}
        }
        // add event handling for closing box
        document.onkeydown = function(e)
		{
			var keycode;
			if (window.event)
			{
				keycode = window.event.keyCode;
			}
			else if (e)
			{
				keycode = e.which;
			}
			if (keycode == 27)
			{
			 	$("."+opts.popupClass).stop().fadeOut("slow").css("display","none");
        		$(".transparency").fadeOut("slow");
			}
		}

        $(".transparency").click(function(){
					$(this).fadeOut("slow");
					$("."+opts.popupClass).fadeOut("slow");
				});
        // clear box of any content
        $("."+opts.popupClass+" ."+opts.contentClass).children().remove();
        $(".transparency").css({"display":"block","filter":"alpha(opacity = 50)"});
	}


	// ******  display the popup box  ******
	$.fn.popup.styleBox = function(popup,opts,properties,image)
	{
		var popupSelector = "."+opts.popupClass;
		var contentSelector = "."+opts.contentClass;
		var imgSelector = contentSelector+" img";
		if (image)
		{
		   $(imgSelector).attr("src",image.src);
		   $(imgSelector).attr("height",properties.imgHeight);
		   $(imgSelector).attr("width",properties.imgWidth);
		}
		if (properties)
		{
		   var contentHeight = properties.imgHeight + opts.galleryTitleHeight + opts.galleryControlHeight;
		   var contentWidth = properties.imgWidth;
		   if (opts.autoSize == false)
		   {
		   	  contentHeight = opts.boxHeight + opts.galleryTitleHeight + opts.galleryControlHeight;
		   	  contentWidth = opts.boxWidth;
		   }
		}
		else 
		{
			var contentHeight = opts.boxHeight;
			var contentWidth = opts.boxWidth;
		}

		var outerBoxWidth = contentWidth + (opts.shadowLength*2);
		var outerBoxHeight = contentHeight + (opts.shadowLength*2);

		// calculate absolute position of the box and then center it on the screen
		var boxPos = $.fn.popup.centerBox(popup,outerBoxWidth,outerBoxHeight);
		var leftPos = boxPos.leftPos;
		var topPos = boxPos.topPos;

		// on window resize - center the box in the middle again
		if (opts.centerOnResize == true)
   		{
   		   	window.onresize = function()
			{
				var dimensions = $.fn.popup.findScreenPos();
				var boxPos = $.fn.popup.centerBox(dimensions,outerBoxWidth,outerBoxHeight);
				$(popupSelector).css({top:boxPos.topPos,left:boxPos.leftPos});
			}
		}

   		// claculate dimensions of popup
   		// animate to the correct size if it is already open, else just set the values
   		if ($(popupSelector).css("display") == "block" && properties && opts.autoSize == true)
   		{
			// I get the feeling that I don't need half of the shit that's in this if statement - will look at it later
			var oldBoxHeight = parseFloat($(popupSelector).css("height")) - (opts.shadowLength*2) - (opts.galleryTitleHeight + opts.galleryControlHeight);
			var oldBoxWidth = parseFloat($(popupSelector).css("width")) - (opts.shadowLength*2);
			$(popupSelector+" img").css({height:oldBoxHeight,width:oldBoxWidth}); 
			$(popupSelector+" img").animate({height:properties.imgHeight,width:properties.imgWidth}, opts.transition);
            $(popupSelector).animate({height:outerBoxHeight,width:outerBoxWidth}, {queue:false,duration:opts.transition});
            $(popupSelector+" .popupContent").animate({height:contentHeight,width:contentWidth}, {queue:false,duration:opts.transition});
            $(popupSelector+" .galleryTitle").css({height:opts.galleryTitleHeight});
            $(popupSelector+" .galleryControls").css({height:opts.galleryControlHeight,"overflow":"hidden"});
            $(popupSelector+" .imgPane").animate({height:(contentHeight - opts.galleryTitleHeight - opts.galleryControlHeight)}, {queue:false,duration:opts.transition});
            $(popupSelector+" .popupMid").animate({height:contentHeight}, {queue:false,duration:opts.transition});
            $(popupSelector+" .popupML").animate({height:contentHeight,width:opts.shadowLength}, {queue:false,duration:opts.transition});
            $(popupSelector+" .popupMR").animate({height:contentHeight,width:opts.shadowLength}, {queue:false,duration:opts.transition});
            $(popupSelector+" .popupTop").animate({height:opts.shadowLength,width:outerBoxWidth}, {queue:false,duration:opts.transition});
            $(popupSelector+" .popupBot").animate({height:opts.shadowLength,width:outerBoxWidth}, {queue:false,duration:opts.transition});
            $(popupSelector+" .corner").animate({height:opts.shadowLength,width:opts.shadowLength}, {queue:false,duration:opts.transition});
            $(popupSelector+" .popupTM").animate({height:opts.shadowLength}, {queue:false,duration:opts.transition});
            $(popupSelector+" .popupBM").animate({height:opts.shadowLength}, {queue:false,duration:opts.transition});
   			$(popupSelector+" .popupTM").css("margin","0 "+opts.shadowLength+"px");
   			$(popupSelector+" .popupBM").css("margin","0 "+opts.shadowLength+"px");
   			$(popupSelector).animate({"left":leftPos,"top":topPos}, {queue:false,duration:opts.transition});


		}
		// create box and set its dimensions
		else
		{
   			$(popupSelector).css({height:outerBoxHeight,width:outerBoxWidth,"position":"absolute","z-index":100,"overflow":"hidden"});
   			$(popupSelector+" .popupContent").css({height:contentHeight,width:contentWidth,"overflow":"hidden","float":"left"});
   			$(popupSelector+" .galleryTitle").css({height:opts.galleryTitleHeight,"overflow":"hidden","position":"relative"});
   			$(popupSelector+" .galleryControls").css({height:opts.galleryControlHeight,"overflow":"hidden"});
   			$(popupSelector+" .imgPane").css({height:(contentHeight - opts.galleryTitleHeight - opts.galleryControlHeight)});
   			$(popupSelector+" .popupMid").css({height:contentHeight});
   			$(popupSelector+" .popupML").css({height:contentHeight,width:opts.shadowLength,"position":"relative","float":"left"});
   			$(popupSelector+" .popupMR").css({height:contentHeight,width:opts.shadowLength,"position":"relative","float":"left"});
   			$(popupSelector+" .popupTop").css({height:opts.shadowLength,width:outerBoxWidth,"position":"relative"});
   			$(popupSelector+" .popupBot").css({height:opts.shadowLength,width:outerBoxWidth,"position":"relative","clear":"both"});
   			$(popupSelector+" .corner").css({height:opts.shadowLength,width:opts.shadowLength,"position":"absolute"});
   			$(popupSelector+" .popupTM").css({height:opts.shadowLength,"margin":"0 "+opts.shadowLength+"px"});
   			$(popupSelector+" .popupBM").css({height:opts.shadowLength,"margin":"0 "+opts.shadowLength+"px"});
            $(popupSelector+" .popupTL").css({"top":"0","left":"0"});
            $(popupSelector+" .popupTR").css({"top":"0","right":"0"});
            $(popupSelector+" .popupBL").css({"bottom":"0","left":"0"});
            $(popupSelector+" .popupBR").css({"bottom":"0","right":"0"});
   			$(popupSelector).css("left",leftPos);
   			$(popupSelector).css("top",topPos);
  		}

   		// this probably should go somewhere else - leaving it in for now not to confuse me :P
   		$(popupSelector).fadeIn("slow");
	}


	// function centers the box in the middle of the screen
	$.fn.popup.centerBox = function(dimensions,outerBoxWidth,outerBoxHeight)
	{
		this.leftPos = ((dimensions.screenWidth - outerBoxWidth) / 2) + dimensions.scrollWidth;
   		this.topPos = ((dimensions.screenHeight - outerBoxHeight) / 2) + dimensions.scrollHeight;
   		if (this.topPos < 0)
   		{
		   this.topPos = 0;
		}
		if (this.leftPos < 0)
		{
		   this.leftPos = 0;
		}
		return this;
	}


	// ******  find if the popup content is an image path  ******
	$.fn.popup.isContentImage = function(popup)
	{
		var contentString = popup.boxSrc.split(".");
		ext = contentString[contentString.length-1];
		var isImage;
		switch(ext)
		{
			case 'jpg': isImage = true;
				 		break;
			case 'gif': isImage = true;
				 		break;
			case 'png': isImage = true;
				 		break;
			case 'bmp': isImage = true;
				 		break;
			default: isImage = false;
		}
		return isImage;
	}
	

	// ******  display the popup image  ******
	$.fn.popup.displayImage = function(popup,opts)
	{
		// add the image tag to the popup content
		var contentSelector = "."+opts.popupClass+" ."+opts.contentClass;
		// add image markup to the popup box
		$(contentSelector).append('<div class="imgPane"><img src="" width="" height="" alt="" /></div>');
		// if gallery is a fixed height and width and centerImage = true, then align the image to the center of the box
		if (opts.autoSize == false && opts.centerImage == true)
		{
			$(contentSelector+" .imgPane").prepend("<span style='display:inline-block;height:"+opts.boxHeight+"px;line-height:"+opts.boxHeight+"px'>&nbsp;</span>");
			$(contentSelector+" .imgPane").css({"line-height":opts.boxHeight,"text-align":"center"});
			$(contentSelector+" .imgPane img").css({"display":"inline","vertical-align":"middle"});
		}
		if (opts.gallery == true)
		{
			// add gallery controls here
			if (popup.galleryTitle != false)
			{
				$(contentSelector).append('<div class="galleryControls"><ul><li><a href="" class="prev">previous</a></li><li><a href="" class="next">next</a></li></ul></div>');
				$(contentSelector).prepend('<div class="galleryTitle"><h2>'+popup.galleryTitle+'</h2><a href="" class="'+opts.closeBox+'">close</a></div>');
			}
			else
			{
				$(contentSelector).prepend('<div class="galleryTitle"><a href="" class="'+opts.closeBox+'">close</a></div>');
			}
		}

		// start of image loading stuff
      	var popUpImg = new Image();
      	var imgProperties = {};
      	popUpImg.onload = function()
      	{
         	imgProperties.imgHeight = popUpImg.height;
        	imgProperties.imgWidth = popUpImg.width;
        	$.fn.popup.styleBox(popup,opts,imgProperties,popUpImg);
      	};
      	popUpImg.src = popup.boxSrc;
      	// end of image stuff
      	
      	//  add close button controls
        $.fn.popup.addCloseButton(popup,opts)
      	// add gallery controls and key functions here
      	$.fn.popup.addGalleryControls(popup,opts);
	}
	

	// ******  display the content if NOT an image  ******
	$.fn.popup.styleNodeBox = function(popup,opts)
	{
		var boxContent = $(popup.boxSrc).clone();
		$("."+opts.popupClass+" ."+opts.contentClass).append('<div class="galleryTitle"><a href="" class="'+opts.closeBox+'">close</a></div>');
		$("."+opts.popupClass+" ."+opts.contentClass).append(boxContent);
		$("."+opts.popupClass+" ."+opts.contentClass+" "+popup.boxSrc).css("display","block");
		// do I need this 'properties' object?!?
		// properties = {};
		// properties.contentHeight = opts.boxHeight;
		// properties.contentWidth = opts.boxWidth;
		$.fn.popup.styleBox(popup,opts);
		//  add close button controls
        $.fn.popup.addCloseButton(popup,opts)
	}

	
	// *******  add controls for the image gallery  ******
	$.fn.popup.addGalleryControls = function(popup,opts)
	{
		$("."+opts.popupClass+" .next").click(function(){
			$.fn.popup.cycleImage(popup,opts,1);
			return false;
		});

		$("."+opts.popupClass+" .prev").click(function(){
			$.fn.popup.cycleImage(popup,opts,-1);
			return false;
		});
		
		// add key controls and keep escape key handler
		document.onkeydown = function(e)
		{
			var keycode;
			if (window.event)
			{
				keycode = window.event.keyCode;
			}
			else if (e)
			{
				keycode = e.which;
			}
			if (keycode == 39)
			{
			 	$(document).unbind();
        	 	$("."+opts.popupClass+" .next").click();
			}
			else if (keycode == 37)
			{
				$(document).unbind();
        	 	$("."+opts.popupClass+" .prev").click();
			}
			if (keycode == 27)
			{
				$.fn.popup.closeBox(popup,opts);
			 	//$("."+opts.popupClass).fadeOut("slow");
        		//$(".transparency").fadeOut("slow");
			}
		}
	}
	
	
	// function to add close box controls to the popup
	$.fn.popup.addCloseButton = function(popup,opts)
	{
		$("."+opts.popupClass+" ."+opts.closeBox).click(function(){
			$.fn.popup.closeBox(popup,opts);
			return false;
		});
	}
	

	// this function closes the box and removes it from the DOM.
	$.fn.popup.closeBox = function(popup,opts)
	{
		// may want to do some fancy stuff here, but for now just fading out the box
		$("."+opts.popupClass).stop().fadeOut("slow").css("display","none");
		$(".transparency").fadeOut("slow");
	}
	

    // this function finds the next image and then displays it
	$.fn.popup.cycleImage = function(popup,opts,imgIndex)
	{
		var thisIndex = $("img[title='"+popup.galleryTitle+"']").index(popup);
		var galleryLength = $("img[title='"+popup.galleryTitle+"']").length;
		var cycleIndex = thisIndex + imgIndex;
		if (cycleIndex < 0)
		{
			cycleIndex = galleryLength - 1;
		}
		if (cycleIndex == galleryLength)
		{
			cycleIndex = 0;
		}
		// open the new popup by simulating a click function on the thumbnail
		$("img[title='"+popup.galleryTitle+"']:eq("+cycleIndex+")").click();
	}

	// end of module
})(jQuery);