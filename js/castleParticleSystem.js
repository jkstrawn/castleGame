(function(){

	var ParticleSystem = my.Class({

		constructor: function() {
			this.particleVectors;
			this.particles;
			this.Pool;
			this.particleCloud;
			this.emitters = [];
			this.numOfParticles = 1000;

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
		},

		init: function(scene) {

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

				vertexShader: document.getElementById( 'vertexShaderParticle' ).textContent,
				fragmentShader: document.getElementById( 'fragmentShaderParticle' ).textContent,

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
		},

		getNewOrUsedEmitter: function() {

			for (var i = this.emitters.length - 1; i >= 0; i--) {
				if (!this.emitters[i].using) {
					emitter = this.emitters[i];
					return emitter;
				}
			};

			var emitter = new SPARKS.Emitter(new SPARKS.SteadyCounter(0));
			emitter.addCallback( "created", $.proxy(this.onParticleCreated, this) );
			emitter.addCallback( "dead", $.proxy(this.onParticleDead, this) );
			return emitter;
		},

		addBoundingEmitter: function(startPoint, width, length, segments) {

			var properties = new SIM.ParticleType.Bounding(startPoint, width, length, segments);
			this.addEmitter(properties);
		},

		addFlameEmitter: function(startPoint) {

			var properties = new SIM.ParticleType.Flame(startPoint);
			this.addEmitter(properties);
		},

		addEmitter: function(properties) {

			var that = this;
			var emitter = this.getNewOrUsedEmitter();
			var zone = new SPARKS.ParallelogramZone( properties.startPoint, new THREE.Vector3(properties.width, 0, 0),
			 new THREE.Vector3(0, 0, properties.length)	);

			emitter._counter.rate = properties.rate;
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


			emitter.start();
			this.emitters.push(emitter);
		},

		stopParticles: function(type) {

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
		},

		stopEmitter: function(emitter) {

			emitter.using = false;
			emitter.stop();

			var particles = emitter.removeAll();
			for (var p = particles.length - 1; p >= 0; p--) {
				if (particles[p].target != null) {
					this.Pool.add(particles[p].target);
				}
			};
		},

		render: function() {
			this.particleCloud.geometry.verticesNeedUpdate = true;
			this.particleVectors.size.needsUpdate = true;
			this.particleVectors.pcolor.needsUpdate = true;
		},

		setTargetParticle: function(properties) {
			
			var index = this.Pool.get();

			if (this.particleVectors.pcolor.value[index] == null) {
				console.log("ERROR: ColorValue at index of " + index + " was undefined!");
			}

			this.particleVectors.size.value[ index ] = Math.random() * properties.sizeVariance + properties.sizeBase;
			this.particleVectors.pcolor.value[ index ].setHSL( 
				properties.color.hue + Math.random() * .1 - .05, 
				properties.color.saturation, 
				properties.color.lightness 
			);

			return index;
		},

		onParticleCreated: function( p ) {

			var index = p.target;

			if ( index ) {
				this.particles.vertices[ index ] = p.position;
			};

		},

		onParticleDead: function( particle ) {

			var target = particle.target;
			if ( target ) {
				// Hide the particle
				this.particles.vertices[ target ].set( Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY );
				this.particleVectors.size.value[target] = 0;

				// Mark particle system as available by returning to this.pool
				this.Pool.add( particle.target );
			}
		},

		generateSprite: function() {

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

	});

	SIM.ParticleSystem = ParticleSystem;



	SIM.ParticleType = {};

	SIM.ParticleType.Flame = my.Class({

		constructor: function(startPoint) {

			this.rate = 25;
			this.sizeBase = 5;
			this.sizeVariance = 5;
			this.color = {
				hue: .10,
				saturation: .6,
				lightness: .1
			};
			this.lifeMin = .5;
			this.lifeMax = 1;
			this.acceleration = 2;
			this.width = 1;
			this.length = 1;
			this.startPoint = startPoint;
			this.name = "Flame";
		}
	});

	SIM.ParticleType.Bounding = my.Class({

		constructor: function(startPoint, width, length, segments) {

			this.rate = segments * 7;
			this.sizeBase = 8;
			this.sizeVariance = 5;
			this.color = {
				hue: .3,
				saturation: .6,
				lightness: .1
			};
			this.lifeMin = .75;
			this.lifeMax = 1.5;
			this.acceleration = 5;
			this.width = width;
			this.length = length;
			this.startPoint = startPoint;
			this.name = "Bounding";
		}
	});

})()