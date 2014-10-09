function ParticleSystem() {
	this.particleVectors;
	this.particles;
	this.Pool;
	this.particleCloud;
	this.emitters = [];
	this.numOfParticles = 1000;

	var that = this;

	this.Pool = {
		__pool: [],
		get: function() {
			if ( this.__pool.length > 0 ) {
				var thing = this.__pool.pop();
				return thing;
			}
			console.log( "pool ran out!" )
			return null;
		},

		add: function( v ) {
			this.__pool.push( v );
		}
	};

	this.init = function(scene) {

		this.particles = new THREE.Geometry();
		this.particleVectors = {

			size:  { type: 'f', value: [] },
			pcolor: { type: 'c', value: [] }

		};

		var sprite = this.generateSprite() ;

		texture = new THREE.Texture( sprite );
		texture.needsUpdate = true;

		uniforms = {
			texture:   { type: "t", value: texture }
		};

		var shaderMaterial = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			attributes: this.particleVectors,

			vertexShader: document.getElementById( 'vertexshader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

			blending: THREE.AdditiveBlending,
			depthWrite: false,
			transparent: true

		});

		this.particleCloud = new THREE.PointCloud( this.particles, shaderMaterial );
		this.particleCloud.dynamic = true;
		scene.add( this.particleCloud );

		for ( i = 0; i < this.numOfParticles; i ++ ) {
			this.particles.vertices.push( new THREE.Vector3(0, 0, 0) );
			this.Pool.add( i );
		}
		for( var i = 0; i < this.particleCloud.geometry.vertices.length; i++ ) {
			this.particleVectors.pcolor.value[i] = new THREE.Color( 0x000000 );
		}

		//this.test();
	}

	this.getNewOrUsedEmitter = function() {

		for (var i = this.emitters.length - 1; i >= 0; i--) {
			if (!this.emitters[i].using) {
				emitter = this.emitters[i];
				return emitter;
			}
		};

		return new SPARKS.Emitter(new SPARKS.SteadyCounter(30));
	}

	this.addBoundingEmitter = function(startPoint, width, length) {

		var properties = {
			sizeBase: 15,
			sizeVariance: 5,
			color: {
				hue: .3,
				saturation: .6,
				lightness: .1
			},
			lifeMin: .75,
			lifeMax: 1.5,
			acceleration: 5,
			width: width,
			length: length,
			startPoint: startPoint,
			name: "Bounding"
		}

		this.addEmitter(properties);
	}

	this.addFlameEmitter = function(startPoint) {

		var properties = {
			sizeBase: 10,
			sizeVariance: 3,
			color: {
				hue: .10,
				saturation: .6,
				lightness: .1
			},
			lifeMin: .5,
			lifeMax: 1,
			acceleration: 3,
			width: 1,
			length: 1,
			startPoint: startPoint,
			name: "Flame"
		}

		this.addEmitter(properties);
	}

	this.addEmitter = function(properties) {

		var emitter = this.getNewOrUsedEmitter();
		var zone = new SPARKS.ParallelogramZone( properties.startPoint, new THREE.Vector3(properties.width, 0, 0),
		 new THREE.Vector3(0, 0, properties.length)	);

		emitter.using = true;
		emitter.type = properties.name;
		emitter.addInitializer(new SPARKS.Position( zone ) );
		emitter.addInitializer(new SPARKS.Lifetime(properties.lifeMin, properties.lifeMax));
		emitter.addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0, 5, 0))));
		emitter.addInitializer(new SPARKS.Target(null, function() {
			return that.setTargetParticle(properties);
		}));

		emitter.addAction(new SPARKS.Age());
		emitter.addAction(new SPARKS.Move()); 
		emitter.addAction(new SPARKS.RandomDrift(40, 0, 40));
		emitter.addAction(new SPARKS.Accelerate(0, properties.acceleration, 0));


		emitter.addCallback( "created", this.onParticleCreated );
		emitter.addCallback( "dead", this.onParticleDead );
		emitter.start();
		this.emitters.push(emitter);
	}

	this.stopParticles = function(type) {

		console.log("stopping all " + type + " particles");

		for (var i = this.particles.vertices.length - 1; i >= 0; i--) {
			this.particles.vertices[i] = new THREE.Vector3(1000, 1000, 1000);
		};

		for (var i = this.emitters.length - 1; i >= 0; i--) {
			if (this.emitters[i].type == type) {
				this.stopEmitter(this.emitters[i]);
			}
		};

/*
		if(this.Pool.__pool.length != this.numOfParticles) {
			console.log("Uh oh... missing particles after we reset the emitters. We expected to have " +
				this.numOfPartcles + " but we got " + this.Pool.__pool.length);
		}
*/
	}

	this.stopEmitter = function(emitter) {

		emitter.using = false;
		emitter.stop();

		var particles = emitter.removeAll();
		for (var p = particles.length - 1; p >= 0; p--) {
			if (particles[p].target != null) {
				this.Pool.add(particles[p].target);
			}
		};
	};

	this.render = function() {
		this.particleCloud.geometry.verticesNeedUpdate = true;
		this.particleVectors.size.needsUpdate = true;
		this.particleVectors.pcolor.needsUpdate = true;
	}

	this.setTargetParticle = function(properties) {
		
		var index = this.Pool.get();

		if (this.particleVectors.pcolor.value[index] == null) {
			console.log("ERROR: ColorValue at index of " + index + " was undefined!");
		}

		this.particleVectors.size.value[ index ] = Math.random() * properties.sizeBase + properties.sizeVariance;
		this.particleVectors.pcolor.value[ index ].setHSL( properties.color.hue, properties.color.saturation, properties.color.lightness );

		return index;
	};

	this.onParticleCreated = function( p ) {

		var index = p.target;

		if ( index ) {
			that.particles.vertices[ index ] = p.position;
		};

	};

	this.onParticleDead = function( particle ) {

		var target = particle.target;
		if ( target ) {
			// Hide the particle
			that.particles.vertices[ target ].set( Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY );
			that.particleVectors.size.value[target] = 0;

			// Mark particle system as available by returning to this.pool
			that.Pool.add( particle.target );
		}
	};

	this.generateSprite = function() {

		var canvas = document.createElement( 'canvas' );
		canvas.width = 128;
		canvas.height = 128;

		var context = canvas.getContext( '2d' );

		context.beginPath();
		context.arc( 64, 64, 60, 0, Math.PI * 2, false) ;

		context.lineWidth = 0.5; //0.05
		context.stroke();
		context.restore();

		var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );

		gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
		gradient.addColorStop( 0.2, 'rgba(255,255,255,1)' );
		gradient.addColorStop( 0.4, 'rgba(200,200,200,1)' );
		gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

		context.fillStyle = gradient;
		context.fill();

		return canvas;
	}
}