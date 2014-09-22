var CastleSim = function() {
	this.shapes = [];
	this.pointLight = null;

	this.clock = new THREE.Clock();
	this.stats = null;
	this.graphics = new GraphicsEngine(this);
	this.grid = [];
	this.modelUrls = [
		"res/models/ground_block/ground_block16.dae",
		"res/models/room/roomFurnished19.dae"
	];
	this.draggingRoom = null;
	this.hoveredShape = null;

	var that = this;

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

		this.graphics.init(this.modelUrls, this.loadedModels);

		gui = new BlendCharacterGui();
	}

	this.loadedModels = function() {

		var ground = that.graphics.getModel(that.modelUrls[0]);

		ground.position.set(0, -70, -100);
		ground.rotation.y = -1.57;
		ground.scale.x = ground.scale.y = ground.scale.z = 17;


		that.addShape(ground);
		that.graphics.addModel(ground);


		for (var i = 0; i < 2; i++) {

			var room = that.graphics.getModel(that.modelUrls[1]);

			room.position.set(i * 51 - 80, 0, 0);
			room.rotation.y = Math.PI * 1.5;
			room.scale.x = room.scale.y = room.scale.z = 4;

			that.addRoom(room);
			that.graphics.addModel(room);
		}
	};

	this.clickRoomButton = function(data) {

		for (var x = that.grid.length - 1; x >= 0; x--) {
			var box = that.grid[x][0];

			if (!box.used) {
				that.addBoundable(box, x, 0);
			}
		};

		var room = that.graphics.getModel(that.modelUrls[1]);

		room.position.set(150, 50, 0);
		room.rotation.y = Math.PI * 1.5;
		room.scale.x = room.scale.y = room.scale.z = 4;
		room.traverse(function(thing) {
			if (thing.material instanceof THREE.MeshLambertMaterial) {
				var clonedMat = thing.material.clone();

				thing.material = clonedMat;
				thing.material.opacity = .4;
				thing.material.transparent = true;
			}
		});


		that.draggingRoom = room;
		that.graphics.addDraggingRoom(room);
	};

	this.placeRoom = function() {
		var gridPosition = this.grid[this.hoveredShape.x][this.hoveredShape.y];
		gridPosition.used = true;

		var room = this.graphics.getModel(this.modelUrls[1]);

		room.position.set(gridPosition.x, gridPosition.y, 0);
		room.rotation.y = Math.PI * 1.5;
		room.scale.x = room.scale.y = room.scale.z = 4;
		
		this.addRoom(room);	
		this.graphics.addModel(room);

		this.clearDragging();
	};

	this.clearDragging = function() {
		for (var i = this.shapes.length - 1; i >= 0; i--) {
			if (this.shapes[i] instanceof Boundable) {
				this.shapes.splice(i, 1);
			}
		};

		this.graphics.removeDraggingObjects();
		this.draggingRoom = null;
	};

	this.addBoundable = function(box, x, y) {

		var boundingBox = new THREE.Mesh(
			new THREE.BoxGeometry(51, 26.4, 32.5), 
			new THREE.MeshBasicMaterial( { color: 0x44cc00, wireframe: true, transparent: true, opacity: 0.3 } )
			);
		boundingBox.position.set(box.x, box.y + 14, box.z);
		
		var boundable = new Boundable(this, boundingBox, x, y);
		this.shapes.push(boundable);
		this.graphics.addBoundingBox(boundingBox);
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

		var shape = new Room(this, model);
		console.log(shape);
		this.shapes.push(shape);
	};

	this.addShape = function(model) {

		var shape = new Shape(this, model);
		this.shapes.push(shape);
	}

	this.mouseMove = function(event) {

		event.preventDefault();
		var position = this.graphics.setMouse(event);


		var hoveredShape = this.graphics.getHoveredShape(this.getShapes());
		this.hoveredShape = null;

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			var shape = this.shapes[i];

			if (shape.model == hoveredShape) {
				this.hoveredShape = shape;
				shape.setHover(true);
			}
			else {
				shape.setHover(false);
			}
		};

		if (this.draggingRoom != null) {
			if (this.hoveredShape instanceof Boundable) {
				var gridPosition = this.grid[this.hoveredShape.x][this.hoveredShape.y];

				this.draggingRoom.position.set(gridPosition.x, gridPosition.y, 0);
			} else {
				this.draggingRoom.position.set(position.x, position.y, 0);
			}
		}

	}

	this.click = function( event ) {

		if (event.button == 0) {
		//left click
			for (var i = this.shapes.length - 1; i >= 0; i--) {
				if (this.shapes[i].hover) {
					this.shapes[i].modify();
				}
			};

			if (this.draggingRoom != null && this.hoveredShape instanceof Boundable) {
				this.placeRoom();
			}
		}

		if (event.button == 2) {
		//right click
			this.clearDragging();
		}
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
document.addEventListener( 'mouseup', onDocumentMouseDown, false );
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
window.addEventListener("mousewheel", onWindowMouseWheel, false);
window.addEventListener("DOMMouseScroll", onWindowMouseWheel, false);
window.addEventListener("keypress", onWindowKeyPress, false);

document.addEventListener('contextmenu', function(e) {
	console.log(e);
    e.preventDefault();
}, false);

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


