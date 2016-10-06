var stream = new Audio("http://stream.wusb.stonybrook.edu:8090/;");
var playButton = $('.play');
playButton.on('click', function() {
  	stream.load();

	if (playButton.text() == 'Click here to listen in! play_circle_outline') {

		// Clear text because I don't know how to add in the icon any other way
		playButton.text('');
		stream.play()

		// Add in the text
		var textSpan = document.createElement('span');
		textSpan.innerHTML = 'Click here to listen in! '
		playButton.append(textSpan);

		// Add in the icon
		var stopIcon = document.createElement('i');
		stopIcon.innerHTML = 'stop';
		stopIcon.setAttribute('class', 'material-icons');
		playButton.append(stopIcon);
	}
	else {

		// Clear text because I don't know how to add in the icon any other way
		playButton.text('');
		stream.pause()

		// Add in the text
		var textSpan = document.createElement('span');
		textSpan.innerHTML = 'Click here to listen in! '
		playButton.append(textSpan);

		// Add in the icon
		var playIcon = document.createElement('i');
		playIcon.innerHTML = 'play_circle_outline';
		playIcon.setAttribute('class', 'material-icons');
		playButton.append(playIcon);
	}
	
	
});
