// ========================================================
// ON READY 
// ========================================================
$(function() {
	Panel = new Panel();

	$('.js-carousel').each(function(index, el){
		new Carousel(el);
	});

	new DataVis();
});



// ========================================================
// Carousel 
// ========================================================
var Carousel = function(node) {
	this.container = $(node);

	if (!this.container.length) return;

	this.chapterContainer = this.container.find('.container-chapters');
	this.chapter = this.chapterContainer.find('.chapter');
	this.nextBtn = this.container.find('.js-next-chapter');
	this.prevBtn = this.container.find('.js-prev-chapter');
	this.navLink = this.container.find('.nav-link');

	this.activeLinkClass = 'active-link';
	this.activeChapter = 'js-active';
	this.navLinks = [];
	this.index = 0;
	this.oldIndex = this.index;
		
	this.navLink.each(function(index, el) {
		this.navLinks.push(new Navigation(index, el, this));
	}.bind(this));

	this.chapterContainer.css('width', 100 * this.chapter.length + '%');
	this.chapter.css('width', 100 / this.chapter.length + '%');

	this.nextBtn.on('click', this.next.bind(this));
	this.prevBtn.on('click', this.prev.bind(this));

	// $(document).keydown(function(e) {
	// 	if (e.keyCode == 37 && this.index > 0) {
	// 		this.prev();
	// 	} else if (e.keyCode == 39 && this.index < this.chapter.length - 1) {
	// 		this.next();
	// 	}		
	// }.bind(this));

	this.move();
}

Carousel.prototype.defaultSettings = {
	'duration': 500
}

Carousel.prototype.next = function() {
	this.index++;
	this.move();
}

Carousel.prototype.prev = function() {
	this.index--;
	this.move();
}

Carousel.prototype.move = function() {
	this.navLinks[this.oldIndex].removeClass(this.activeLinkClass);
	this.navLinks[this.index].addClass(this.activeLinkClass);
	this.oldIndex = this.index;

	if (this.index == 4) {
		setTimeout(function(){
			$('.data-vis-panel').removeClass('panel-hidden');
		}, 700);
	}

	this.container.css('background-position', (this.index * 20) + '% 100%');
	this.chapterContainer.css('transform', 'translateX(-' + (this.index * (100 / this.chapter.length)) + '%');
}



// ========================================================
// Navigation 
// ========================================================
var Navigation = function(index, el, root) {
	this.el = $(el);
	this.root = root;
	this.index = index;
	this.el.on('click', this.getIndex.bind(this));

	return this.el;
}

Navigation.prototype.getIndex = function() {
	this.root.index = this.index;
	this.root.move();
}



// ========================================================
// DataVis 
// ========================================================
var DataVis = function() {
	var dataVisPanelEl = $('.data-vis-panel'); 
	var openPanelBtn = $('.open-panel-btn');

	dataVisPanelEl.on('mouseup', function() {
		if (Panel.isClosed) {
			Panel.show();
		}
	});

	openPanelBtn.on('click', function() {
		if (Panel.isClosed) {
			Panel.show();
		}
	});

	setDataVis();

	function setDataVis() {
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;

		var activeLabelClass = 'active-label';

		var containerDataVis = $('.container-data-vis');
		var inputRadio = $('.input-options');
		var dataVisFilters = $('.data-vis-filters');

		var checkboxGender = $('.filter-gender');
		var checkboxAge = $('.filter-age');
		var checkboxLocation = $('.filter-location');
		var checkboxCategory = $('.filter-category');

		var tooltipEl = $('.tooltip');
		var tooltipImageEl = tooltipEl.find('.tooltip-image');
		var tooltipBirthPlaceEl = tooltipEl.find('.tooltip-birth-place');
		var tooltipNameEl = tooltipEl.find('.tooltip-name');
		var tooltipBirthEl = tooltipEl.find('.tooltip-birth-date');
		var tooltipDeathEl = tooltipEl.find('.tooltip-death-date');
		var tooltipStoryEl = tooltipEl.find('.tooltip-story');

		var resultContainer = $('.container-result');
		var personOneImageEl = resultContainer.find('.person-one-image');
		var personOneNameEl = resultContainer.find('.person-one-name');
		// var personOneAgeCategoryEl = resultContainer.find('.person-one-age-category');
		var personOneLifespan = resultContainer.find('.person-one-lifespan');
		var personOneBirthPlace = resultContainer.find('.person-one-birth-place');
		var personOneDeathPlace = resultContainer.find('.person-one-death-place');
		var personOneStoryEl = resultContainer.find('.person-one-story');
		var similarPeopleNumberEl = $('.similar-people-number');

		// Set margin, width and height of scatterplot
		var margin = {top: 50, right: 80, bottom: 50, left: 70};
		var width = containerDataVis.width() - margin.left - margin.right;
		var height = containerDataVis.height() - margin.top - margin.bottom;
		var personSize = 800;
		var icon;

		// Set grid to size of the svg 
		var grid = d3.layout.grid()
  							.bands()
  							.size([width, height]);

  		var backgroundGrid =  d3.layout.grid()
			  							.bands()
			  							.size([width, height]);

  		// Set svg
		var svg = d3.select(".container-data-vis")
						.append("svg")
		    				.attr("width", width + margin.left + margin.right)
		    				.attr("height", height + margin.top + margin.bottom)

	    var dataVisGroup = svg.append("g")
	    						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	    var backgroundGridGroup = svg.append("g")
	    								.attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

	    // Get icon
	    d3.xml("img/person.svg",  "image/svg+xml", function(error, frag) {
		    var node = frag.getElementsByTagName("g")[0];
		    icon = function(){ return node.cloneNode(true); }
		});

	    d3.json('data/data-slachtoffers-2.json', function(error, d) {
	    	var data = d;
	    	var executed = false;

	    	console.log(data);
	    	data = formatData(data);

	    	inputRadio.on('change', getFilteredData);
	    	dataVisFilters.on('change', getFilteredData);

	    	updateDataVis(data);

	    	function getFilteredData() {
	    		setTimeout(function(){
	    			var values = [];

			    	for (var i = 0; i < inputRadio.length; i++) {
			    		var idSplit = inputRadio[i].id.split('-');
			    		var checkboxSelector = 'option-' + idSplit[1] + '-' + idSplit[2];

		      			if (inputRadio[i].checked) {
		      				$('.' + checkboxSelector).addClass(activeLabelClass);
		      				$('#' + checkboxSelector).attr('checked', true);
		      				values.push(inputRadio[i].value);
		      			} else {
		      				$('.' + checkboxSelector).removeClass(activeLabelClass);
		      			}
		      		}

		      		var gender = values[0];
		      		var age = values[1];
		      		var location = values[2];
		      		var category = values[3];
		      		var filteredPersons = [];

		      		var locationBool = (location === "true");

		      		switch (values.length) {
	  					case (1):
	  						data.forEach(function(d) {
			      				if (d.manOfVrouw == gender) {
				      				d.filtered = true;
				      				d.compareScore = 1;
				      			} else {
				      				d.filtered = false;
				      				d.compareScore = 0;
				      			}
				      		});
	  						break;
	  					case (2):
	  						data.forEach(function(d) {
			      				if (d.manOfVrouw == gender && d.ageCategory == age) {
				      				d.filtered = true;
				      				d.compareScore++;
				      			} else {
				      				d.filtered = false;
				      			}
				      		});
	  						break;
	  					case (3):
	  						data.forEach(function(d) {
			      				if (d.manOfVrouw == gender && d.ageCategory == age && locationBool == d.inAmsterdam) {
				      				d.filtered = true;
				      				d.compareScore++;

									if (d.compareScore >= 3 && d.filtered) {
				      					filteredPersons.push(d);
					      			}	
				      			} else {
				      				d.filtered = false;
				      			}
				      		});

	  						break;
	  					case (4):
	  						data.forEach(function(d) {
			      				if (d.manOfVrouw == gender && d.ageCategory == age && d.categorie == category  && locationBool == d.inAmsterdam) {
				      				d.filtered = true;
				      				d.compareScore++;
				      			} else {
				      				d.filtered = false;
				      			}
				      		});
	  						break;
	  					default:
	  						console.log('default');
	  						return
	  						break;
	  				}

		      		data = data.sort(function(a, b) {
		      			return b.filtered - a.filtered;
		      		});

	      			if (filteredPersons.length && !executed) {
	      				executed == true;
  						setResult(filteredPersons);
  					}

		   			//  var backgroundGridData = new Array;

					// for (var i = 0; i < 218; i++) {
					// 	backgroundGridData.push(new Object({'id' : i}));
					// }
				
					// backgroundGrid(backgroundGridData);
					// drawBackgroundGrid(backgroundGridData);

		      		updateDataVis(data);
	    		},100);
		    }

		    function setResult(filteredPersons) {
		    		filteredPersons = filteredPersons.sort(function (a, b) { return b.verhaal.length - a.verhaal.length; });
		    		filteredPersons = filteredPersons.sort(function (a, b) { return b.hasImage - a.hasImage; });

	      			DataVis.selectedPerson = filteredPersons[0].oorlogsgrafNr;

	      			personOneImageEl.css('background-image',  'url(img/persons/' + filteredPersons[0].imagePath + ')');
	      			personOneNameEl.text(filteredPersons[0].voornamen + ' ' + filteredPersons[0].achternaam);
	      			// personOneAgeCategoryEl.text(filteredPersons[0].ageCategory + ' jaar');
	      			personOneLifespan.text(filteredPersons[0].birthYear + '-' + filteredPersons[0].sterftejaar);
	      			personOneBirthPlace.html('Geboren in <span>' + filteredPersons[0].geboorteplek + '</span>');
	      			personOneDeathPlace.html('Overleden in <span>' + filteredPersons[0].sterfteplek + '</span>');
	      			personOneStoryEl.text(filteredPersons[0].verhaal);

	      			if ((filteredPersons.length - 1) == 1) {
	      				similarPeopleNumberEl.html('Zo is er nog <span>' + (filteredPersons.length - 1) + '</span> slachtoffer');	      				
	      			} else if ((filteredPersons.length - 1) == 0) {
	      				similarPeopleNumberEl.html('De andere slachtoffers <br> hebben ook een verhaal');	      				
	      			}	else {
	      				similarPeopleNumberEl.html('Zo zijn er nog <span>' + (filteredPersons.length - 1) + '</span> slachtoffers');
	      			}
	      	}

	  //     	function drawBackgroundGrid(backgroundGridData) {
			// 	var dotPerson = backgroundGridGroup.selectAll(".background-icon")
	  //   							.data(backgroundGridData, function(d){ return d.id; });

			// 	dotPerson.enter().append(icon)
			// 						.attr({ "class": "icon",
			// 					 			transform: position
			// 							});

			// 	dotPerson.each( colorize );

	  //   		dotPerson.transition()
			// 	    		.delay(function(d, i){ return i / 10; })
			// 	    		.attr({
			// 	      			transform: position
			// 	    		});

			// 	function colorize(d) {
			// 	  	d3.select(this)
	  //   				.style('fill', 'white')
	  //   				.style('opacity', .3);
			// 	}

			// 	function position(d){
			// 	  	var scale = Math.min.apply(null,
			// 	   			grid.nodeSize().map(function(d){ return d/personSize; })
			// 	   		);
			// 	    var tx = "translate(" + d.x + "," + d.y + ")" + " scale(" + scale + ") ";
			// 	    return tx;
			// 	}
			// }
	    });

		function updateDataVis(data) {
			// getFilters(data);
			grid(data);
			drawDataVis(data);

			function getFilters(data) {
				var checkedGender = [];
				var checkedAge = [];
				var checkedLocation = [];
				var checkedCategory = [];

				getCheckedElements(checkboxGender, checkedGender);
				getCheckedElements(checkboxAge, checkedAge);
				getCheckedElements(checkboxLocation, checkedLocation);
				getCheckedElements(checkboxCategory, checkedCategory);

				var filteredData = data;

				if(checkedGender.length) {
					filteredData = filteredData.filter(function(d) {
						for (var i = 0; i < checkedGender.length; i++) {
							if(checkedGender[i] == d.manOfVrouw) {
								return d;
							}
						}
					});
				}
				
				if(checkedAge.length) {
					filteredData = filteredData.filter(function(d){
						for (var i = 0; i < checkedAge.length; i++) {
							if(checkedAge[i] == d.ageCategory) {
								return d;
							}
						}
					});
				}

				// if(checkedLocation.length) {
				// 	filteredData = filteredData.filter(function(d){
				// 		for (var i = 0; i < checkedLocation.length; i++) {
				// 			if(checkedLocation[i] == d.omgeving) {
				// 				return d;
				// 			}
				// 		}
				// 	});
				// }

				if(checkedCategory.length) {
					filteredData = filteredData.filter(function(d){
						for (var i = 0; i < checkedCategory.length; i++) {
							if(checkedCategory[i] == d.categorie) {
								return d;
							}
						}
					});
				}

				for (var i = 0; i < data.length; i++) {
					for (var d = 0; d < filteredData.length; d++) {
						if(JSON.stringify(data[i]) === JSON.stringify(filteredData[d])) {
							data[i].filtered = true;
						} else {
							data[i].filtered = false;
						}
					}
				};

				function getCheckedElements(filterEl, array) {
					for (var i = 0; i < filterEl.length; i++) {
						var idSplit = filterEl[i].id.split('-');
		    			var labelSelector = 'filter-' + idSplit[1] + '-' + idSplit[2];

						if(filterEl[i].checked) {
	      					$('.' + labelSelector).addClass(activeLabelClass);
							array.push(filterEl[i].value);
						} else {
							$('.' + labelSelector).removeClass(activeLabelClass);
						}
					}
				}	
			}

			function drawDataVis(data) {
				var dotPerson = dataVisGroup.selectAll(".icon")
	    							.data(data, function(d){ return d.oorlogsgrafNr; });

				dotPerson.enter().append(icon)
									.attr({ "class": "icon",
								 			transform: position
										});

				dotPerson.each( colorize );

	    		dotPerson.on('mouseover', openTooltip);
	    		dotPerson.on('mouseout', closeTooltip);

	    		dotPerson.style('opacity', function(d){
	    			if (!d.filtered) { 
	    				return .2; 
	    			} else { 
	    				return 1;
	    			}
	    		});

	    		dotPerson.transition()
				    		.delay(function(d, i){ return i / 10; })
				    		.attr({
				      			transform: position
				    		});

				// Set exit transition
				dotPerson.exit()
						.transition()
					    .style({opacity: .1})
					    .remove();

				function openTooltip(d) {
					var positionTooltipX;
					var positionTooltipY;

					if ((windowWidth-460) < d3.event.pageX && (windowHeight - 200) > d3.event.pageY) {
						positionTooltipX = -460;
						positionTooltipY = 10;
					} else if ((windowWidth-460) > d3.event.pageX && (windowHeight - 200) < d3.event.pageY)  {
						positionTooltipX = 10;
						positionTooltipY = -110;
					} else if ((windowWidth-460) > d3.event.pageX && (windowHeight - 200) > d3.event.pageY)  {
						positionTooltipX = 10;
						positionTooltipY = 10;
					} else if ((windowWidth-460) < d3.event.pageX && (windowHeight - 200) < d3.event.pageY)  {
						positionTooltipX = -460;
						positionTooltipY = -110;
					}
					

					d3.select('.tooltip').style("left", (d3.event.pageX + positionTooltipX) + "px")		
               			.style("top", (d3.event.pageY + positionTooltipY) + "px");

               		if(d.hasImage) {
               			tooltipImageEl.css('background-image', 'url(img/persons/' + d.imagePath + ')');
               		} else {
               			tooltipImageEl.css('background-image', 'url(img/person.png)');
               		}

               		tooltipBirthPlaceEl.text('Geboren in ' + d.geboorteplek);
					tooltipNameEl.text(d.voornamen + ' ' + d.achternaam);
					tooltipStoryEl.text(d.verhaal);

					//XXXX//
					tooltipBirthEl.text(d.birthDay + '-' + d.birthMonth + '-' + d.birthYear);
					tooltipDeathEl.text(d.deathDay + '-' + d.deathMonth + '-' + d.sterftejaar);
					//XXXX//

					tooltipEl.addClass('active-tooltip');
				}

				function closeTooltip() {
					tooltipEl.removeClass('active-tooltip');
				}

				function colorize(d) {
				  	d3.select(this)
	    				.style('fill', function(d) {
							if (DataVis.selectedPerson)	{
								if(d.oorlogsgrafNr == DataVis.selectedPerson) {
		    						return 'rgb(210, 79, 79)';
		    					} else {
		    						return 'white';
		    					}
							} else {
								return 'white';
							}	    					
	    				});
				}

				function position(d){
				  	var scale = Math.min.apply(null,
				   			grid.nodeSize().map(function(d){ return d/personSize; })
				   		);
				    var tx = "translate(" + d.x + "," + d.y + ")" + " scale(" + scale + ") ";
				    return tx;
				}
			}
		}

		function formatData(data) {
			data.forEach(function(d){
				d.filtered = true;

				d.geboortedatum = d.geboortedatum.split('T');
				var birthDateSplit = d.geboortedatum[0].split('-');
				d.sterfteDagEnMaand = d.sterfteDagEnMaand.split('T');
				var deathDateSplit = d.sterfteDagEnMaand[0].split('-');

				d.birthYear = birthDateSplit[0];
				d.birthMonth = birthDateSplit[1];
				d.birthDay = birthDateSplit[2];
				d.deathMonth = deathDateSplit[1];
				d.deathDay = deathDateSplit[2];

				if(!d.imageBool) {
					var lastNameString = d.achternaam.replace(/\s+/g, '');
					var firstNameString = d.voornamen.replace(/\s+/g, '');
					if(d.hasImage) {
						d.imagePath = firstNameString + lastNameString + '.png';	
					} else {
						d.imagePath = 'person.png';
					}
				}		

				if(!d.hasImage) {
					d.hasImage = false;
				}

				if(d.omgeving == 'Amsterdam') {
					d.inAmsterdam = true;
				} else {
					d.inAmsterdam = false;
				}
				
				//XXX//
				d.birthDate = d.geboortedatum[0];
				d.age = d.sterftejaar - d.birthYear;
				//XXX//

				switch (true) {
  					case (d.age <= 25):
  						d.ageCategory = '0-25';
  						break;
  					case (d.age > 25 && d.age <= 40):
  						d.ageCategory = '26-40';
  						break;
  					case (d.age > 41 && d.age <= 60):
  						d.ageCategory = '41-60';
  						break;
  					case (d.age > 61 && d.age <= 99):
  						d.ageCategory = '61-99';
  						break;
  					default:
  						d.ageCategory = '0-25';
  				}
			});

			return data;
		}
	}
}



// ========================================================
// Panel 
// ========================================================
var Panel = function() {
	this.hideBound = this.hide.bind(this);
	this.containerPanel = $('.data-vis-panel');
	this.openPanelLabel = this.containerPanel.find('.open-panel-btn');

	this.hideClass = 'js-hide';
	this.activePanelClass = 'active-panel';
	this.isClosed = true;
}

Panel.prototype.show = function() {
	// Slides the task panel in
	this.containerPanel.addClass(this.activePanelClass);

	$('.carousel').on('mouseup', this.hideBound);
	this.openPanelLabel.on('mouseup', this.hideBound);

	this.openPanelLabel.text('Sluit datavisualisatie');

	this.isClosed = false;
}

Panel.prototype.hide = function(e) {
	if (e) {
		var target = $(e.target);
	}

	if (e && (!target.closest('.container-panel-content').length) || !e) {
		// Slides the panel up	
		this.containerPanel.removeClass(this.activePanelClass);
		this.openPanelLabel.text('Bekijk ze hier');
		$('.carousel').off('mouseup', this.hideBound);
	}

	setTimeout(function() {
		this.isClosed = true;
	}.bind(this), 200);
}











