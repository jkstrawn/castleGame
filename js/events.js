(function() {

	var EventManager = my.Class({

		constructor: function() {
			this.events = [];
			this.randomEventsOn = true;
			this.timeSinceLastEvent = null;
		},

		update: function (dt) {
			this.timeSinceLastEvent += dt;

			if (this.randomEventsOn) {
				var random = Math.random() * (1 - .1) + .1;
				var fireEvent = random < (.01 + (this.timeSinceLastEvent /1000000));

				if (fireEvent) {
					//In the future, have a random chance of each type of event, 
					//for now just fire wind.  Each event will have different chance
					//of happening, but need to work on this

					var newEvent = new Wind(sim);
					newEvent.start();
					this.events.push(newEvent);
					this.timeSinceLastEvent = 0;
				}
			}

			for(var i = 0; i < this.events.length; i++) {
				this.events[i].update(dt);
			}
		}

	});

	SIM.EventManager = EventManager;

	var Event = my.Class({
		constructor: function () {
			this.running = false;
			this.duration = 1000;
		},

		start: function() {
			this.running = true;
		},

		stop: function () {
			this.running = false;

		},

		update: function (dt) {
			if (this.running) {
				this.duration -= dt;

				if (this.duration <= 0)
				{
					this.stop();
				}
			}
		}
	});

	SIM.Event = Event;

	var Wind = my.Class(SIM.Event, {
		constructor: function() {
			Wind.Super.call(this);

			this.duration = 20000;
		},

		start: function() {
			Wind.Super.prototype.start.call(this);

			console.log("wind started");
			this.sound = sim.audio.addSound(["wind.mp3"], 0, 1, null, { loop: true })
		},

		stop: function () {
			Wind.Super.prototype.stop.call(this);
			console.log("wind stopped");

			this.sound.stop();
		},

		update: function (dt) {
			Wind.Super.prototype.update.call(this, dt);
			
		}
	});

	SIM.Wind = Wind;

	//Wind would just be a sound right now, maybe in future damage buildings

	//Plague - kill some peasants
	//Famine - stop food production for a while
	//Bountiful crop - food production higher for a while

})()

