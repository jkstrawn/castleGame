(function() {

	var AudioManager = my.Class({

		constructor: function(_sim) {

			this.sim = _sim;
			this.sounds = [];
		},

		addSound: function (sources, radius, volume, position) {
			var sound = new Sound(sources, radius, volume);
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

		constructor: function (sources, radius, volume) {
			this.radius = radius;
			this.volume = volume;
			this.audio = document.createElement( 'audio' );
			this.position = new THREE.Vector3();

			for ( var i = 0; i < sources.length; i ++ ) {
				var source = document.createElement( 'source' );
				source.src = sources[ i ];

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

