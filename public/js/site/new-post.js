$('#new-post').click(function() {
	var plus = $("span.plus");
	var form = $(this).find("form");

	
	plus.bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
		
		if (plus.hasClass('rotate-right')){
			plus.css({'transform' : 'rotate(45deg)'});
			plus.removeClass('rotate-right');
		}
		else if (plus.hasClass('rotate-left')) {
			plus.css({'transform': 'rotate(0deg)'});
			plus.removeClass('rotate-left');
		}
		
	});


	$(this).toggleClass('row');

	if (form.hasClass("hidden")) {
		$(this).css({"width": "inherit", "height": "auto"});
		form.removeClass("hidden");
		plus.addClass('rotate-right');

	}
	else {
		$(this).css({"width": "50px", "height": "50px"});
		form.addClass('hidden');
		plus.addClass('rotate-left');

	}
});
