
define(function (require) {
    
    var state = "NOMINEE";
    var jquery = require('jquery');
    var dc = require('dc');
    var d3 = require('d3');
    var crossfilter = require('crossfilter');
    var topojson = require('topojson');
    var bubbleOverlay  = require('bubbleOverlay');
    var globalSettings = require('globalSettings');
    var nomineesSettings = require('nomineesSettings');
    var NomineesCrossfilters = require('nomineesCrossfilters');
    var NomineesCharts = require('nomineesCharts');
    var bootstrap = require('bootstrap');
    var socialShareUrl = require('socialShareUrl');

    var url = require('url');
    var currentFilters = {};
    
    
    var width = globalSettings.width(),
	   height = globalSettings.height();
    
    var projection = globalSettings.projection();
    
    var path = globalSettings.geoPathProjection();
    
    var svg = globalSettings.svg();
    
    var g = globalSettings.g();
    
    var bubbleOverlayData = globalSettings.bubbleOverlayData();
    
    var nomineesCharts = new NomineesCharts();
    var maleOrFemaleChart = nomineesCharts.maleOrFemaleChart();
    var yearOfBirthChart = nomineesCharts.yearOfBirthChart();
    var nominatorYearChart = nomineesCharts.nominatorYearChart();
    var prizeChart = nomineesCharts.prizeChart();
    var worldChart = globalSettings.worldChart();
    
    d3.json("./data/world-50m.json", function(error, world) {
	
    	g.selectAll("path")
                .data(topojson.feature(world, world.objects.countries).features)
                .enter().append("path")
                .attr("d", path)
                .attr("class", "feature");
    	g.append("path")
                .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
                .attr("class", "border border--state")
                .attr("d", path);
    	
    	d3.json("http://www.nobelprize.org/nomination/api/getNomineesInfo.php", function(error, data) {
	    
	     d3.json("http://www.nobelprize.org/nomination/api/getCitiesGeolocation.php", function(error, latsAndLons) {
		
    		var nomineesCrossfilters = new NomineesCrossfilters(data,latsAndLons,projection);
    		var nominees = nomineesCrossfilters.getNominators();
    		var nomineesAll = nomineesCrossfilters.getAll();
    		var bubbleOverlayData = nomineesCrossfilters.getBubbleOverlayData();
    		globalSettings.setBubbleOverlayData(bubbleOverlayData);
    		globalSettings.setState(state);
    		
    		var overlay = new bubbleOverlay(worldChart,bubbleOverlayData);
    		overlay.render(1,state);
    		
    		// count all the facts
    		dc.dataCount(".dc-data-count")
    		    .dimension(nominees)
    		    .group(nomineesAll)
    		    .render();
    		
    		nomineesCharts.setCrossfilters(nomineesCrossfilters);
    		
    		url.addURLFilteringToChart("./nominees.html", currentFilters, prizeChart, 'prize');
    		url.addURLFilteringToChart("./nominees.html", currentFilters, maleOrFemaleChart, 'gender');
            	url.addURLFilteringToChart("./nominees.html", currentFilters, yearOfBirthChart, 'nominatorBirth');
            	url.addURLFilteringToChart("./nominees.html", currentFilters, nominatorYearChart, 'nominatorYear');
    		
    		nomineesCharts.render();
    		
    		var params = url.getFilteredParams();
    		
    		if (params['gender'] != null) {
    		    params['gender'].forEach(function (gender) {
    			   maleOrFemaleChart.filter(gender);
    		    });
    		}
    		if (params['prize'] != null) {
    		    params['prize'].forEach(function(prize) {
    			   prizeChart.filter(prize);
    		    });
    		}
            if (params['nominatorBirth'] != null) {
                var dateTimeFilter = [new Date(params['nominatorBirth'][0]),new Date(params['nominatorBirth'][1])];
                yearOfBirthChart.filter(dc.filters.RangedTwoDimensionalFilter(dateTimeFilter));
            }
            if (params['nominatorYear'] != null) {
                var dateTimeFilter = [new Date(params['nominatorYear'][0]),new Date(params['nominatorYear'][1])];
                nominatorYearChart.filter(dc.filters.RangedTwoDimensionalFilter(dateTimeFilter));
            }
    		
    		dc.redrawAll();
	    });
	   });
    });
    
    jquery( "#year-of-birth-chart-reset" ).click(function() {
    	yearOfBirthChart.filterAll();
    	dc.redrawAll();
    });
    
    jquery( "#nominator-year-chart-reset" ).click(function() {
    	nominatorYearChart.filterAll();
    	dc.redrawAll();
    });
    
    jquery( "#male-female-chart-reset" ).click(function() {
    	delete currentFilters['gender'];
    	maleOrFemaleChart.filterAll();
    	dc.redrawAll();
    });
    
    jquery( "#prize-chart-reset" ).click(function() {
    	delete currentFilters['prize'];
    	prizeChart.filterAll();
    	dc.redrawAll();
    });
    
    jquery( "#reset-all-filters" ).click(function() {
    	currentFilters = {};
    	dc.filterAll();
    	dc.redrawAll();
    });
    
    jquery('#timeline a').click(function (e) {
    	e.preventDefault()
    	$(this).tab('show')
    });
    
    socialShareUrl.shareUrl();
    
    jquery(function() {
	   setTimeout(function(){
	    dc.redrawAll();
	   },3000 );
	
    });
    
});
