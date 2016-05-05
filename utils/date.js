/** Jan 1 is 0, etc. JS Date objects handle leap years. */
Date.prototype.getDayOfYear = function() {
	const janFirst = new Date(this.getFullYear(), 0, 0);
	const diff = this - janFirst;
	const millisPerDay = 86400000;
	// Think units: millisec div (millisec div day) = days
	return Math.floor(diff / millisPerDay);
};

/** First week of the year is 0 */
Date.prototype.getWeekOfYear = function() {
	var d = new Date(+this);
	d.setHours(0,0,0);
	d.setDate(d.getDate()+4-(d.getDay()||7));
	return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7))/7);
};

Date.prototype.addDays = function(days) {
	var d = new Date(this.valueOf());
	d.setDate(d.getDate() + days);
	return d;
};
