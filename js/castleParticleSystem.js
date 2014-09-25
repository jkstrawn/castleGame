function ParticleSystem() {
	this.particleVectors;
	this.particles;
	this.Pool;
	this.particleCloud;
	this.emitters = [];
	this.numOfParticles = 200;

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

	this.addEmitter = function(startPoint, width, length) {

		var emitter = this.getNewOrUsedEmitter();
		var zone = new SPARKS.ParallelogramZone( startPoint, new THREE.Vector3(width,0,0),
		 new THREE.Vector3(0,0,length)	);

		emitter.using = true;
		emitter.addInitializer(new SPARKS.Position( zone ) );
		emitter.addInitializer(new SPARKS.Lifetime(.75,1.5));
		emitter.addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0,5,0))));
		emitter.addInitializer(new SPARKS.Target(null, this.setTargetParticle));		

		emitter.addAction(new SPARKS.Age());
		emitter.addAction(new SPARKS.Move()); 
		emitter.addAction(new SPARKS.RandomDrift(40,0,40));
		emitter.addAction(new SPARKS.Accelerate(0,5,0));


		emitter.addCallback( "created", this.onParticleCreated );
		emitter.addCallback( "dead", this.onParticleDead );
		emitter.start();
		this.emitters.push(emitter);
	}

	this.stop = function() {
		for (var i = this.particles.vertices.length - 1; i >= 0; i--) {
			this.particles.vertices[i] = new THREE.Vector3(1000, 1000, 1000);
		};
		for (var i = this.emitters.length - 1; i >= 0; i--) {
			this.emitters[i].using = false;
			var particles = this.emitters[i].removeAll();
			for (var p = particles.length - 1; p >= 0; p--) {
				if (particles[p].target != null) {
					this.Pool.add(particles[p].target);
				}
			};
		};

		if(this.Pool.__pool.length != this.numOfParticles) {
			console.log("Uh oh... missing particles after we reset the emitters. We expected to have " +
				this.numOfPartcles + " but we got " + this.Pool.__pool.length);
		}
	}

	this.render = function() {
		this.particleCloud.geometry.verticesNeedUpdate = true;
		this.particleVectors.size.needsUpdate = true;
		this.particleVectors.pcolor.needsUpdate = true;
	}

	this.setTargetParticle = function() {

		var index = that.Pool.get();

		that.particleVectors.size.value[ index ] = Math.random() * 15 + 5;
		if (that.particleVectors.pcolor.value[index] == null) {
			console.log("ERROR: ColorValue at index of " + index + " was undefined!");
		}
		that.particleVectors.pcolor.value[ index ].setHSL( .3, 0.6, 0.1 );

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