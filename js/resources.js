(function() {

	var ResourceManager = my.Class({

		constructor: function() {

			this.food = 10;
			this.stone = 10;
			this.gold = 0;
			this.servants = 0;
			this.peasants = 0;
			this.hygiene = 50;
			this.morale = 50;
			this.hygieneTimer = 0;
			this.idleTimer = 0;
			this.peasantProduction = {
				food: 0,
				stone: 10
			};
		},

		init: function() {

			sim.gui.setValue("Servants", this.servants);
			sim.gui.setValue("Food", this.food);
			sim.gui.setValue("Stone", this.food);
		},

		changeValue: function(name, value) {

			if (!value) {
				return;
			}

			var newValue = this[name.toLowerCase()] += value;	

			sim.gui.setValue(name, Math.floor(newValue));
		},

		setPeasantProductionSlider: function(food, stone) {

			this.peasantProduction.food = food;
			this.peasantProduction.stone = stone;
		},

		update: function(dt) {

			var servants = sim.getShapesOfType(SIM.Servant);
			var nobles = sim.getShapesOfType(SIM.Noble);

			this.updateHygiene(dt);
			this.updateMorale(dt, servants);
			this.updateResources(dt, servants, nobles);
		},

		updateHygiene: function(dt) {

			this.hygieneTimer -= dt;

			if (this.hygieneTimer < 0) {
				this.hygieneTimer = 10000;

				var totalTrash = sim.rooms.getNumberOfTrash();
				this.hygiene = (50 - totalTrash) * 2;
				sim.gui.setRating("Hygiene", Math.floor(this.hygiene));
			}
		},

		updateMorale: function(dt, servants) {

			this.idleTimer -= dt;

			if (this.idleTimer < 0) {
				this.idleTimer = 10000;

				var totalIdleTime = 0;

				for (var i = servants.length - 1; i >= 0; i--) {
					totalIdleTime += servants[i].getIdleTime();
				};

				var averageIdleTime = totalIdleTime / servants.length;
				this.morale = averageIdleTime / 100;
				if (this.morale < 20) {
					sim.turnServantsRed();
				}
				sim.gui.setRating("Morale", Math.floor(this.morale));
			}
		},

		updateResources: function(dt, servants, nobles) {


			var productionPower = this.peasants * dt / 100000;
			var foodProd = this.peasantProduction.food * productionPower;
			var stoneProd = this.peasantProduction.stone * productionPower;
			var foodDifference = foodProd - servants.length * dt / 20000;
			var goldGeneration = 0;

			for (var i = nobles.length - 1; i >= 0; i--) {
				goldGeneration += nobles[i].getTaxMoney();
			};

			this.changeValue("Food", foodDifference);
			this.changeValue("Stone", stoneProd);
			this.changeValue("Gold", goldGeneration);
		},
	});

	SIM.ResourceManager = ResourceManager;
})()