(function() {

	var EventManager = my.Class({

		constructor: function(_sim) {
			this.sim = _sim;
			this.events = [];
			this.randomEventsOn = true;
		},

		addSound: function (sources, radius, volume, position, audioAttributes) {
			var sound = new Sound(sources, radius, volume, position, audioAttributes);
			sound.play();
			sound.mute(this.mute);

			this.sounds.push(sound);

			return sound;
		},

		update: function (dt, camera) {
			for(var i = 0; i < this.sounds.length; i++) {
				this.sounds[i].update(camera);
			}
		},

	});

	SIM.EventManager = EventManager;


	var Event = my.Class({

		constructor: function () {
			this.running = false;
			this.lastRunTime = null;
		},

		update: function (camera) {
			if (position) {
				var distance = this.position.distanceTo( camera.position );

				if ( distance <= this.radius ) {
					this.audio.volume = this.volume * ( 1 - distance / this.radius );
				} else {
					this.audio.volume = 0;
				}				
			}
			else {
				this.audio.volume = this.volume;
			}
		}
	});

	SIM.Event = Event;

	var Wind = my.Class(SIM.Event, {
		constructor: function(sim) {
			Wind.Super.call(this, sim, model, type);
		},

	});

	SIM.Wind = Wind;

	//Wind would just be a sound right now, maybe in future damage buildings

	//Plague - kill some peasants
	//Famine - stop food production for a while
	//Bountiful crop - food production higher for a while

})()

