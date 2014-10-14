(function() {

	var AudioManager = my.Class({

		constructor: function(_sim) {

			this.sim = _sim;
			this.sounds = [];
		},

		addSound: function (sources, radius, volume, position, audioAttributes) {
			var sound = new Sound(sources, radius, volume, audioAttributes);
			sound.position.copy(position);
			sound.play();

			this.sounds.push(sound);

			return sound;
		},

		update: function (dt, camera) {
			for(var i = 0; i < this.sounds.length; i++) {
				this.sounds[i].update(camera);
			}
		},

	});

	SIM.AudioManager = AudioManager;


	var Sound = my.Class({

		constructor: function (sources, radius, volume, audioAttributes) {
			this.radius = radius;
			this.volume = volume;
			this.audio = document.createElement( 'audio' );

			if (audioAttributes)
			{
				for(var key in audioAttributes)
				{
					if (key == "loop") { 
						//Chrome is not good at looping for some reason, so need to handle this
						this.audio.addEventListener("ended", function () {
							this.load();
						});
					}
					else {
						this.audio.setAttribute(key, audioAttributes[key]);
					}
				}
			}

			this.position = new THREE.Vector3();

			for ( var i = 0; i < sources.length; i ++ ) {
				var source = document.createElement( 'source' );
				source.src = "res/sounds/" + sources[i];

				this.audio.appendChild( source );
			}
		},

		play: function () {
			this.audio.play();
		},

		update: function (camera) {
			var distance = this.position.distanceTo( camera.position );

			if ( distance <= this.radius ) {
				this.audio.volume = this.volume * ( 1 - distance / this.radius );
			} else {
				this.audio.volume = 0;
			}
		}
	});

})()

