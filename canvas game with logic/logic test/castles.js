var GOLD = 0;
var WOOD = 1;
var FOOD = 2;
var PEASANTS = 3;
var SERVANTS = 4;
var MILITIA = 5;
var NOBLES = 6;

var Controller = function() {

	this.lastDate = null;
	this.totalTime = 0;
	this.resources = [];
	this.ui = null;
	this.rooms = [];
	this.noblesAvailable = 0;
	this.noblesRefresh = 0;
	this.foodEatenRatio = 0;
	this.foodToWoodRatio = .5;
	this.idealFoodToWood = .5;

	this.initiate = function() {
		this.lastDate = Date.now();

		this.resources[GOLD] = {name: "gold", value: 0};
		this.resources[WOOD] = {name: "wood", value: 0};
		this.resources[FOOD] = {name: "food", value: 0};
		this.resources[PEASANTS] = {name: "peasants", value: 0};
		this.resources[SERVANTS] = {name: "servants", value: 0};
		this.resources[MILITIA] = {name: "militia", value: 0};
		this.resources[NOBLES] = {name: "nobles", value: 0};

		this.ui = new UIManager();
		this.ui.initiate();

		this.add(PEASANTS, 5);
		this.add(SERVANTS, 2);

		var that = this;

		$("#addPeasant").bind('click', function() {
			that.add(PEASANTS, 1);
		});
		$("#addNoble").bind('click', function() {
			that.add(NOBLES, 1);
		});
		$("#addServant").bind('click', function() {
			that.add(SERVANTS, 1);
		});
		$("#addMilitia").bind('click', function() {
			that.add(MILITIA, 1);
		});
		$("#buildChamber").bind('click', function() {
			that.buildNoblesChamber();
		});
	}

	this.add = function(index, val) {
		this.resources[index].value += val;
	}

	this.get = function(index) {
		return this.resources[index].value;
	}

	this.getDeltaTime = function() {
		var newDate = Date.now();
		var dt = newDate - this.lastDate;
		this.lastDate = newDate;
		return dt;
	}

	this.eatFood = function() {
		var foodEaten = 0;
		foodEaten += this.get(NOBLES) * .1;
		foodEaten += this.get(SERVANTS) * .8;
		this.foodEatenRatio -= foodEaten;
		this.add(FOOD, -foodEaten);
	}

	this.peasantsWork = function() {
		var peasants = this.get(PEASANTS);
		var food = peasants * .2 * (1 - this.foodToWoodRatio);
		var wood = peasants * .2 * this.foodToWoodRatio;
		this.foodEatenRatio += food;
		this.add(WOOD, wood);
		this.add(FOOD, food);
	}

	this.generateGold = function() {
		var nobles = this.get(NOBLES);
		this.add(GOLD, nobles * .1);
	}

	this.update = function() {
		var dt = this.getDeltaTime();
		this.totalTime += dt;
		if (this.totalTime > 1000) {
			this.totalTime = 0;
			this.gameTick();
		}

	}

	this.gameTick = function() {
		if (this.foodToWoodRatio != this.idealFoodToWood) {
			var difference = this.idealFoodToWood - this.foodToWoodRatio;
			var change = difference / Math.abs(difference) * .01;
			this.foodToWoodRatio += change;
			if (Math.abs(difference) < .01) {
				this.foodToWoodRatio = this.idealFoodToWood;
			}
		}


		this.foodEatenRatio = 0;
		this.peasantsWork();
		this.generateGold();
		this.eatFood();

		this.setNobleRefresh();

		for (var i = 0; i < this.rooms.length; i++) {
			this.rooms[i].update(this);
		};

		this.checkForNobles();
	}

	this.setNobleRefresh = function() {
		this.noblesRefresh--;
		if (this.noblesRefresh <= 0) {
			this.noblesRefresh = 10;
			this.noblesAvailable = 2;
		}		
	}

	this.checkForNobles = function() {
		for (var i = 0; i < this.rooms.length; i++) {
			var room = this.rooms[i];
			if (room.needNoble()) {
				if (this.noblesAvailable > 0) {
					this.noblesAvailable--;
					room.pending = true;
				}
			}
		};		
	}

	this.renderUI = function() {
		this.ui.render(this.resources, this.rooms, this.foodEatenRatio, this.foodToWoodRatio);
		
	}

	this.buildNoblesChamber = function() {
		if (this.get(WOOD) >= 2) {
			this.add(WOOD, -2);
			var room = new Room();
			this.rooms.push(room);			
		}
	}

	this.changeWoodFoodRatio = function(ratio) {
		this.idealFoodToWood = ratio / 100;
	}
}

var Room = function() {
	this.age = 0;
	this.name = "Nobles Chamber";
	this.pending = false;
	this.occupied = false;

	this.update = function(game) {
		if (this.pending) {
			var chance = Math.random() * 20 + this.age;
			if (chance > 20) {
				this.occupied = true;
				this.pending = false;
				game.add(NOBLES, 1);
			}
		}
		this.age++;
	}

	this.getName = function() {
		return (this.name + (this.occupied ? " (occupied)" : " (unoccupied)"));
	}

	this.needNoble = function() {
		return (!this.pending && !this.occupied);
	}
}

var UIManager = function(game) {

	this.game = game;

	this.initiate = function() {

	}

	this.render = function(resources, rooms, foodEatenRatio, foodToWoodRatio) {
		for (var i = 0; i < resources.length; i++) {
			var div = $('#' + resources[i].name);
			this.setIfUnset(div, resources[i].name + ": " + Math.floor(resources[i].value))
		};

		var roomsDiv = $('#roomList');
		var roomHtml = "Rooms: " + "<br>";
		for (var i = 0; i < rooms.length; i++) {
			roomHtml += rooms[i].getName() + "<br>";
		};
		this.setIfUnset(roomsDiv, roomHtml);

		var foodRatioDiv = $('#foodRatio');
		foodEatenRatio = this.roundToTwoDecimal(foodEatenRatio);
		this.setIfUnset(foodRatioDiv, "Food Change: " + foodEatenRatio);
		this.setFoodToWoodSlide(foodToWoodRatio);

	}

	this.setFoodToWoodSlide = function(ratio) {
		var foodWidth = ratio * 200;
		var woodWidth = 200 - ratio * 200;
		this.changeWidthIfNotSet('box1', foodWidth);		
		this.changeWidthIfNotSet('box2', woodWidth);		
	}

	this.changeWidthIfNotSet = function(id, width) {
		var div = document.getElementById(id);
		if (div.style.width != width) {
			div.style.width = width;
		}
	}

	this.setIfUnset = function(div, text) {
		if (div.html() != text) {
			div.html(text);
		}
	}

	this.roundToTwoDecimal = function(number) {
		return Math.round(number * 100) / 100;
	}
}

var sim = new Controller();


$(document).ready( function() {
	sim.initiate();
	window.requestAnimationFrame( run );

	
	$("#woodfoodrange").bind('change', function(){
		var $range = $(this);
		setTimeout(function(){
			sim.changeWoodFoodRatio($range.val());
		}, 0);     
	});
});


function run() {		
	sim.update();
	sim.renderUI();

	requestAnimationFrame( run );
}