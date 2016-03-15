var programs = new Bloodhound({
	datumTokenizer: Bloodhound.tokenizers.whitespace,
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	// url points to a json file that contains an array of country names, see
	// https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
	prefetch: 'api/programs'
});

console.log(programs);

// passing in `null` for the `options` arguments will result in the default
// options being used
$('#program.typeahead').typeahead(null, {
	name: 'programs',
	source: programs
});
