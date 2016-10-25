var render = require('../src/fromDelta'),
	expect = require('chai').expect;

describe('fromDelta', function() {

	it('renders inline format', function() {

		expect(render([
			{
				"insert": "Hi "
			},
			{
				"attributes": {
					"bold": true
				},
				"insert": "mom"
			}
		]))
		.to.equal('Hi **mom**\n');

	});

	it('renders embed format', function() {

		expect(render([
			{
				"insert": "LOOK AT THE KITTEN!\n"
			},
			{
				"insert": {
					"image": "https://placekitten.com/g/200/300"
				},
			}
		]))
		.to.equal('LOOK AT THE KITTEN!\n![](https://placekitten.com/g/200/300)\n');

	});

	it('renders block format', function() {

		expect(render([
			{
				"insert": "Headline"
			},
			{
				"attributes": {
					"header": 1
				},
				"insert": "\n"
			}
		]))
		.to.equal('# Headline\n');
	});

	it('renders lists with inline formats correctly', function() {

		expect(render([
			{
				"attributes": {
					"italic": true
				},
				"insert": "Glenn v. Brumby"
			},
			{
				"insert": ", 663 F.3d 1312 (11th Cir. 2011)"
			},
			{
				"attributes": {
					"list": 'ordered'
				},
				"insert": "\n"
			},
			{
				"attributes": {
					"italic": true
				},
				"insert": "Barnes v. City of Cincinnati"
			},
			{
				"insert": ", 401 F.3d 729 (6th Cir. 2005)"
			},
			{
				"attributes": {
					"list": 'ordered'
				},
				"insert": "\n"
			}
		]))
		.to.equal('1. *Glenn v. Brumby*, 663 F.3d 1312 (11th Cir. 2011)\n2. *Barnes v. City of Cincinnati*, 401 F.3d 729 (6th Cir. 2005)\n');

	});

	it('renders adjacent lists correctly', function() {

		expect(render([
			{
				"insert": "Item 1"
			},
			{
				"insert": "\n",
				"attributes": {
					"list": 'ordered'
				}
			},
			{
				"insert": "Item 2"
			},
			{
				"insert": "\n",
				"attributes": {
					"list": 'ordered'
				}
			},
			{
				"insert": "Item 3"
			},
			{
				"insert": "\n",
				"attributes": {
					"list": 'ordered'
				}
			},
			{
				"insert": "Intervening paragraph\nItem 4"
			},
			{
				"insert": "\n",
				"attributes": {
					"list": 'ordered'
				}
			},
			{
				"insert": "Item 5"
			},
			{
				"insert": "\n",
				"attributes": {
					"list": 'ordered'
				}
			},
			{
				"insert": "Item 6"
			},
			{
				"insert": "\n",
				"attributes": {
					"list": 'ordered'
				}
			}
		]))
		.to.equal('1. Item 1\n2. Item 2\n3. Item 3\n\nIntervening paragraph\n1. Item 4\n2. Item 5\n3. Item 6\n');

	});

	it('renders adjacent inline formats correctly', function() {
		expect(render([
			{
				"attributes" : {
					"italic" : true
				},
				"insert" : "Italics! "
			},
			{
				"attributes": {
					"italic": true,
					"link": "http://example.com"
				},
				"insert": "Italic link"
			},
			{
				"attributes": {
					"link": "http://example.com"
				},
				"insert": " regular link"
			}

		]))
		.to.equal('*Italics! [Italic link](http://example.com)*[ regular link](http://example.com)'+"\n");
	});

	it('handles embed inserts with inline styles', function() {
		expect(render([
		{
			"insert": {
				"image": "https://placekitten.com/g/200/300",
			},
			"attributes": {
				"link": "http://example.com"
			},
		}
		]))
		.to.equal('[![](https://placekitten.com/g/200/300)](http://example.com)'+"\n");
	});
/*
	it('is XSS safe in regular text', function() {
		expect(render([
			{
				"insert": '<img src=x onerror="doBadThings()">'
			}
		]))
		.to.equal('<p>&lt;img src=x onerror=&quot;doBadThings()&quot;&gt;</p>');
	});

	it('is XSS safe in images', function() {
		expect(render([
			{
				"insert": {
					"image": '"><img src=x onerror="doBadThings()">'
				},
			}
		]))
		.to.equal('<p></p><p><img src="&quot;&gt;&lt;img src=x onerror=&quot;doBadThings()&quot;&gt;"></p><p></p>');
	});*/
});
