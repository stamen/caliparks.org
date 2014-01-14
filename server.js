var http               = require('http'),
    express            = require('express'),
	exphbs             = require('express3-handlebars'),
    app                = express(),
	config             = require(__dirname + '/config.json'),
	override_templates = require(__dirname + '/override-templates.json'),
	app_title          = config.app.name,
	port               = process.env.PORT || 5000;
	
//
// Setup Express
//
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//
// Setup Routes
//
app.get('/', function(req,res) {
	res.render('home', {
	 	app_title : app_title
	});
});

app.get('/park/:id', function(req,res) {
	//console.log('req',req.params.id);

	var flickr_photos = require(__dirname + '/data/park_flickr_photos.json'),
	    park_data     = {title:null, photos:[]},
	    template      = 'park',
	    title         = 'California parks : ' + park_data.title;

	flickr_photos.features.forEach(function(photo, i, photos) {
		if (parseInt(photo.properties.containing_park_id, 10) === parseInt(req.params.id, 10)) {
			if (!park_data.title) {
				park_data.title = photo.properties.containing_park_name;
			}
			park_data.photos.push(photo.properties);
		}
	});

	if (override_templates[req.params.id]) {
		template = override_templates[req.params.id].template;
	    title    = override_templates[req.params.id].title;
	}

	res.render(template, {
	 	app_title    : title,
	 	park_data    : park_data,
	 	total_photos : park_data.photos.length
	});

});

//app.use('/js', express.static(__dirname + '/client/js'));
app.use('/style', express.static(__dirname + '/style'));

//
// Go Go Go
//
/*
app.listen = function(port){
  var server = http.createServer(this);
  console.log(('On ' + new Date()));
  console.log('the '+ app_title +' was started on port ' + port);
  return server.listen.apply(server, arguments);
};

app.listen(port);
*/

app.listen(process.env.PORT || 8080, function() {
  console.log("Listening at http://%s:%d/", this.address().address, this.address().port);
});