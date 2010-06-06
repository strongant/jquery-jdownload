/*
 * jDownload - A jQuery plugin to assist file downloads
 * Examples and documentation at: http://jdownloadplugin.com
 * Version: 1.1 (06/06/2010)
 * Copyright (c) 2010 Adam Chambers, Tim Myers
 * Licensed under the GNU General Public License v3: http://www.gnu.org/licenses/gpl.html
 * Requires: jQuery v1.4+ & jQueryUI 1.8+
*/

(function($) {

	$.fn.jDownload = function(settings){
		
		var config = {  
			filePath     : null,
			event        : "click", // default click event??
			dialogTitle  : "jDownload",
			dialogDesc   : $(this).attr('title') ? $(this).attr('title') : 'Download the file now?',
			dialogWidth  : 400,
			dialogHeight : 'auto',
			dialogModal  : true,
			showfileInfo : true,
			start        : null,
			stop         : null,
			download     : null,
			cancel       : null
		}
				   	
	  	settings = $.extend(config, settings);
	  	
	  	var dialogID = "jDownloadDialog_"+$('.jDownloadDialog').length;
	  	var iframeID = "jDownloadFrame_"+$('.jDownloadFrame').length;
	  	
	  	// create html iframe and dialog
	  	var iframeHTML = '<iframe class="jDownloadFrame" src="" id="'+iframeID+'"></iframe>';	
	  	var dialogHTML = '<div class="jDownloadDialog" title="'+settings.dialogTitle+'" id="'+dialogID+'"></div>';
	  	
	  	// append both to document
	  	$('body').append(iframeHTML+dialogHTML);
	  	
	  	
	  	var iframe = $('#'+iframeID);
	  	var dialog = $('#'+dialogID);
	  	
	  	// set iframe styles
	  	iframe.css({
	  		"height"    : "0px",
	  		"width"     : "0px",
	  		"visibility"   : "hidden"
	  	});
	  	
	  	// set dialog options
	  	dialog.dialog({
	  		autoOpen : false,
	  		buttons	 : {
	  			"Cancel": function() { 
	  				if($.isFunction(settings.cancel)) {
	  					settings.cancel();
	  				}
	  				$(this).dialog('close');
	  			}, 
	  			
	  			"Download": function() {
	  				if($.isFunction(settings.download)) {
	  					settings.download();
	  				}
	  				start_download();
	  			}
	  		},
	  		width    : settings.dialogWidth,
	  		height   : settings.dialogHeight,
	  		modal    : settings.dialogModal,
	  		close    : ($.isFunction(settings.stop)) ? settings.stop : null
		});


		$(this).bind(settings.event, function(){
		
			if($.isFunction(settings.start)) {	
				settings.start();
			}
			
			dialog.html("");
		
			// if filePath is not specified then use the href attribute
			var filePath = (settings.filePath == null) ? $(this).attr('href') : settings.filePath;
			
			dialog.html('<p>Fetching File...</p><img src="jdownload/loader.gif" alt="Loading" />');
			
			$.ajax({
				type : 'GET',
				url  : 'jDownload/jDownload.php',
				data : 'action=download&path='+filePath,
				success : function(data) {
					
					setTimeout(function() {
						if(data == "error") {
						
							dialog.html("<p class=\"jDownloadError\">File cannot be found.</p>");
							
						} else {
						
							if(settings.showfileInfo == true) {
								
								var url  = "jDownload/jDownload.php?action=info&path="+filePath;
							
								// get file information
								$.getJSON(url, function(data) {
									
									// parse JSON
									var html  = "<div class=\"jDownloadInfo\">";
										html += "<p><span>File Name:</span> "+data.filename+"</p>";
										html += "<p><span>File Type:</span> "+data.filetype+"</p>";
									    html += "<p><span>File Size:</span> "+data.filesize+" KB</p>";
									    html += "</div>";
									
									// remove any old file info & error messages
									$('.jDownloadInfo, .jDownloadError').remove();
									
									// append new file info
									dialog.html('<p>'+settings.dialogDesc+'</p>'+html);
								});
							}
	
						}
					}, 750);
				}
		
			});
			
			// open dialog 
			dialog.data('jDownloadData', {filePath : filePath}).dialog('open');
					
			return false;
				
		});
		
		/* Iniate download when value Ok is iniated via the dialog */
		function start_download(i){
			
			
			// change iframe src to fieDownload.php with filePath as query string?? 
			iframe.attr('src', "jDownload/jDownload.php?action=download&path="+dialog.data('jDownloadData').filePath);
			
			// Close dialog
			dialog.dialog('close');
			
			return false;
		}
		
	}
	
})(jQuery);