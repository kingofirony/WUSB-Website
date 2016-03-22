var djs = new Bloodhound({
	datumTokenizer: Bloodhound.tokenizers.whitespace,
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	// url points to a json file that contains an array of country names, see
	// https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
	prefetch: 'api/users'
});

// passing in `null` for the `options` arguments will result in the default
// options being used
$('#dj.typeahead').typeahead(null, {
	name: 'djs',
	source: djs
});

console.log("DBD");

$('#date').datepicker({
	
});

$('#time').timepicker();
