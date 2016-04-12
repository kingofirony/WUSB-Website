var stream = new Audio("http://stream.wusb.stonybrook.edu:8090/;");

$('.play').click(function() {
  stream.load();
  stream.play();
});

$('.stop').click(function() {
  stream.pause();
});
