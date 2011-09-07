/*
	jQuery Popup Plugin 1.7
	Copyright (c) 2011 Daniel Thomson
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/

// release notes: version 1.0
// version 1.1  - added support for gallery on non img object, now it just has to have the gallery name in the title attribute
//			    - added option for image caption
//			    - added option for gallery counter
//			    - added a preloader image and option for image path
// version 1.2  - got sick of trying to support syncronised animations, turned the whole popup content into a table so that the brwoser could animate the table in one go.
// version 1.3 - modified the extend method to create a new object 'opts' that doesn't destroy the settings object. I will think about creating an
//				'opts' method so that the settings can be modified outside of the script
// version 1.4 - not finished - added support for transparency hack on IE6
// version 1.5 - not sure, I think it was a bit of validation with JsLint
// version 1.6 - removed transparent layer height bug if scroll Y > 0
//			   - added option to set the opacity of the transparent layer
//               - removed the $(window).unbind() method, seems not to be needed
// version 1.7 - added option to set overflow hidden off so that you can hang elements (namely the close button) outside the box
//				- added proper ajax loading
//  TO DO: make an option to allow the popup to move with page scrolling	
//
// level of error suppresion -> low
// This module is designed as a popup function to use whenever and wherever you might need a popup. call this module on any DOM element you wish like this:
// $(document).ready(function(){
//                       $(".yourClassNameHere").popup({
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
//  titleHeight, controlHeight
//
//  Other interesting options avaliable:
//  autoSize:                                    allows the box to expand and contract to the image size with an animation of the length: transition
//  centerOnResize:                              will center the popup when you resize the browser window
//  popupID, contentClass, closeBox:             allows custom classes and IDs for these DOM element just in case you need them for your application
//  shadowLength:                                the box itself has a structure around it to allow for custom drop shadows.
//                                               This value adjusts the size of this 'outer' layer of the box
//  boxWidth, boxHeight:                         Sets the dimensions of the box if autoSize is false, and if content node is not an image
//


(function($){

	$.fn.popup = function(config)
	{
		// config - default settings
		var settings = {
							'transparentLayer' : true,           // would you like a transparent layer underneath the popup?
							'transparentOpacity' : 70,			 // set the opacity percentage of the transparent layer
							'gallery' : false,                   // set true for navigation options between popups of the same title attribute
							'galleryCounter' : false,            // add a counter for gallery
							'titleHeight' : 30,                  // height in pixels of the gallery title box
							'controlHeight' : 40,                // height in pixels of the gallery navigation box
							'imageDesc' : false,                 // add a description box underneath the gallery image
							'autoSize' : true,                   // set whether the box with image in it will resize to the image size
							'boxWidth' : 400,                    // when autoSize is set to false, or no image then set the dimensions of the box in pixels
							'boxHeight' : 300,                   // when autoSize is set to false, or no image then set the dimensions of the box in pixels
							'centerImage' : true,                // centers the image in a fixed size box
							'shadowLength' : 42,                 // set the width of the padding around the box for your drop shadows
							'transition' : 500,                  // transition speed from one box to the next
							'popupID' : "popupBox",              // custom class for the popup box
							'contentClass' : "popupContent",     // custom class for the popup content
							'closeBox' : "popupClose",           // class the close button has
							'centerOnResize' : true,             // set whether the box centers itself when the browser resizes
							'loaderPath' : "loader.gif",         // file path to the loading image
							'overflow' : "visible",				// "hidden" or "visible", can set the css overflow attribute on or off
							'ajax' : false						// allows user to specify an ajax call to a resource

					   };

		// if settings have been defined then overwrite the default ones
		// comments:        true value makes the merge recursive. that is - 'deep' copy
		//                  {} creates an empty object so that the second object doesn't overwrite the first object
		//                  this emtpy takes object1, extends2 onto object1 and writes both to the empty object
		//                  the new empty object is now stored in the var opts.
		var opts = $.extend(true, {}, settings, config);

		// iterate over each object that calls the plugin and do stuff
		this.each(function(){
			// do pluging stuff here
			// each box calling the plugin now has the variable name: myPopup
			var myPopup = $(this);
			
						              

			$(myPopup).click(function()
			{												
				
                   // *** set content source and gallery title variables ***
                   myPopup.boxSrc = $(this).attr("name");
                   // store DOM fragment as a variable			
					myPopup.fragment = $(myPopup.boxSrc);	
                   
                   myPopup.galleryTitle = $(this).attr("title");
                   myPopup.imageDesc = $(this).attr("longdesc");

                   // *** create the markup for popup box ***
                   $.fn.popup.createBox(opts);

                   // *** find the screen dimensions ***
                   var dimensions = $.fn.popup.findScreenPos();
                   myPopup.winY = dimensions.winY;
                   myPopup.winX = dimensions.winX;
                   myPopup.scrY = dimensions.scrY;
                   myPopup.scrX = dimensions.scrX;

                   // *** either display content as an image OR as a DOM node ***
                   if ($.fn.popup.isContentImage(myPopup))
                   {
                       // find the index of this image in the gallery
                       $.fn.popup.displayImage(myPopup,opts);
                   }
                   else if (opts.ajax === true)
                   {
                   		$.fn.popup.getAjaxContent(myPopup,opts);	
                   }
                   else
                   {                   		
                       $.fn.popup.styleNodeBox(myPopup,opts);
                   }
                   return false;
               });
			// end of plugin stuff
          });

		// return jQuery object
		return this;
	};


	//////////////////////////////
	// Private Functions		//
	//////////////////////////////

	// ******  find the screen height and width measurements to position box in (go IE!)  ******
	$.fn.popup.findScreenPos = function()
	{
		var dimensions = {};
		var win = $(window);
          dimensions.winY = win.height();
          dimensions.winX = win.width();
          dimensions.scrY = win.scrollTop();
          dimensions.scrX = win.scrollLeft();
          return dimensions;
	};


	// ******  create the markup for the popup box  ******
	$.fn.popup.createBox = function(opts)
	{
		var popupBox,
        dimensions,
        win = $(window);
		if ($("#"+opts.popupID).length === 0)
        {
			popupBox = '<div id="'+opts.popupID+'"><table cellpadding="0" cellspacing="0"><tbody><tr class="popupTop"><td class="popupTL corner pngbg"></td><td class="popupTM pngbg"></td><td class="popupTR corner pngbg"></td></tr><tr class="popupMid"><td class="popupML pngbg"></td><td class="'+opts.contentClass+'"></td><td class="popupMR pngbg"></td></tr><tr class="popupBot"><td class="popupBL corner pngbg"></td><td class="popupBM pngbg"></td><td class="popupBR corner pngbg"></td></tr></tbody></table></div>';
			if($.browser.msie)
            {
				if($.browser.version == "6.0")
				{
                    popupBox = '<div id="'+opts.popupID+'"><table cellpadding="0" cellspacing="0"><tbody><tr class="popupTop"><td class="popupTL corner pngbg"><div></div></td><td class="popupTM pngbg"><div></div></td><td class="popupTR corner pngbg"><div></div></td></tr><tr class="popupMid"><td class="popupML pngbg"><div></div></td><td class="'+opts.contentClass+'"></td><td class="popupMR pngbg"><div></div></td></tr><tr class="popupBot"><td class="popupBL corner pngbg"><div></div></td><td class="popupBM pngbg"><div></div></td><td class="popupBR corner pngbg"><div></div></td></tr></tbody></table></div>';
                }
            }
			$("body").append(popupBox);
			$("#"+opts.popupID).css("display","none");
        }
        
        // add transparency layer if transparency is true.
        if (opts.transparentLayer === true && $(".transparency").length === 0)
		{
            var transparentLayer = '<div class="transparency" style="z-index:99;background:#000;opacity:'+(opts.transparentOpacity/100)+';filter:alpha(opacity = '+opts.transparentOpacity+');top:0;left:0;position:absolute"></div>';
			$("body").append(transparentLayer);
			// add event listeners for browser resizing and scrolling to adjust the transparent layer size
			//win.unbind();
			win.scroll(function(){
				// find height and width of transparent layer
				dimensions = $.fn.popup.findScreenPos();
				$(".transparency").css({height:dimensions.winY + dimensions.scrY,width:dimensions.winX + dimensions.scrX});
			});
			win.resize(function(){
				// find height and width of transparent layer
				dimensions = $.fn.popup.findScreenPos();
				$(".transparency").css({height:dimensions.winY + dimensions.scrY,width:dimensions.winX + dimensions.scrX});
			});
		}

		// get rid of transparency if 'false' and it already exists and don't need it
		if (opts.transparentLayer === false && $(".transparency").length > 0)
		{
			$(".transparency").remove();
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
                   $("#"+opts.popupID).stop().fadeOut("slow").css("display","none");
                   $(".transparency").fadeOut("slow");
			}
		};

        $(".transparency").click(function(){
            $(this).fadeOut("slow");
            $("#"+opts.popupID).fadeOut("slow");
        });
        // clear box of any content
        $("#"+opts.popupID+" ."+opts.contentClass).children().remove();
        // style transparent layer
        dimensions = $.fn.popup.findScreenPos();
        $(".transparency").css({"display":"block","filter":"alpha(opacity = "+opts.transparentOpacity+")","opacity":(opts.transparentOpacity/100),height:dimensions.winY + dimensions.scrY,width:dimensions.winX + dimensions.scrX});
	};

	// ******  display the popup box  ******
	$.fn.popup.styleBox = function(popup,opts,properties,image)
	{
		var popupSelector = "#"+opts.popupID,
		    contentSelector = "."+opts.contentClass,
		    imgSelector = contentSelector+" img",
		    contentHeight,
		    contentWidth,
		    outerBoxWidth,
		    outerBoxHeight,
		    boxPos,
		    leftPos,
		    topPos,
		    dimensions,
		    oldBoxHeight,
		    oldBoxWidth;

		if (image)
		{
		   $(imgSelector).attr("src",image.src);
		   $(imgSelector).attr("height",properties.imgHeight);
		   $(imgSelector).attr("width",properties.imgWidth);
		}
		// if this is an image being loaded
		if (properties)
		{
		   contentHeight = properties.imgHeight + opts.titleHeight + opts.controlHeight;
		   contentWidth = properties.imgWidth;
		   if (opts.autoSize === false)
		   {
                 contentHeight = opts.boxHeight + opts.titleHeight + opts.controlHeight;
                 contentWidth = opts.boxWidth;
		   }
		}
		else
		{
			contentHeight = opts.boxHeight;
			contentWidth = opts.boxWidth;
		}

		outerBoxWidth = contentWidth + (opts.shadowLength*2);
		outerBoxHeight = contentHeight + (opts.shadowLength*2);

		// calculate absolute position of the box and then center it on the screen
		boxPos = $.fn.popup.centerBox(popup,outerBoxWidth,outerBoxHeight);
		leftPos = boxPos.leftPos;
		topPos = boxPos.topPos;

		// on window resize - center the box in the middle again
		if (opts.centerOnResize === true)
          {
              $(window).resize(function()
              {
                  dimensions = $.fn.popup.findScreenPos();
                  boxPos = $.fn.popup.centerBox(dimensions,outerBoxWidth,outerBoxHeight);
                  $(popupSelector).css({top:boxPos.topPos,left:boxPos.leftPos});
              });
          }

          // claculate dimensions of popup
          // animate to the correct size if it is already open, else just set the values
          // !!!! warning - animation is broken on safari and chrome
          if ($(popupSelector).css("display") === "block" && properties && opts.autoSize === true)
          {
              oldBoxHeight = parseFloat($(popupSelector).css("height")) - (opts.shadowLength*2) - (opts.titleHeight + opts.controlHeight);
              oldBoxWidth = parseFloat($(popupSelector).css("width")) - (opts.shadowLength*2);
              $(popupSelector+" .galleryTitle").css({height:opts.titleHeight+"px"});
              $(popupSelector+" .galleryControls").css({height:opts.controlHeight+"px","overflow":opts.overflow});
              $(popupSelector+" img").css({height:oldBoxHeight+"px",width:oldBoxWidth+"px"});
              $(popupSelector+" .imgPane").css({"width":"100%"});
              
              // I want to animate most of this through the step function of the main image animation for better IE results
              // maybe set up some local variables as well to increase performance
              $(popupSelector+" img").animate({height:properties.imgHeight+"px",width:properties.imgWidth+"px"}, {queue:false,duration:opts.transition});
              $(popupSelector).animate({height:outerBoxHeight+"px",width:outerBoxWidth+"px","left":leftPos,"top":topPos}, {queue:false,duration:opts.transition});
              $(popupSelector+" .imgPane").animate({height:(contentHeight - opts.titleHeight - opts.controlHeight)+"px"}, {queue:false,duration:opts.transition});
              $(popupSelector+" .popupContent").animate({height:contentHeight+"px",width:contentWidth+"px"}, {queue:false,duration:opts.transition});
              $(popupSelector+" .popupTM, "+popupSelector+" .popupBM").animate({width:properties.imgWidth+"px"}, {queue:false,duration:opts.transition});
		}
		// create box and set its dimensions
		else
		{
              $(popupSelector).css({height:outerBoxHeight,width:outerBoxWidth,"position":"absolute","z-index":100,"overflow":opts.overflow});
              $(popupSelector+" .imgPane").css({height:(contentHeight - opts.titleHeight - opts.controlHeight)});
              $(popupSelector+" .popupContent").css({height:contentHeight,width:contentWidth});
              $(popupSelector+" .popupML div, "+popupSelector+" .popupMR div").css({height:contentHeight});
              $(popupSelector+" .galleryTitle").css({height:opts.titleHeight,"overflow":opts.overflow});
              $(popupSelector+" .galleryControls").css({height:opts.controlHeight,"overflow":opts.overflow});
              $(popupSelector+" .corner").css({height:opts.shadowLength,width:opts.shadowLength});
              $(popupSelector+" .popupTM").css({height:opts.shadowLength,width:contentWidth});
              $(popupSelector+" .popupBM").css({height:opts.shadowLength,width:contentWidth});
              $(popupSelector).css({"left":leftPos,"top":topPos});
          }

          // this probably should go somewhere else - leaving it in for now not to confuse me :P
          $(popupSelector).fadeIn("slow");
          //var pngTimer = setTimeout(function(){$(".pngbg div").addClass("popupPng");},10);
          $(".pngbg div").addClass("popupPng");

	};




	// function centers the box in the middle of the screen
	$.fn.popup.centerBox = function(dimensions,outerBoxWidth,outerBoxHeight)
	{
         this.leftPos = ((dimensions.winX - outerBoxWidth) / 2) + dimensions.scrX;
         this.topPos = ((dimensions.winY - outerBoxHeight) / 2) + dimensions.scrY;
         if (this.topPos < 0)
         {
             this.topPos = 0;
         }
         if (this.leftPos < 0)
         {
             this.leftPos = 0;
         }
         return this;
	};


	// ******  find if the popup content is an image path  ******
	$.fn.popup.isContentImage = function(popup)
	{
		var contentString = popup.boxSrc.split("."),
              ext = contentString[contentString.length-1],
              isImage;
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
	};
	

	// ******  display the popup image  ******
	$.fn.popup.displayImage = function(popup,opts)
	{
		// add the image tag to the popup content
		var contentSelector = "#"+opts.popupID+" ."+opts.contentClass;
		// add image markup to the popup box
		$(contentSelector).append('<div class="imgPane"><img class="loader" src="'+opts.loaderPath+'" width="" height="" alt="" /></div>');		
		// if gallery description is set to true then create the box that the description will go into and append after .imgPane
		if (opts.imageDesc === true)
		{
			$(".imgPane").css("position","relative").append('<div class="imageDesc" style="position:absolute;bottom:0;left:0;width:100%;background:#000;opacity:0.8;filter:alpha(opacity = 80);">'+popup.imageDesc+'</div>');
		}

		// if gallery is a fixed height and width and centerImage = true, then align the image to the center of the box
		if (opts.autoSize === false && opts.centerImage === true)
		{
			$(contentSelector+" .imgPane").prepend("<span style='display:inline-block;height:"+opts.boxHeight+"px;line-height:"+opts.boxHeight+"px;width:1px'>&nbsp;</span>");
			$(contentSelector+" .imgPane").css({"line-height":opts.boxHeight,"text-align":"center"});
			$(contentSelector+" .imgPane img").css({"display":"inline","vertical-align":"middle"});
		}
		if (opts.gallery === true)
		{
			// add gallery controls here
			if (popup.galleryTitle !== false)
			{
				$(contentSelector).append('<div class="galleryControls"><a href="" class="prev">previous</a><a href="" class="next">next</a></div>');
				$(contentSelector).prepend('<div class="galleryTitle"><h2>'+popup.galleryTitle+'</h2><a href="" class="'+opts.closeBox+'">close</a></div>');
				// if gallery counter is true then add counter
				if (opts.galleryCounter === true)
				{
					var thisIndex = $("*[title='"+popup.galleryTitle+"']").index(popup) + 1;
					var galleryLength = $("*[title='"+popup.galleryTitle+"']").length + 1;
					$(contentSelector).find(".galleryControls").append("<p class='galleryCounter'>Displaying "+thisIndex+" of "+galleryLength+"</p>");
				}
			}
			// if not a gallery title then just add the close button
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
          $.fn.popup.addCloseButton(popup,opts);
          // add gallery controls and key functions here
          $.fn.popup.addGalleryControls(popup,opts);
	};
	

	// ******  display the content if NOT an image  ******
	$.fn.popup.styleNodeBox = function(popup,opts)
	{		
		//popup.fragment = $(popup.boxSrc);
		$("#"+opts.popupID+" ."+opts.contentClass+" img.loader").remove();
		$("#"+opts.popupID+" ."+opts.contentClass).append('<div class="galleryTitle"><a href="" class="'+opts.closeBox+'">close</a></div>');
		$("#"+opts.popupID+" ."+opts.contentClass).append(popup.fragment);
		$("#"+opts.popupID+" ."+opts.contentClass+" "+popup.boxSrc).css("display","block");
		// style popup box
		$.fn.popup.styleBox(popup,opts);
		//  add close button controls
        $.fn.popup.addCloseButton(popup,opts);
	};
	
	// ******  get ajax content for the box  ******
	$.fn.popup.getAjaxContent = function(popup,opts)
	{
		$("#"+opts.popupID+" ."+opts.contentClass).html('<img class="loader" src="'+opts.loaderPath+'" width="" height="" alt="" />');				
		$.ajax({
			url: popup.boxSrc,
			success : function(msg)
			{
				popup.fragment = msg;				
				$.fn.popup.styleNodeBox(popup,opts);
			},
			error : function()
			{			
				popup.fragment = "ajax request failed";		
				$.fn.popup.styleNodeBox(popup,opts);
			}
		});		
	};

	// *******  add controls for the image gallery  ******
	$.fn.popup.addGalleryControls = function(popup,opts)
	{
		$("#"+opts.popupID+" .next").click(function(){
			$.fn.popup.cycleImage(popup,opts,1);
			return false;
		});

		$("#"+opts.popupID+" .prev").click(function(){
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
                   $("#"+opts.popupID+" .next").click();
			}
			else if (keycode == 37)
			{
                   $(document).unbind();
                   $("#"+opts.popupID+" .prev").click();
			}
			if (keycode == 27)
			{
                   $.fn.popup.closeBox(popup,opts);
                   //$("#"+opts.popupID).fadeOut("slow");
                   //$(".transparency").fadeOut("slow");
			}
		};
	};
	

	// function to add close box controls to the popup
	$.fn.popup.addCloseButton = function(popup,opts)
	{
		$("#"+opts.popupID+" ."+opts.closeBox).click(function(){
			$.fn.popup.closeBox(popup,opts);
			return false;
		});
	};
	

	// this function closes the box and removes it from the DOM.
	$.fn.popup.closeBox = function(popup,opts)
	{
		// may want to do some fancy stuff here, but for now just fading out the box
		$("#"+opts.popupID).stop().fadeOut("slow").css("display","none");
		// delete the popup box from the DOM
          $("#"+opts.popupID).remove();
		$(".transparency").fadeOut("slow");
	};


    // this function finds the next image and then displays it
	$.fn.popup.cycleImage = function(popup,opts,imgIndex)
	{
		var thisIndex = $("*[title='"+popup.galleryTitle+"']").index(popup);
		var galleryLength = $("*[title='"+popup.galleryTitle+"']").length;
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
		$("*[title='"+popup.galleryTitle+"']:eq("+cycleIndex+")").click();
	};

	// end of module
})(jQuery);