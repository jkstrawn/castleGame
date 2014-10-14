var AudioManager = function(_sim) {
	var that = this;
	this.sim = _sim;
	this.sounds = [];

	this.init = function() {
	};

	this.addSound = function (sources, radius, volume, position) {
		var sound = new Sound(sources, radius, volume);
		sound.position.copy(position);
		sound.play();

		this.sounds.push(sound);

		return sound;
	}

	this.update = function (dt, camera) {
		for(var i = 0; i < this.sounds.length; i++) {
			this.sounds[i].update(camera);
		}
	}

	this.init();
}

var Sound = function (sources, radius, volume) {
	var audio = document.createElement( 'audio' );
	this.position = new THREE.Vector3();

	for ( var i = 0; i < sources.length; i ++ ) {
		var source = document.createElement( 'source' );
		source.src = sources[ i ];

		audio.appendChild( source );
	}


	this.play = function () {
		audio.play();
	}

	this.update = function (camera) {
		var distance = this.position.distanceTo( camera.position );

		if ( distance <= radius ) {
			audio.volume = volume * ( 1 - distance / radius );
		} else {
			audio.volume = 0;
		}
	}
}
