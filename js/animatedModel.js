AnimatedModelLoader = function() {

	this.material = null;
	this.geometry = null;

	this.load = function ( url, onLoad ) {

		var self = this;

		var loader = new THREE.JSONLoader();
		loader.load( url, function( geometry, materials ) {

			var originalMaterial = materials[ 0 ];
			originalMaterial.skinning = true;

			self.material = originalMaterial;
			self.geometry = geometry;

			// Loading is complete, fire the callback
			if ( onLoad !== undefined ) onLoad();

		} );
	};

	this.createModel = function() {

		blendMesh = new THREE.AnimatedModel();
		blendMesh.load( this.geometry, this.material.clone() );

		return blendMesh;
	}
}



THREE.AnimatedModel = function () {

	this.animations = {};
	this.weightSchedule = [];
	this.warpSchedule = [];

	this.load = function ( geometry, material ) {

		THREE.SkinnedMesh.call( this, geometry, material );

		// Create the animations

		for ( var i = 0; i < geometry.animations.length; ++i ) {

			var animName = geometry.animations[ i ].name;
			var clonedAnim = $.extend(true, {}, geometry.animations[ i ]);
			this.animations[ animName ] = new THREE.Animation( this, clonedAnim );

		}

		// Create the debug visualization

		this.skeletonHelper = new THREE.SkeletonHelper( this );
		this.skeletonHelper.material.linewidth = 3;
		this.add( this.skeletonHelper );

		this.showSkeleton( false );

	};

	this.update = function( dt ) {

		for ( var i = this.weightSchedule.length - 1; i >= 0; --i ) {

			var data = this.weightSchedule[ i ];
			data.timeElapsed += dt;

			// If the transition is complete, remove it from the schedule

			if ( data.timeElapsed > data.duration ) {

				data.anim.weight = data.endWeight;
				this.weightSchedule.splice( i, 1 );

				// If we've faded out completely, stop the animation

				if ( data.anim.weight == 0 ) {

					data.anim.stop( 0 );

				}

			} else {

				// interpolate the weight for the current time

				data.anim.weight = data.startWeight + (data.endWeight - data.startWeight) * data.timeElapsed / data.duration;

			}

		}

		this.updateWarps( dt );
		this.skeletonHelper.update();

	};

	this.updateWarps = function( dt ) {

		// Warping modifies the time scale over time to make 2 animations of different
		// lengths match. This is useful for smoothing out transitions that get out of
		// phase such as between a walk and run cycle

		for ( var i = this.warpSchedule.length - 1; i >= 0; --i ) {

			var data = this.warpSchedule[ i ];
			data.timeElapsed += dt;

			if ( data.timeElapsed > data.duration ) {

				data.to.weight = 1;
				data.to.timeScale = 1;
				data.from.weight = 0;
				data.from.timeScale = 1;
				data.from.stop( 0 );

				this.warpSchedule.splice( i, 1 );

			} else {

				var alpha = data.timeElapsed / data.duration;

				var fromLength = data.from.data.length;
				var toLength = data.to.data.length;

				var fromToRatio = fromLength / toLength;
				var toFromRatio = toLength / fromLength;

				// scale from each time proportionally to the other animation

				data.from.timeScale = ( 1 - alpha ) + fromToRatio * alpha;
				data.to.timeScale = alpha + toFromRatio * ( 1 - alpha );

				data.from.weight = 1 - alpha;
				data.to.weight = alpha;

			}

		}

	}

	this.play = function(animName, weight, speed) {
		if (speed) {
			this.animations[ animName ].timeScale = speed;
		}
		this.animations[ animName ].play( 0, weight );

	};

	this.crossfade = function( fromAnimName, toAnimName, duration ) {

		var fromAnim = this.animations[ fromAnimName ];
		var toAnim = this.animations[ toAnimName ];

		fromAnim.play( 0, 1 );
		toAnim.play( 0, 0 );

		this.weightSchedule.push( {

			anim: fromAnim,
			startWeight: 1,
			endWeight: 0,
			timeElapsed: 0,
			duration: duration

		} );

		this.weightSchedule.push( {

			anim: toAnim,
			startWeight: 0,
			endWeight: 1,
			timeElapsed: 0,
			duration: duration

		} );

	};

	this.warp = function( fromAnimName, toAnimName, duration ) {

		var fromAnim = this.animations[ fromAnimName ];
		var toAnim = this.animations[ toAnimName ];

		fromAnim.play( 0, 1 );
		toAnim.play( 0, 0 );

		this.warpSchedule.push( {

			from: fromAnim,
			to: toAnim,
			timeElapsed: 0,
			duration: duration

		} );

	};

	this.applyWeight = function(animName, weight) {

		this.animations[ animName ].weight = weight;

	};

	this.pauseAll = function() {

		for ( var a in this.animations ) {

			if ( this.animations[ a ].isPlaying ) {

				this.animations[ a ].stop();

			}

		}

	};

	this.unPauseAll = function() {

	for ( var a in this.animations ) {

	  if ( this.animations[ a ].isPlaying && this.animations[ a ].isPaused ) {

		this.animations[ a ].pause();

	  }

	}

  };


	this.stopAll = function() {

		for ( a in this.animations ) {

			if ( this.animations[ a ].isPlaying ) {
				this.animations[ a ].stop(0);
			}

			this.animations[ a ].weight = 0;

		}

		this.weightSchedule.length = 0;
		this.warpSchedule.length = 0;

	}

	this.showSkeleton = function( boolean ) {

		this.skeletonHelper.visible = boolean;

	}

	this.showModel = function( boolean ) {

		this.visible = boolean;

	}

};


THREE.AnimatedModel.prototype = Object.create( THREE.SkinnedMesh.prototype );

THREE.AnimatedModel.prototype.getForward = function() {

	var forward = new THREE.Vector3();

	return function() {

		// pull the character's forward basis vector out of the matrix
		forward.set(
			-this.matrix.elements[ 8 ],
			-this.matrix.elements[ 9 ],
			-this.matrix.elements[ 10 ]
		);

		return forward;
	}
}
