
var $grid = $('.grid').masonry({
	itemSelector: '.grid-item'
});

$('.card').each(function() {
	console.log(this);
	if (this.offsetHeight < this.scrollHeight) {
		$(this).addClass("card-overflow");
		
		$(this).click(function() {
			console.log("clicked");
			console.log($grid);
			$(this).parent().toggleClass("grid-item--expand");
			$grid.masonry();
		});
	} else {
		// your element doesn't have overflow
	}
	
});
