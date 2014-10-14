(function() {

	var GraphicsEngine = my.Class({

		constructor: function(_sim) {

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
			this.particles = new SIM.ParticleSystem();

			this.parameters = {
				width: 2000,
				height: 2000,
				widthSegments: 250,
				heightSegments: 250,
				depth: 1500,
				param: 4,
				filterparam: 1
			};
		},

		init: function(urls, callback) {

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

			this.particles.init(this.scene);

			//add hall flames

			var width = 500;
			var length = 1000;
			var geometry = new THREE.PlaneGeometry(length, width, 9, 9);

			for (var i = 20, l = geometry.vertices.length - 40; i < l; i++) {
				geometry.vertices[i].z = Math.random() * 50;
			}
			for (var i = 10, l = 20; i < l; i++) {
				geometry.vertices[i].z = 50 + Math.random() * 20;
			}

			var texture = '../res/textures/grass.png';
			var textureObject = THREE.ImageUtils.loadTexture(texture);
			textureObject.wrapS = THREE.RepeatWrapping;
			textureObject.wrapT = THREE.RepeatWrapping;
			textureObject.anisotropy = 16;
			var textureRepeatX = Math.ceil(length / 80);
			var textureRepeatY = Math.ceil(width / 80);
			textureObject.repeat.set(textureRepeatX, textureRepeatY);

			var material4 = new THREE.MeshBasicMaterial({
				map: textureObject
			});
			var plane = new THREE.Mesh(geometry, material4);
			plane.rotation.x = -1/2 * Math.PI;
			plane.position.set(0, 0, -100);
			this.scene.add(plane);

			var flame1 = new THREE.PointLight( 0xffcc00, 1.5, 20 );
			flame1.position.set( -9.3, 9.5, 5.2 );
			this.scene.add( flame1 );

			var flame2 = new THREE.PointLight( 0xffcc00, 1.5, 20 );
			flame2.position.set( -30, 9.5, 5.2 );
			this.scene.add( flame2 );

			var flame3 = new THREE.PointLight( 0xffcc00, 1.5, 20 );
			flame3.position.set( -48, 9.5, 5.2 );
			this.scene.add( flame3 );

			var flame4 = new THREE.PointLight( 0xffcc00, 1.5, 20 );
			flame4.position.set( 12, 9.5, 5.2 );
			this.scene.add( flame4 );

			var flame5 = new THREE.PointLight( 0xffcc00, 1.5, 20 );
			flame5.position.set( 34, 9.5, 5.2 );
			this.scene.add( flame5 );
		},

		addRoomSpotParticles: function(position, width, length) {
			this.particles.addBoundingEmitter(position, width, length);
		},

		addFlame: function(position) {
			this.particles.addFlameEmitter(position);
		},

		loadModel: function(url, callback) {

			var that = this;
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
		},

		removeDraggingObjects: function() {
			for (var i = this.tempObjects.length - 1; i >= 0; i--) {
				this.scene.remove(this.tempObjects[i]);
			};

			this.tempObjects = [];
			this.particles.stopParticles("Bounding");
		},

		addDraggingRoom: function(room) {
			this.tempObjects.push(room);
			this.scene.add(room);
		},

		addBoundingBox: function(box) {
			this.tempObjects.push(box);
			this.scene.add(box);
		},

		getModel: function(url) {

			for (var i = this.models.length - 1; i >= 0; i--) {
				if (this.models[i].url == url) {
					var model = this.models[i].model.clone();

					model.traverse(function(thing) {
						if (thing.material instanceof THREE.MeshLambertMaterial) {
							//thing.material.map.magFilter = THREE.LinearFilter;
							//thing.material.map.minFilter = THREE.NearestMipMapLinearFilter;
							thing.material.map.anisotropy = 16;
						}
					});

					return model;
				}
			};

			return null;
		},

		addCamera: function() {

			this.camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.5, 3000000 );
			this.camera.position.set( 0, 50, 150 );
			this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
		},

		addLights: function() {
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

			this.sim.pointLight = new THREE.PointLight( 0xffcc00, 2, 30 );
			this.sim.pointLight.position.set( 0, 100, 0 );
			this.scene.add( this.sim.pointLight );
		},

		addRendered: function() {

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
		},

		addSkyDome: function() {

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
		},

		render: function() {
			this.particles.render();
			this.renderer.render( this.scene, this.camera );
			TWEEN.update();
		},

		update: function() {
		},

		getHoveredShape: function(shapes) {

			var vector = new THREE.Vector3( this.mouse.x, this.mouse.y, 1 );
			this.projector.unprojectVector( vector, this.camera );
			this.raycaster.set( this.camera.position, vector.sub( this.camera.position ).normalize() );
			var intersects = this.raycaster.intersectObjects( shapes, true );

			if ( intersects.length > 0 ) {
				return this.getParent(intersects[0].object);
			}
			return null;
		},

		getParent: function(model) {

			if (model.parent.parent != null ) {
				return this.getParent(model.parent);
			}
			return model;
		},

		setRightMouseButtonDown: function(isDown) {
			this.mouse.isRightDown = isDown;
		},

		mouseMove: function(event) {

			var newX = ( event.clientX / window.innerWidth ) * 2 - 1;
			var newY = - ( (event.clientY - 19) / window.innerHeight ) * 2 + 1;

			var distanceX = this.mouse.x - newX;
			var distanceY = this.mouse.y - newY;

			this.mouse.x = newX;
			this.mouse.y = newY;

			if (this.mouse.isRightDown) {
				this.camera.position.add(new THREE.Vector3(
					distanceX * 70, 
					distanceY * 40, 
					0)
				);
			}

			var vector = new THREE.Vector3(
			    this.mouse.x,
			    this.mouse.y,
			    0.5 );

			this.projector.unprojectVector( vector, this.camera );
			var dir = vector.sub( this.camera.position ).normalize();
			var distance = - this.camera.position.z / dir.z;
			var pos = this.camera.position.clone().add( dir.multiplyScalar( distance ) );

			return pos;
		},

		getMousePositionByZ: function(event, z) {

			var x = ( event.clientX / window.innerWidth ) * 2 - 1;
			var y = - ( (event.clientY - 19) / window.innerHeight ) * 2 + 1;

			var vector = new THREE.Vector3(x, y, 0.5);
			this.projector.unprojectVector( vector, this.camera );
			this.raycaster.set( this.camera.position, vector.sub( this.camera.position ).normalize() );
			var factor = (z - this.camera.position.z) / this.raycaster.ray.direction.z;
	        var position = new THREE.Vector3(
	            this.camera.position.x + this.raycaster.ray.direction.x * factor,
	            this.camera.position.y + this.raycaster.ray.direction.y * factor,
	            this.camera.position.z + this.raycaster.ray.direction.z * factor
	        );

			return position;
		},

		resize: function() {
			
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();

			this.renderer.setSize( window.innerWidth, window.innerHeight );
		},

		focusCamera: function(x, y, z) {
			var cameraZ = this.camera.position.z;
			console.log(cameraZ);

			var tween = new TWEEN.Tween(this.camera.position).to({
			    x: x,
			    y: y + cameraZ / 2 - 15,
			    z: cameraZ
			}, 800).easing(TWEEN.Easing.Linear.None).onUpdate(function (time) {
				//console.log(test + " at " + new Date())
			    //that.camera.lookAt(new THREE.Vector3(x,y,cameraZ));
			}).onComplete(function () {
			    //that.camera.lookAt(new THREE.Vector3(x,y,cameraZ));
			}).start();
		},

		zoom: function(increase) {
			if ((this.camera.fov - increase) > 0)
			{
				var vector = new THREE.Vector3( 0, 0, -1 );

				vector.applyQuaternion( this.camera.quaternion );

				this.camera.position.add( vector.multiplyScalar( increase * 4 ));
				//this.camera.fov -= increase
			}

			this.camera.updateProjectionMatrix(); 
		},

		moveCamera: function(direction) {
			switch (direction) {
				case "up":
					this.camera.position.y += 1;
					break
				case "down":
					this.camera.position.y -= 1;
					break
				case "left":
					this.camera.position.x -= 1;
					break
				case "right":
					this.camera.position.x += 1;
					break
			}
		},

		addModel: function(model) {
			this.scene.add(model);
		},

		removeModel: function(model) {
			this.scene.remove(model);
		}

	});

	SIM.GraphicsEngine = GraphicsEngine;
})()