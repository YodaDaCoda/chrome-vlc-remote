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

function loadDir(dir){
	console.log("loadDir "+dir);
	$.ajax({
		url:		"http://" + localStorage["server"] + ":" + localStorage["port"] + "/requests/browse.json?dir="+dir,
		dataType:	"json",
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
		for (var i in data.element) {
			j = data.element[i];	//shorthand
			if (i > 0) {
				var li = $(document.createElement("li"))
				.text(j.name)
				.attr("id", "d"+j.path)
				.on("click", function(event) {
								event.stopPropagation();
								var t = $(this);	//effeciency
								if ( t.hasClass("folder-open") ) {
									t.children("ul").remove();
									t.toggleClass("folder-closed");
									t.toggleClass("folder-open");
								} else if ( t.hasClass("file-audio") || t.hasClass("file-video") ) {
									//do nothing
								} else {
									loadDir(t.attr("path"));
									t.toggleClass("folder-closed");
									t.toggleClass("folder-open");
								}
							}
				)
				.on("dblclick", function(event) {
									event.stopPropagation();
									var t = $(this);	//effeciency
									if ( t.hasClass("file-audio") || t.hasClass("file-video") ) {
										enqueue(t.attr("uri"));
									}
								}
				);

				//li.attr("json", JSON.stringify(j));
				for (var k in j) {
					li.attr(k, j[k]);
				}

				var ext = j.path.split("."); ext = ext[ext.length-1].toLowerCase();
				if (j.type == "dir") {
					li.addClass("folder-closed");
				} else if ( ["mp3", "3ga", "aac", "aif", "ape", "fla", "flac", "m4b"].indexOf(ext) != -1) {
					li.addClass("file-audio");
				} else if ( ["mkv", "avi", "mp4", "mov", "mpg"].indexOf(ext) != -1 ) {
					li.addClass("file-video");
				}
				$("ul#"+dirr).append(li);
			}
		}
	};
}
function execCmd(cmd){
	console.log("execCmd " + cmd);
	// chrome.extension.sendMessage(
		// cmd,
		// function(response){
			// setTimeouts();
		// }
	// );
	$.ajax({
		url:		"http://" + localStorage["server"] + ":" + localStorage["port"] + "/requests/status.json?command="+cmd,
		dataType:	"json",
	});

}
function enqueue(f){
	console.log("enqueue " + f);
	execCmd("in_enqueue&input="+f);
}

//When the DOM is ready
$(function() {
	loadDir(localStorage["fbStartDir"]);
});
