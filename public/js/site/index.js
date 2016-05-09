
$('.card').each(function() {
	console.log(this);
	if (this.offsetHeight < this.scrollHeight) {
		$(this).css("background", "linear-gradient(white 310px, grey)");
	} else {
		// your element doesn't have overflow
	}
});
