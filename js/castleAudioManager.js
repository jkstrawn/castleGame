(function() {

	var AudioManager = my.Class({

		constructor: function(_sim) {
			this.sim = _sim;
			this.sounds = [];
			this.mute = false;
		},

		addSound: function (sources, radius, volume, position, audioAttributes) {
			var sound = new Sound(sources, radius, volume, position, audioAttributes);
			sound.play();
			sound.mute(this.mute);

			this.sounds.push(sound);

			return sound;
		},

		toggleSound: function () {
			this.mute = !this.mute;

			for (var i = 0; i < this.sounds.length; i++) {
				this.sounds[i].mute(this.mute);
			}
		},

		update: function (dt, camera) {
			for(var i = 0; i < this.sounds.length; i++) {
				this.sounds[i].update(camera);
			}
		},

	});

	SIM.AudioManager = AudioManager;


	var Sound = my.Class({

		constructor: function (sources, radius, volume, position, audioAttributes) {
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

			if (position)
			{
				this.position = new THREE.Vector3();
				this.position.copy(position);
			}			

			for ( var i = 0; i < sources.length; i ++ ) {
				var source = document.createElement( 'source' );
				source.src = "res/sounds/" + sources[i];

				this.audio.appendChild( source );
			}
		},

		play: function () {
			this.audio.play();
		},

		mute: function (muted) {
			this.audio.muted = muted;
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

})()

