var CastleSim = function() {
	this.shapes = [];
	this.pointLight = null;

	this.clock = new THREE.Clock();
	this.gui = null;
	this.stats = null;
	this.graphics = new GraphicsEngine(this);
	this.grid = [];
	this.modelUrls = [
		"res/models/ground_block/ground_block16.dae",
		"res/models/room/roomBed.dae",
		"res/models/room_hall/roomHall.dae"
	];
	this.draggingRoom = null;
	this.hoveredShape = null;
	this.snappedShape = null;
	this.tweenForBox = null;
	this.gridWidth = 30;
	this.gridLength = 30;

	this.resources = {
		servants: 1
	};

	var that = this;

	this.init = function() {

		this.initGrid();
		// listen for messages from the gui
		window.addEventListener( 'create-room', this.clickRoomButton );
		window.addEventListener( 'hire-servant', this.hireServant );

		this.graphics.init(this.modelUrls, this.loadedModels);

		this.gui = new BlendCharacterGui();
	}

	this.initGrid = function() {
		var startPoint = -110;
		var numOfGridSide = 7;
		var numOfGridUp = 4;

		for (var x = 0; x < numOfGridSide; x++) {
			this.grid[x] = [];

			for (var y = 0; y < numOfGridUp; y++) {
				this.grid[x][y] = {
					x: x * this.gridLength + startPoint, 
					y: y * this.gridWidth, 
					z: 0,
					used: false
				};
			}
		};

		this.grid[2][0].used = true;
		this.grid[3][0].used = true;
		this.grid[4][0].used = true;
	}

	this.loadedModels = function() {

		//add ground
		var ground = that.graphics.getModel(that.modelUrls[0]);

		ground.position.set(0, -70, -100);
		ground.rotation.y = -1.57;
		ground.scale.x = ground.scale.y = ground.scale.z = 17;

		that.addShape(ground);
		that.graphics.addModel(ground);

		//add initial hall
		var grid = that.grid[2][0];
		var room = that.graphics.getModel(that.modelUrls[2]);

		room.position.set(grid.x, grid.y, 0);
		room.rotation.y = Math.PI * 1.5;
		room.scale.x = room.scale.y = room.scale.z = 3;

		that.addRoom(room);
		that.graphics.addModel(room);
	};

	this.generateRoomModel = function(vector) {

		var room = this.graphics.getModel(this.modelUrls[1]);

		room.position.set(vector.x, vector.y, vector.z);
		room.rotation.y = Math.PI * 1.5;
		room.scale.x = room.scale.y = room.scale.z = 3;

		return room;
	}

	this.clickRoomButton = function(data) {

		that.drawGrid();

		var room = that.generateRoomModel(new THREE.Vector3(150, 50, 0));
		
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

	this.hireServant = function() {
		that.resources.servants++;
		that.gui.setValue("Servants", that.resources.servants);
	};

	this.drawGrid = function() {

		for (var x = that.grid.length - 1; x >= 0; x--) {

			for (var y = 0; y < that.grid[x].length; y++) {
				var box = that.grid[x][y];

				if (!box.used) {
					that.addBoundable(box, x, y);
					that.graphics.addRoomSpotParticles(new THREE.Vector3(box.x, box.y, 0), that.gridLength, that.gridWidth);
					break;
				}
			}
		};
	}

	this.placeRoom = function() {

		var gridPosition = this.grid[this.hoveredShape.x][this.hoveredShape.y];
		gridPosition.used = true;

		var room = this.generateRoomModel(new THREE.Vector3(gridPosition.x, gridPosition.y, 0));
		
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
			new THREE.BoxGeometry(this.gridLength, this.gridWidth, this.gridWidth), 
			new THREE.MeshBasicMaterial( { color: 0x44cc00, wireframe: true, transparent: true, opacity: 0.3 } )
			);
		boundingBox.position.set(box.x + 15, box.y + 15, box.z + 15);
		
		var boundable = new Boundable(this, boundingBox, x, y);
		this.shapes.push(boundable);
		this.graphics.addBoundingBox(boundingBox);
	};

	this.addRoom = function(model) {
/*
				var helper = new THREE.BoundingBoxHelper(model, 0x33cc00);
		helper.update();
		console.log(helper);
		// If you want a visible bounding box
		this.graphics.scene.add(helper);
		console.log(helper.box.max.x - helper.box.min.x);
		console.log(helper.box.max.y - helper.box.min.y);
		console.log(helper.box.max.z - helper.box.min.z);
*/		

		//console.log("linear mag", THREE.LinearFilter);
		//console.log("nearest", THREE.NearestFilter);
		//console.log("linearmip min", THREE.LinearMipMapLinearFilter);
		//console.log("nearestmip", THREE.NearestMipMapLinearFilter);

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
		var position = this.graphics.mouseMove(event);

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
			if (this.hoveredShape instanceof Boundable) { //Bounding box being hovered
				if (this.hoveredShape != this.snappedShape) //Only resnap if not already being snapped here
				{
					//console.log(this.snappedShape)
					//console.log(this.hoveredShape)
					this.snappedShape = this.hoveredShape;
					var gridPosition = this.grid[this.hoveredShape.x][this.hoveredShape.y];
					//console.log(gridPosition.x + ", " + gridPosition.y + "    " + this.hoveredShape.x + ", " + this.hoveredShape.y);

					
					this.draggingRoom.tween = new TWEEN.Tween(this.draggingRoom.position).to({
					    x: gridPosition.x,
					    y: gridPosition.y,
					    z: 0
					}, 200).easing(TWEEN.Easing.Linear.None).start();

					//this.draggingRoom.position.set(gridPosition.x, gridPosition.y, 0);

					this.graphics.focusCamera(gridPosition.x, gridPosition.y, 0);					
				}
			} else {
				if (this.draggingRoom.tween) {
					TWEEN.remove(this.draggingRoom.tween);
				}
				this.draggingRoom.position.set(position.x, position.y, 0);
				this.snappedShape = null;
			}
		}
		else
		{
			this.snappedShape = null;
		}

	}

	this.mouseDown = function(event) {
		if (event.button == 2) {
			this.graphics.setRightMouseButtonDown(true);
		}
	};

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
			this.graphics.setRightMouseButtonDown(false);
			this.clearDragging();
		}
	}

	this.render = function() {

		var delta = this.clock.getDelta();

		this.graphics.render();
	}

	this.update = function(time) {

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			this.shapes[i].update();
		};

		this.graphics.update(time);
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
document.addEventListener( 'mouseup', onDocumentMouseUp, false );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
window.addEventListener("mousewheel", onWindowMouseWheel, false);
window.addEventListener("DOMMouseScroll", onWindowMouseWheel, false);
window.addEventListener("keypress", onWindowKeyPress, false);

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
}, false);

function onDocumentMouseUp(event) {
	sim.click(event);
}

function onDocumentMouseDown(event) {
	sim.mouseDown(event);
}

function onDocumentMouseMove(event) {
	sim.mouseMove(event);
}

function onWindowResize() {
	sim.onWindowResize();
}

function animate(time) {		
	requestAnimationFrame( animate );

	sim.update(time);
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


