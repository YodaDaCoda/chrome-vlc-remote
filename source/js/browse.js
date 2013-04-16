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
var server = "http://" + localStorage["server"] + ":" + localStorage["port"] + "/";

function load(dir){
	console.log("load "+dir);
	$.ajax({
		url:		server+"requests/browse.xml?dir="+dir,
		success:	processDir("d"+dir),
	});
}

var processDir = function(dir){
	return function(data, status, jqXHR){
		var dirr = dir.replace(/([ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~])/g, "\\$1");
		var ul = $(document.createElement("ul")).attr("id", dir);
		if (dir == "d"+localStorage["fbStartDir"]) {
			$("#files").append(ul);
		} else {
			$("#"+dirr).append(ul);
		}
		$(data).find("element").each( appendElement(dirr) );
	};
}

var appendElement = function(dir){
	return function(index, element) {
		var e = $(element);	//shorthand for effeciency
		//if (e.attr("name").substr(-2) == "..") {
		if (index == 0) {
			return;
		}
		var li = $(document.createElement("li"))
				.text(e.attr("name"))
				.attr("id", "d"+e.attr("path"))
				.attr("type", e.attr("type"))
				.attr("path", e.attr("path"))
				.attr("uri", e.attr("uri"))
				.on("click", function(event) {
								event.stopPropagation();
								var t = $(this);	//effeciency
								if ( t.hasClass("folder-open") ) {
									t.children("ul").remove();
									t.toggleClass("folder-closed");
									t.toggleClass("folder-open");
									return;
								} else if ( t.hasClass("file-audio") || t.hasClass("file-video") ) {
									return;
								}
								load(t.attr("path"));
								t.toggleClass("folder-closed");
								t.toggleClass("folder-open");
							}
				)
				.on("dblclick", function(event) {
								event.stopPropagation();
								var t = $(this);	//effeciency
								if ( t.hasClass("file-audio") || t.hasClass("file-video") ) {
									enqueue(t.attr("uri"));
								}
							}
				)
				;
		//var ext = e.attr("path").substr(-3).toLowerCase();
		var ext = e.attr("path").split(".");
		ext = ext[ext.length-1].toLowerCase();
		if (e.attr("type") == "dir") {
			li.addClass("folder-closed");
		} else if ( ["mp3", "3ga", "aac", "aif", "ape", "fla", "flac", "m4b"].indexOf(ext) != -1) {
			li.addClass("file-audio");
		} else if ( ["mkv", "avi", "mp4", "mov"].indexOf(ext) != -1 ) {
			li.addClass("file-video");
		}
		$("ul#"+dir).append(li);
	};
}

function enqueue(f){
	console.log("enqueue " + f);
	$.ajax(
		{
			url:		server+"requests/status.xml?command=in_enqueue&input="+f,
			datatype:	"xml",
			success:	function (data, status, jqXHR) {
							//processUpdate(data, status, jqXHR);
						}
		}
	);
}



//When the DOM is ready
$(function() {
	load(localStorage["fbStartDir"]);
});
