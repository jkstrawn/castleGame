var GraphicsEngine = function(_sim) {
	this.renderer = null;
	this.scene = null;
	this.camera = null;
	this.projector = null;
	this.container = null;
	this.mouse = new THREE.Vector2();

	this.raycaster = new THREE.Raycaster();
	this.sim = _sim;
	this.models = [];
	this.numModelsToLoad = 0;
	this.tempObjects = [];

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

	this.init = function(urls, callback) {

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

		this.numModelsToLoad = urls.length;
		for (var i = urls.length - 1; i >= 0; i--) {
			this.loadModel(urls[i], callback);
		};

	}

	this.loadModel = function(url, callback) {

		loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.load( url, function(collada) {
			var model = collada.scene;

			//model = that.makeLambert(model);
			that.models.push({
				model: model,
				url: url
			});

			that.numModelsToLoad--;
			if (that.numModelsToLoad == 0) {
				callback();
			}
		});
	};

	this.removeDraggingObjects = function() {
		for (var i = this.tempObjects.length - 1; i >= 0; i--) {
			this.scene.remove(this.tempObjects[i]);
		};

		this.tempObjects = [];
	};

	this.addDraggingRoom = function(room) {
		this.tempObjects.push(room);
		this.scene.add(room);
	};

	this.addBoundingBox = function(box) {
		this.tempObjects.push(box);
		this.scene.add(box);
	};

	this.getModel = function(url) {

		for (var i = this.models.length - 1; i >= 0; i--) {
			if (this.models[i].url == url) {
				return this.models[i].model.clone();
			}
		};

		return null;
	};

	this.addCamera = function() {

		this.camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.5, 3000000 );
		this.camera.position.set( 0, 50, 150 );
		this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
	}

	this.addLights = function() {
		var hemiLight = new THREE.HemisphereLight(0xffe5bb, 0xFFBF00, .6);
		hemiLight.position.set( 0, 500, 0 );
		this.scene.add(hemiLight);

		//var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
		//hemiLight.color.setHSL( .5, .5, .5 );
		//hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
		//hemiLight.position.set( 0, 500, 0 );
		//this.scene.add( hemiLight );

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

		var vector = new THREE.Vector3(
		    this.mouse.x,
		    this.mouse.y,
		    0.5 );

		this.projector.unprojectVector( vector, this.camera );
		var dir = vector.sub( this.camera.position ).normalize();
		var distance = - this.camera.position.z / dir.z;
		var pos = this.camera.position.clone().add( dir.multiplyScalar( distance ) );

		return pos;
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

	this.addModel = function(model) {
		this.scene.add(model);
	};
};