function save() {
	console.log("saving");
	var settings = $("input");
	for (var i = 0; i < settings.length; i++) {
		localStorage[$(settings[i]).attr("id")] = $(settings[i]).val();
		console.log( $(settings[i]).attr("id") );
		console.log( $(settings[i]).val() );
	}

	$("#status").text("Settings saved.");
	$("#status").fadeOut(750);
}

function restore() {
	console.log("restoring");
	var settings = $("input");
	for (var i = 0; i < settings.length; i++) {
		$(settings[i]).val( localStorage[$(settings[i]).attr("id")] );
		console.log( $(settings[i]).attr("id") );
		console.log( localStorage[$(settings[i]).attr("id")] );
	}
}
$( function() {
	$('#save').click(save);
	restore();
});
