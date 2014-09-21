var CastleSim = function() {
	this.shapes = [];
	this.pointLight = null;

	this.clock = new THREE.Clock();
	this.stats = null;
	this.graphics = new GraphicsEngine(this);
	this.grid = [];

	var that = this;

	this.onStartAnimation = function(data) {
		console.log("start");
		console.log(data);
	}

	this.init = function() {

		for (var x = 0; x < 4; x++) {
			this.grid[x] = [];

			for (var y = 0; y < 4; y++) {
				this.grid[x][y] = {
					x: x * 51 - 80, 
					y: y * 26.4, 
					z: 0,
					used: false
				};
			}
		};
		this.grid[0][0].used = true;
		this.grid[1][0].used = true;

		console.log(this.grid[2][0]);

		// listen for messages from the gui
		window.addEventListener( 'create-room', this.clickRoomButton );

		this.graphics.init();

		gui = new BlendCharacterGui();
	}

	this.clickRoomButton = function(data) {
		console.log(data.detail.room);


		for (var x = that.grid.length - 1; x >= 0; x--) {
				var box = that.grid[x][0];

				if (!box.used) {
					var boundingBox = new THREE.Mesh(
						new THREE.BoxGeometry(51, 26.4, 32.5), 
						new THREE.MeshBasicMaterial( { color: 0x44cc00, wireframe: true } )
						);
					boundingBox.position.set(box.x, box.y + 14, box.z);
					that.graphics.scene.add(boundingBox);
				}
		};
	};

	this.addRoom = function(model) {


/*		var helper = new THREE.BoundingBoxHelper(model, 0x33cc00);
helper.update();
console.log(helper);
// If you want a visible bounding box
this.graphics.scene.add(helper);
console.log(helper.box.max.x - helper.box.min.x);
console.log(helper.box.max.y - helper.box.min.y);
console.log(helper.box.max.z - helper.box.min.z);
*/
		console.log(model);

		var shape = new Room(this);
		shape.model = model;

		this.shapes.push(shape);
	};

	this.addShape = function(model) {

		var shape = new Shape(this);
		shape.model = model;
		this.shapes.push(shape);
	}

	this.mouseMove = function(event) {

		event.preventDefault();
		this.graphics.setMouse(event);

		var hoveredShape = this.graphics.getHoveredShape(this.getShapes());

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

	this.click = function( event ) {

		event.preventDefault();

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			if (this.shapes[i].hover) {
				this.shapes[i].modify();
			}
		};
	}

	this.render = function() {

		var delta = this.clock.getDelta();

		this.graphics.render();
	}

	this.update = function() {

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			this.shapes[i].update();
		};
	}

	this.onWindowResize = function() {

		this.graphics.resize();
	}

	this.getShapes = function() {

		var shapes = [];

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			shapes.push(this.shapes[i].model);
		};

		return shapes;
	};

	this.keypress = function (event) {
		var character = String.fromCharCode(event.keyCode)

		switch (character) {
			case "w":
				this.graphics.moveCamera("up")
				break
			case "a":
				this.graphics.moveCamera("left")
				break
			case "s":
				this.graphics.moveCamera("down")
				break
			case "d":
				this.graphics.moveCamera("right")
				break
		}
	}

	this.zoom = function(dt) {
		this.graphics.zoom(dt);
	}
}

var stats;
var sim = new CastleSim();

sim.init();
animate();

window.addEventListener( 'resize', onWindowResize, false );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
window.addEventListener("mousewheel", onWindowMouseWheel, false);
window.addEventListener("DOMMouseScroll", onWindowMouseWheel, false);
window.addEventListener("keypress", onWindowKeyPress, false)

function onDocumentMouseDown(event) {
	sim.click(event);
}

function onDocumentMouseMove(event) {
	sim.mouseMove(event);
}

function onWindowResize() {
	sim.onWindowResize();
}

function animate() {		
	requestAnimationFrame( animate );

	sim.update();
	sim.render();
	stats.update();
}

function onWindowMouseWheel(event) {
	var event = window.event || event; // old IE support
	var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
	//console.log(delta)
	sim.zoom(delta);
}

function onWindowKeyPress(event) {
	sim.keypress(event)
}


