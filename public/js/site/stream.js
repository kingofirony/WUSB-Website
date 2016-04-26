var stream = new Audio("http://stream.wusb.stonybrook.edu:8090/;");
var playButton = $('.play');

console.log(playButton);
playButton.on('click', function() {
  	stream.load();

	if (playButton.text() == 'play_circle_outline') {
		playButton.text('stop');
		stream.play()
	}
	else {
		playButton.text('play_circle_outline');
		stream.pause()
	}
	
	
});
