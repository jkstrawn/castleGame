var GraphicsEngine = function(_sim) {
	this.renderer = null;
	this.scene = null;
	this.camera = null;
	this.projector = null;
	this.container = null;
	this.mouse = new THREE.Vector2();

	this.raycaster = new THREE.Raycaster();
	this.sim = _sim;

	this.parameters = {
		width: 2000,
		height: 2000,
		widthSegments: 250,
		heightSegments: 250,
		depth: 1500,
		param: 4,
		filterparam: 1
	};

	var that = this;

	this.init = function() {

		this.container = document.createElement( 'div' );
		document.body.appendChild( this.container );

		stats = new Stats();
		this.container.appendChild( stats.domElement );
		this.scene = new THREE.Scene();
		this.projector = new THREE.Projector();
		this.scene.fog = new THREE.Fog( 0xffffff, 1000, 10000 );

		this.addCamera();
		this.addLights();
		this.addRendered();
		this.addSkyDome();

		loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.load( "res/models/ground_block/ground_block6.dae", this.loadGround );
		loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.load( 'res/models/room/roomFurnished16.dae', this.createRooms );
		loader.load( 'res/models/chair.dae', this.loadChair );

		
		/*
		var boundingBox = new THREE.Mesh(
			new THREE.PlaneGeometry(165, 68, 3, 2), 
			new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } )
			);
		boundingBox.position.set(6, 34, 15);
		this.scene.add(boundingBox);
		*/
	}

	this.loadChair = function(collada) {


		var ground = collada.scene;
		ground = that.makeLambert(ground);
		var thing = ground.children[0].children[0].material;
		console.log(thing);
		thing.shininess = 0;

		ground.position.set(0, 50, 0);
		ground.rotation.y = -1.57;
		ground.scale.x = ground.scale.y = ground.scale.z = 5;

		that.scene.add(ground);
	};

	this.makeLambert = function(object) {

		for (var numShapes = 0; numShapes < object.children.length; numShapes++) {
			var shape = object.children[numShapes];
			for (var numObjects = shape.children.length - 1; numObjects >= 0; numObjects--) {
				var material = shape.children[numObjects].material;
				if (material.materials != null) {
					for (var numMaterials = material.materials.length - 1; numMaterials >= 0; numMaterials--) {
						material.materials[numMaterials].ambient = new THREE.Color(1, 1, 1);
					};
				} else {
					material.ambient = new THREE.Color(1, 1, 1);
				}
			};
		}

		return object;
	};

	this.addCamera = function() {

		this.camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.5, 3000000 );
		this.camera.position.set( 0, 50, 150 );
		this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
	}

	this.addLights = function() {
		
		var ambientLight = new THREE.AmbientLight( 0x808080 );
		this.scene.add( ambientLight );

		sim.pointLight = new THREE.PointLight( 0xffcc00, .8, 30 );
		sim.pointLight.position.set( 0, 100, 0 );
		this.scene.add( sim.pointLight );
	}

	this.addRendered = function() {

		this.renderer = new THREE.WebGLRenderer( { 
			antialias: true, 
			alpha: false, 
			clearColor: 0xfafafa, 
			clearAlpha: 1, 
			shadowMapEnabled: true,
			shadowMapType: THREE.PCFSoftShadowMap

		} );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.domElement.style.position = "relative";
		this.container.appendChild( this.renderer.domElement );

		this.renderer.setClearColor( this.scene.fog.color, 1 );

		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;
		this.renderer.physicallyBasedShading = true;
	}

	this.addSkyDome = function() {

		var cubeMap = new THREE.CubeTexture( [] );
		cubeMap.format = THREE.RGBFormat;
		cubeMap.flipY = false;

		var loader = new THREE.ImageLoader();
		loader.load( 'res/textures/skyboxsun25degtest.png', function ( image ) {

			var getSide = function ( x, y ) {

				var size = 1024;

				var canvas = document.createElement( 'canvas' );
				canvas.width = size;
				canvas.height = size;

				var context = canvas.getContext( '2d' );
				context.drawImage( image, - x * size, - y * size );

				return canvas;

			};

			cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
			cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
			cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
			cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
			cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
			cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
			cubeMap.needsUpdate = true;

		} );

		var cubeShader = THREE.ShaderLib['cube'];
		cubeShader.uniforms['tCube'].value = cubeMap;

		var skyBoxMaterial = new THREE.ShaderMaterial( {
			fragmentShader: cubeShader.fragmentShader,
			vertexShader: cubeShader.vertexShader,
			uniforms: cubeShader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		});

		var skyBox = new THREE.Mesh(
			new THREE.BoxGeometry( 1000000, 1000000, 1000000 ),
			skyBoxMaterial
		);
		
		this.scene.add( skyBox );
	}

	this.loadGround = function( collada ) {

		var ground = collada.scene;
		ground = that.makeLambert(ground);
		var thing = ground.children[0].children[0].material;
		console.log(thing);
		thing.shininess = 0;

		ground.position.set(0, -70, -100);
		ground.rotation.y = -1.57;
		ground.scale.x = ground.scale.y = ground.scale.z = 17;

		that.sim.addShape(ground);
		that.scene.add(ground);
	}

	this.createRooms = function(collada) {

		var dae = collada.scene;

		for (var i = 0; i < 2; i++) {
			var room = dae.clone();
			room = that.makeLambert(room);


			room.modify = function() {
				this.position.z += 10;
			};
			room.position.set(i * 51 - 80, 0, 0);
			room.rotation.y = Math.PI * 1.5;
			room.scale.x = room.scale.y = room.scale.z = 4;
			room.updateMatrix();

			that.sim.addRoom(room);
			that.scene.add( room );
		}
	}

	this.render = function() {
		this.renderer.render( this.scene, this.camera );
	};

	this.update = function() {
	};

	this.getHoveredShape = function(shapes) {

		var vector = new THREE.Vector3( this.mouse.x, this.mouse.y, 1 );
		this.projector.unprojectVector( vector, this.camera );
		this.raycaster.set( this.camera.position, vector.sub( this.camera.position ).normalize() );
		var intersects = this.raycaster.intersectObjects( shapes, true );

		if ( intersects.length > 0 ) {
			return this.getParent(intersects[0].object);
		}
		return null;
	};

	this.getParent = function(model) {

		if (model.parent.parent != null ) {
			return this.getParent(model.parent);
		}
		return model;
	};

	this.setMouse = function(event) {

		this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	};

	this.resize = function() {

		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( window.innerWidth, window.innerHeight );
	};

	this.zoom = function (increase) {
		if ((this.camera.fov - increase) > 0)
		{
			this.camera.fov -= increase
		}

		this.camera.updateProjectionMatrix(); 
	}

	this.moveCamera = function (direction) {
		switch (direction) {
			case "up":
				this.camera.position.y += 1
				break
			case "down":
				this.camera.position.y -= 1
				break
			case "left":
				this.camera.position.x -= 1
				break
			case "right":
				this.camera.position.x += 1
				break
		}
	}
};