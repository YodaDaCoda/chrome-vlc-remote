/**
 * Returns a handler which will open a new window when activated.
 */
chrome.contextMenus.create({
	"title" : "Send link to VLC",
	"type" : "normal",
	"contexts" : ["link"],
	"targetUrlPatterns": 	[
								"http://www.youtube.com/watch?v=*",
								"http://www.youtube.com/v/*"
							],
	"onclick" : function(info, tab) {
					var url = info.linkUrl;
					enqueue(url);
				}
});
chrome.contextMenus.create({
	"title" : "Send this page VLC",
	"type" : "normal",
	"contexts" : ["page"],
	"documentUrlPatterns": [
								"http://www.youtube.com/watch?v=*",
								"http://www.youtube.com/v/*"
							],
	"onclick" : function(info, tab) {
					var url = info.linkUrl;
					enqueue(url);
				}
});

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	// if (request.greeting == "hello")
	// sendResponse({farewell: "goodbye"});
// });

function enqueue(url) {
	var server = "http://" + localStorage["server"] + ":" + localStorage["port"] + "/";
	url=encodeURIComponent(url);
	console.log("enque "+url);
	$.ajax({
		url:		server+"requests/status.xml?command=in_enqueue&input="+url,
		datatype:	"xml",
		success:	function(){console.log("success");}
	});
}
