$('span.plus').click(function() {
	var plus = $(this);
	var form = $(this).parent().find("form");

	
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


	$(this).parent().toggleClass('row');

	if (form.hasClass("hidden")) {
		$(this).parent().css({"width": "inherit", "height": "auto"});
		form.removeClass("hidden");
		plus.addClass('rotate-right');

	}
	else {
		$(this).parent().css({"width": "50px", "height": "50px"});
		form.addClass('hidden');
		plus.addClass('rotate-left');
	}
});
