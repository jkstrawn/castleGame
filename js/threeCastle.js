var SCREEN_WIDTH = window.innerWidth,
	SCREEN_HEIGHT = window.innerHeight,
	pointLight = null;

var Shape = function() {
	
	this.model = null;
	this.hover = false;

	this.init = function(_model) {
		this.model = _model;
	}

	this.update = function() {
		//this.model.rotation.y += .01;
	};

	this.setHover = function(_hover) {

		if (!this.hover && _hover) {
			this.createLight();
		}
		if (this.hover && !_hover) {
			this.removeLight();
		}
		this.hover = _hover;
	}

	this.modify = function() {
	};

	this.createLight = function() {};
	this.removeLight = function() {};
}

var Room = function() {

	Shape();
	this.light = null;

	this.createLight = function() {

		pointLight.position.set( this.model.position.x, this.model.position.y + 20, this.model.position.z + 10 );
	}

	this.removeLight = function() {

		if (pointLight.position.x == this.model.position.x)
		pointLight.position.set( 0, 100, 0 );
	};

	this.modify = function() {

		this.model.position.z += 10;

		pointLight.position.set( this.model.position.x, this.model.position.y + 20, this.model.position.z + 10 );
	}
}

Room.prototype = new Shape();
Room.prototype.constructor = Room;

var CastleSim = function() {

	this.renderer = null;
	this.scene = null;
	this.camera = null;
	this.lightCube = null;
	this.shapes = [];
	this.projector = null;
	this.clock = new THREE.Clock();
	this.container = null;
	this.stats = null;
	this.mouse = new THREE.Vector2();
	this.raycaster = new THREE.Raycaster();

	this.parameters = {
		width: 2000,
		height: 2000,
		widthSegments: 250,
		heightSegments: 250,
		depth: 1500,
		param: 4,
		filterparam: 1
	};

	this.init = function() {

		this.container = document.createElement( 'div' );
		document.body.appendChild( this.container );

		this.scene = new THREE.Scene();
		this.projector = new THREE.Projector();
		this.scene.fog = new THREE.Fog( 0xffffff, 1000, 10000 );

		this.addCamera();
		this.addLights();
		this.addRendered();
		this.addSkyDome();

		loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.load( "res/models/ground_block/ground_block3.dae", this.loadGround );
		loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.load( 'res/models/room/roomFurnished16.dae', this.createRooms );

		/*
		var boundingBox = new THREE.Mesh(
			new THREE.PlaneGeometry(165, 68, 3, 2), 
			new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } )
			);
		boundingBox.position.set(6, 34, 15);
		this.scene.add(boundingBox);
		*/

		stats = new Stats();
		this.container.appendChild( stats.domElement );
	}

	this.loadGround = function( collada ) {

		var ground = collada.scene;
		ground = sim.makeLambert(ground);
		var thing = ground.children[0].children[0].material;
		console.log(thing);
		thing.shininess = 0;

		ground.position.set(0, -70, -100);
		ground.rotation.y = -1.57;
		ground.scale.x = ground.scale.y = ground.scale.z = 17;
		console.log(ground);

		var shape = new Shape();
		shape.model = ground;

		sim.shapes.push(shape);
		sim.scene.add(ground);
	}

	this.createRooms = function(collada) {

		var dae = collada.scene;

		for (var i = 0; i < 3; i++) {
			var room = dae.clone();
			room = sim.makeLambert(room);


			room.modify = function() {
				this.position.z += 10;
			};
			room.position.set(i * 56 - 50, 0, 0);
			room.rotation.y = Math.PI * 1.5;
			room.scale.x = room.scale.y = room.scale.z = 4;
			room.updateMatrix();

			sim.scene.add(room);
			var shape = new Room();
			shape.model = room;

			sim.shapes.push(shape);
			sim.scene.add( room );
		}
	}

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

		pointLight = new THREE.PointLight( 0xffcc00, .8, 30 );
		pointLight.position.set( 0, 100, 0 );
		this.scene.add( pointLight );
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
		this.renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
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

	this.mouseMove = function(event) {

		event.preventDefault();
		var hoveredShape = null;

		this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		var vector = new THREE.Vector3( this.mouse.x, this.mouse.y, 1 );
		this.projector.unprojectVector( vector, this.camera );
		this.raycaster.set( this.camera.position, vector.sub( this.camera.position ).normalize() );
		var intersects = this.raycaster.intersectObjects( this.getShapes(), true );

		if ( intersects.length > 0 ) {
			hoveredShape = this.getParent(intersects[0].object);
		}

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			var shape = this.shapes[i];

			if (shape.model == hoveredShape) {
				shape.setHover(true);
			}
			else {
				shape.setHover(false);
			}
		};

	}

	this.getParent = function(model) {

		if (model.parent.parent != null ) {
			return this.getParent(model.parent);
		}
		return model;
	};

	this.click = function( event ) {

		event.preventDefault();

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			if (this.shapes[i].hover) {
				this.shapes[i].modify();
			}
		};
	}

	this.keypress = function (event) {
		var character = String.fromCharCode(event.keyCode)

		switch (character) {
			case "w":
				this.moveCamera("up")
				break
			case "a":
				this.moveCamera("left")
				break
			case "s":
				this.moveCamera("down")
				break
			case "d":
				this.moveCamera("right")
				break
		}
	}

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

	this.render = function() {

		var delta = this.clock.getDelta();

		this.renderer.render( this.scene, this.camera );
	}

	this.update = function() {

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			this.shapes[i].update();
		};
	}

	this.onWindowResize = function() {

		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( window.innerWidth, window.innerHeight );
	}

	this.getShapes = function() {

		var shapes = [];

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			shapes.push(this.shapes[i].model);
		};

		return shapes;
	}
}

var stats, sim

document.addEventListener("DOMContentLoaded",function(){ 
	sim = new CastleSim();

	sim.init();
	animate();
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener("mousewheel", onWindowMouseWheel, false);
	window.addEventListener("DOMMouseScroll", onWindowMouseWheel, false);
	window.addEventListener("keypress", onWindowKeyPress, false)
})

function onDocumentMouseDown(event) {
	sim.click(event);
}

function onDocumentMouseUp(event) {

}

function onDocumentMouseMove(event) {
	sim.mouseMove(event);
}

function onWindowResize() {
	sim.onWindowResize();
}

function onWindowMouseWheel(event) {
		// cross-browser wheel delta
	var event = window.event || event; // old IE support
	var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
	//console.log(delta)
	sim.zoom(delta)
}

function onWindowKeyPress(event) {
	sim.keypress(event)
}

function animate() {		
	requestAnimationFrame( animate );

	sim.update();
	sim.render();
	stats.update();
}

