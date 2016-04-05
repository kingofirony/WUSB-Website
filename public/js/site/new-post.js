$('#new-post').click(function() {
	$(this).addClass('row');
	$(this).css({"width": "inherit", "max-height": "1000px"});
	$(this).find("form").removeClass("hidden");
	console.log("clicked");
});
