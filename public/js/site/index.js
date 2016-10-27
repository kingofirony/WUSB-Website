
function expandCards() {
	var $grid = $('.grid').masonry({
		itemSelector: '.grid-item'
	});

	$('.card').each(function () {
		if (this.offsetHeight < this.scrollHeight) {
			$(this).addClass("card-overflow");

			$(this).click(function () {
				console.log("clicked");
				console.log($grid);
				document.getElementById("popOut").style.visibility = "visible";
				document.getElementById("popOutBG").style.visibility = "visible";
				//document.style.transfrom.translateY(-400px);

				$('html,body').animate({
        	scrollTop: $("h2").offset().top},
        	'slow');

				$('#popOut').append($(this).html())
				//$('#popOut').append($(this).parent().addClass("grid-item--expand").html());
				//$(this).parent().toggleClass("grid-item--expand");
				$grid.masonry();
			});
		} else {
			$(this).removeClass("card-overflow");
		}
	});
}

$('#popOutBG').click(function () {
	$('#popOut').empty();
	document.getElementById ("popOutBG").style.visibility = "hidden";
	document.getElementById ("popOut").style.visibility = "hidden";
});

$(window).resize(function() {
	expandCards();
});

$(document).ready(function() {
	expandCards();
});
