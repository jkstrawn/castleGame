/*
var HollowCube = function(x, y, z, w, h, l) {

	this.shape = null;
	this.x = x;
	this.y = y;
	this.z = z;
	this.w = w;
	this.h = h;
	this.l = l;
	this.wallWidth = 10;

	this.init = function() {
		var sphereMaterial = new THREE.MeshLambertMaterial(
		{
			color: 0x888888
		});

		var block = new THREE.Mesh( new THREE.CubeGeometry( this.w, this.h, this.l ), sphereMaterial );
		var hole = new THREE.Mesh( new THREE.CubeGeometry(  this.w - this.wallWidth, 
															this.h - this.wallWidth, 
															this.l - this.wallWidth ), 
															sphereMaterial );
		hole.position.y = -this.wallWidth;

		var blockCSG	= THREE.CSG.toCSG(block);
		var holeCSG		= THREE.CSG.toCSG(hole);
	
		var blockCSG	= blockCSG.subtract(holeCSG);
		var finalShape	= THREE.CSG.fromCSG( blockCSG );

		this.shape = new THREE.Mesh( finalShape, sphereMaterial );
		this.shape.position.x = this.x;
		this.shape.position.y = this.y;
		this.shape.position.z = this.z;
	}

	this.update = function() {

	}
}
*/
var Cube = function(x, y, z, w, h, l) {

	this.shape = null;
	this.x = x;
	this.y = y;
	this.z = z;
	this.w = w;
	this.h = h;
	this.l = l;

	this.init = function() {
		var sphereMaterial = new THREE.MeshLambertMaterial(
		{
			color: 0xCC00CC
		});

		this.shape = new THREE.Mesh(
			new THREE.CubeGeometry(this.w, this.h, this.l),
			sphereMaterial
		);
		this.shape.position.x = x;
		this.shape.position.y = y;
		this.shape.position.z = z;
	}
}

var CastleSim = function() {
	this.width = 800;
	this.height = 500;
	this.renderer = null;
	this.scene = null;
	this.camera = null;
	this.lightCube = null;
	this.shapes = [];
	this.projector = null;

	this.init = function() {

		this.scene = new THREE.Scene();
		this.projector = new THREE.Projector();

		this.addRenderer();
		this.addLight();
		this.addCamera();
		

		for (var i = -2; i < 3; i++) {
			var cubey = this.addCube(i * 50, 0, 30, 50, 50, 50);
			this.shapes.push(cubey);
		}
		//this.lightCube = this.addCube(0, -100, 90, 10, 10, 10);

		var material = new THREE.MeshLambertMaterial({
			map: THREE.ImageUtils.loadTexture('dirt.jpg')
		});
		var plane = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), material);
		plane.overdraw = true;
		this.scene.add(plane);
	}

	this.addLight = function() {
		var pointLight = new THREE.PointLight( 0xFFFFFF );

		pointLight.position.x = 0;
		pointLight.position.y = -150;
		pointLight.position.z = 200;

		this.scene.add(pointLight);
		return pointLight;
	}

	this.addCamera = function() {
		this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
		this.camera.position.y = -400;
		this.camera.position.z = 200;
		this.camera.rotation.x = 45 * (Math.PI / 180);
		this.camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
		this.scene.add(this.camera);
	}

	this.addRenderer = function() {
		var $container = $('#container');
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(this.width, this.height);
		$container.append(this.renderer.domElement);
	}

	this.addCube = function(x, y, z, w, h, l) {
		var cube = new Cube(x, y, z, w, h, l);
		cube.init();
		this.scene.add(cube.shape);
		return cube;
	}

	this.addHollowCube = function(x, y, z, w, h, l) {
		var hollowCube = new HollowCube(x, y, z, w, h, l);
		hollowCube.init();
		this.scene.add(hollowCube.shape);
		return hollowCube;
	}

	this.render = function() {
		this.renderer.render(this.scene, this.camera);
	}

	this.update = function() {

	}

	this.click = function( event ) {
		var objects = [];
		for (var i = 0; i < this.shapes.length; i++) {
			objects.push(this.shapes[i].shape);
		};

		event.preventDefault();

		var vector = new THREE.Vector3( ( event.clientX / this.width ) * 2 - 1, - ( event.clientY / this.height ) * 2 + 1, 0.5 );
		this.projector.unprojectVector( vector, this.camera );

		var raycaster = new THREE.Raycaster( this.camera.position, vector.sub( this.camera.position ).normalize() );

		var intersects = raycaster.intersectObjects( objects );

		if ( intersects.length > 0 ) {

			intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
		}
	}
}

function onDocumentMouseDown(event) {
	castleSim.click(event);
}

var castleSim = new CastleSim();
castleSim.init();

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
		  window.webkitRequestAnimationFrame ||
		  window.mozRequestAnimationFrame    ||
		  function( callback ){
			window.setTimeout(callback, 1000 / 60);
		  };
})();

(function animloop(){
	requestAnimFrame(animloop);
	castleSim.update();
	castleSim.render();
})();

document.addEventListener( 'mousedown', onDocumentMouseDown, false );