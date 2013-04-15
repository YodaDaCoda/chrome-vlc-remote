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

var playing = "";
var length = "";
var fullscreen;

function update(){
	console.log("update");
	$.ajax({
		url:		server+"requests/status.xml",
		success:	function (data, status, jqXHR) {
						processUpdate(data, status, jqXHR);
					},
		complete:	function(jqXHR, textStatus) { setTimeout(update, 1000); }
	});
}
function processUpdate(data, status, jqXHR) {
	playing = $('[name="filename"]', data).text();
	$("#file").text($('[name="filename"]', data).text());
	$("#time").text(format_time($("time", data).text()));
	$("#length").text(format_time($("length", data).text()));
	$("#volume").attr("value", $("volume", data).text());
	$("#position").attr("value", $("position", data).text());
	length = $("length", data).text();
	$("#audioDelay").attr("value", $("audiodelay", data).text())
	$("#aspectratio").attr("value", $("aspectratio", data).text())
	fullscreen = $("fullscreen", data).text();
	refreshPlaylist();
}

function setVolume(volume) {
	console.log("volume "+volume);
	$.ajax(
		{
		url:		server+"requests/status.xml?command=volume&val="+volume,
		datatype:	"xml",
		success:	function (data, status, jqXHR) {
						processUpdate(data, status, jqXHR);
					}
		}
	);
}

function toggleFullscreen() {
	setFullscreen(fullscreen == "false");
}

function setFullscreen(fs) {
	console.log("fullscreen "+fs);
	$.ajax(
		{
		url:		server+"requests/status.xml?command=fullscreen&val="+fs,
		datatype:	"xml",
		success:	function (data, status, jqXHR) {
						processUpdate(data, status, jqXHR);
					}
		}
	);
}

function setAudioDelay(delay) {
	console.log("audio delay "+delay);
	$.ajax(
		{
		url:		server+"requests/status.xml?command=audiodelay&val="+delay,
		datatype:	"xml",
		success:	function (data, status, jqXHR) {
						processUpdate(data, status, jqXHR);
					}
		}
	);
}
function changeAudioDelay(delay) {
	setAudioDelay((parseFloat($("#audioDelay").attr("value"))+parseFloat(delay)).toString())
}

//format_time - takes time in seconds, returns hh:mm:ss
function format_time(s) {
	var hours = Math.floor(s / 3600);
	var minutes = Math.floor((s / 60) % 60);
	var seconds = Math.floor(s % 60);
	hours = hours < 10 ? "0" + hours : hours;
	minutes = minutes < 10 ? "0" + minutes : minutes;
	seconds = seconds < 10 ? "0" + seconds : seconds;
	return hours + ":" + minutes + ":" + seconds;
}

function skip(s) {
	console.log("skip "+s);
	$.ajax(
		{
		url:		server+"requests/status.xml?command=seek&val="+s,
		datatype:	"xml",
		success:	function (data, status, jqXHR) {
						processUpdate(data, status, jqXHR);
					}
		}
	);
}

function refreshPlaylist() {
	$.ajax(
		{
		url:		server+"requests/playlist.xml",
		datatype:	"xml",
		success:	function (data, status, jqXHR) {
						$("#playlistitems").empty();
						$('[name="Playlist"]', data).each(
							function(){
								$("leaf", $(this)).each(
									function(){
										li = document.createElement("li");
										$(li).attr("name", $(this).attr("name"));
										$(li).attr("ro", $(this).attr("ro"));
										$(li).attr("uri", $(this).attr("uri"));
										$(li).attr("id", $(this).attr("id"));
										$(li).attr("duration", $(this).attr("duration"));
										$(li).append($(this).attr("name"));
										if ($(this).attr("current") == "current") {
											$(li).addClass("current");
										}
										$("#playlistitems").append(li);
									}
								)
							}
						);
						$("li").on("click", playID);
					}
		}
	);
}

function playID(){
	console.log("Playing "+($(this).attr("name")));
	$.ajax(
		{
		url:		server+"requests/status.xml?command=pl_play&id="+$(this).attr("id"),
		datatype:	"xml",
		success:	function (data, status, jqXHR) {
						processUpdate(data, status, jqXHR);
					}
		}
	);
}

function setAR(){
	//16:10
	$.ajax(
		{
			url:		server+"requests/status.xml?command=aspectratio&val="+$(this).attr("value"),
			datatype:	"xml",
			success:	function (data, status, jqXHR) {
							processUpdate(data, status, jqXHR);
						}
		}
	);
}

function execCmd(cmd){
	$.ajax(
		{
			url:		server+"requests/status.xml?command="+cmd,
			datatype:	"xml",
			success:	function (data, status, jqXHR) {
							processUpdate(data, status, jqXHR);
						}
		}
	);
}

function seek(t){
	//console.log("seek "+Math.floor(Number($(this).attr("value"))*Number(length)));
	$.ajax(
		{
			url:		server+"requests/status.xml?command=seek&val="+Math.floor(t*length),
			datatype:	"xml",
			success:	function (data, status, jqXHR) {
							processUpdate(data, status, jqXHR);
						}
		}
	);
}


//When the DOM is ready
$(function() {
	$("#p1m")				.on("click",	function(event){ skip("+60");						});
	$("#p10s")				.on("click",	function(event){ skip("+10");						});
	$("#m10s")				.on("click",	function(event){ skip("-10");						});
	$("#m1m")				.on("click",	function(event){ skip("-60");						});
	$("#play")				.on("click",	function(event){ execCmd("pl_play");				});
	$("#pause")				.on("click",	function(event){ execCmd("pl_pause");				});
	$("#stop")				.on("click",	function(event){ execCmd("pl_stop");				});
	$("#next")				.on("click",	function(event){ execCmd("pl_next");				});
	$("#previous")			.on("click",	function(event){ execCmd("pl_previous");			});
	$("#voldd")				.on("click",	function(event){ setVolume("-100");					});
	$("#vold")				.on("click",	function(event){ setVolume("-10");					});
	$("#volu")				.on("click",	function(event){ setVolume("+10");					});
	$("#voluu")				.on("click",	function(event){ setVolume("+100");					});
	$("#audioDelayMinus")	.on("click",	function(event){ changeAudioDelay("-0.01");			});
	$("#audioDelayPlus")	.on("click",	function(event){ changeAudioDelay("+0.01");			});
	$("#audioDelay")		.on("dblclick",	function(event){ setAudioDelay("0");				});
	$("#position")			.on("change",	function(event){ seek($(this).attr("value"));		});
	$("#volume")			.on("change",	function(event){ setVolume($(this).attr("value"));	});
	$("#aspectratio")		.on("change",	function(event){ setAR();							});
	$("#fullscreen")		.on("click",	function(event){ toggleFullscreen();				});
	update();
	//refreshPlaylist();
});

// Tooltip stuff that may or may not end up actually being used
/*
$(function() {
	var el, newPoint, newPlace, offset, transition, output;

	// Select all range inputs, watch for change
	$("input[type='range']").change(function() {

		// Cache this for efficiency
		el = $(this);

		// Measure width of range input
		width = el.width();

		// Figure out placement percentage between left and right of input
		newPoint = (el.val() - el.attr("min")) / (el.attr("max") - el.attr("min"));

		// Prevent bubble from going beyond left or right (unsupported browsers)
		// odd offset to make label line up better
		offset = -1
		
		newPlace = (width * (newPoint)).toFixed(0).toString();
		offset -= (newPoint*6);    //I'm not sure why 6 works, but it do

		// Move bubble
		// store the output element for effeciency
		output = el.siblings("output");
		// store the transition for restoration later
		transition = output.css("transition");
		// with the output element
		output
		// disable transition
		.css("transition", "none")
		// set new css
		.css({
			left: newPlace + "px",
			marginLeft: offset + "%"
		})
		// set the text
		.text(el.val())
		// force a quick repaint before the animation kicks back in
		.hide(0, function(){$(this).show();})
		// re-enable the animation
		.css("transition", transition);        
	})
	// Fake a change to position bubble at page load
	.trigger('change');
});
*/