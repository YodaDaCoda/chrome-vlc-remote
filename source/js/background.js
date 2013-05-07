/*
Chrome VLC Remote
	Copyright (C) 2013  William Pickering

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * Returns a handler which will open a new window when activated.
 */
chrome.contextMenus.create({
	"title" : "Send link to VLC",
	"type" : "normal",
	"contexts" : ["link"],
	"targetUrlPatterns": 	[
//								"http://www.youtube.com/watch?v=*",
//								"http://www.youtube.com/v/*",
//								"*://*/*.mp3"
								"<all_urls>"
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

// Listen for any changes to the URL of any tab.
// Extensions cannot have both browser-action AND page-action.
// chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
	// ref http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
	// var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
	// var match = tab.url.match(regExp);
	// if (match && match[7].length == 11){
		// chrome.pageAction.show(tabId);
	// }
	// alert("tabbed");
// });


// chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	// console.log(request);
	//return true;	//make the $.ajax sendResponse callback work
// });

function execCmd(cmd){
	console.log("execCmd " + cmd);
	clearTimeouts();
	chrome.extension.sendMessage(
		cmd,
		function(response){
			setTimeouts();
		}
	);
}



function enqueue(url) {
	var server = "http://" + localStorage["server"] + ":" + localStorage["port"] + "/";
	url = encodeURIComponent(url);
	console.log("enque "+url);
	$.ajax({
		url:		server+"requests/status.xml?command=in_enqueue&input="+url,
		datatype:	"xml",
		success:	function(){console.log("success");}
	});
}
