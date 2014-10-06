var CastleSim = function() {

	this.shapes = [];
	this.pointLight = null;
	this.stats = null;

	this.clock = new THREE.Clock();
	this.grid = new GridManager(this);
	this.gui = null;
	this.graphics = new GraphicsEngine(this);
	this.rooms = new RoomManager(this);

	this.modelUrls = [
		"res/models/ground_block/ground_block16.dae",
		"res/models/room/roomBed.dae",
		"res/models/room_hall/roomHall.dae"
	];
	this.draggingShape = null;
	this.hoveredShape = null;
	this.tweenForBox = null;

	this.resources = {
		food: 10,
		stone: 10,
		servants: 0,
		peasants: 0,
		hygiene: 50,
		morale: 50,
		peasantProduction: {
			food: 0,
			stone: 10
		}
	};

	this.loadingBar = {
		max: 0,
		current: 0,
		finished: null
	};

	var that = this;

	this.init = function() {

		// listen for messages from the gui
		window.addEventListener( 'create-room', this.clickRoomButton );
		window.addEventListener( 'hire-servant', this.hireServant );
		window.addEventListener( 'build-peasant', this.buildPeasantHouse );
		window.addEventListener( 'slider', this.sliderChanged );

		this.grid.init();
		this.graphics.init(this.modelUrls, this.loadedModels);
		this.gui = new BlendCharacterGui();
		this.gui.setValue("Servants", this.resources.servants);
		this.gui.setValue("Food", this.resources.food);
		this.gui.setValue("Stone", this.resources.food);
	}

	this.loadedModels = function() {

		//add ground
		var ground = that.graphics.getModel(that.modelUrls[0]);

		ground.position.set(0, -70, -100);
		ground.rotation.y = -1.57;
		ground.scale.x = ground.scale.y = ground.scale.z = 17;

		var shape = new Shape(this, ground);
		that.addShape(shape);

		//add initial hall
		that.initialHall = that.rooms.addInitialHall();

		//add initial servant
		that.finishedHireServant();
	};

	// EVENTS
	this.clickRoomButton = function(data) {

		if (that.resources.stone >= 2) {
			that.grid.show();

			var room = that.rooms.generateDraggingRoom("Bedroom");

			that.draggingShape = room;
			that.graphics.addDraggingRoom(room.model);
		}
	};

	this.hireServant = function() {

		if (that.resources.food >= 2) {
			that.setLoadingBar(3, "Getting Servant", that.finishedHireServant, function() {
				that.changeResourceValue("Food", -2);
			});
		}
	};

	this.buildPeasantHouse = function() {

		that.setLoadingBar(3, "Getting Peasant", that.finishedBuildPeasantHouse, function() {});
	};

	this.sliderChanged = function(data) {

		that.resources.peasantProduction.food = data.detail.food;
		that.resources.peasantProduction.stone = data.detail.stone;
	};

	// PROCESS EVENTS

	this.changeResourceValue = function(name, value) {

		if (!value) {
			return;
		}

		var newValue = 0;

		if (name == "Food") {
			newValue = that.resources.food += value;	
		}
		if (name == "Stone") {
			newValue = that.resources.stone += value;	
		}

		that.gui.setValue(name, newValue);
	};

	this.setLoadingBar = function(time, name, callback, successful) {

		if (this.loadingBar.current) {
			return;
		}

		successful();
		this.loadingBar.max = time * 1000;
		this.loadingBar.finished = callback;
		this.gui.createLoadingBar(name, time);
	};

	this.finishedHireServant = function() {

		that.resources.servants++;
		that.gui.setValue("Servants", that.resources.servants);

		var gridSection = that.grid.get(2, 0);
		var mesh = new THREE.Mesh(
			new THREE.BoxGeometry(5, 10, 5), 
			new THREE.MeshBasicMaterial( { color: 0xFFFFFF } )
			);

		mesh.position.set(gridSection.x + 20, gridSection.y + 5, 10);
		
		var servant = new Servant(that, mesh, that.initialHall);
		that.addShape(servant);
	};

	this.finishedBuildPeasantHouse = function() {

		that.resources.peasants++;
		that.gui.setValue("Peasants", that.resources.peasants);		
	};

	this.clearDragging = function() {
		for (var i = this.shapes.length - 1; i >= 0; i--) {
			if (this.shapes[i] instanceof GridSection) {
				this.shapes.splice(i, 1);
			}
		};

		this.graphics.removeDraggingObjects();
		this.draggingShape = null;
	};

	this.addShape = function(shape) {

		this.graphics.addModel(shape.model);
		this.shapes.push(shape);
	};


	this.removeShape = function(shape) {

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			if (this.shapes[i] == shape) {
				this.shapes.splice(i, 1);
				this.graphics.removeModel(shape.model);
				return;
			}
		};

		console.log("ERROR: tried to delete non-existant shape", shape);
	};

	this.placeRoomOnHoverLocation = function() {

		this.resources.stone -= 2;
		this.gui.setValue("Stone", this.resources.stone);
		var gridSection = this.grid.get(this.hoveredShape.gridX, this.hoveredShape.gridY);
		var room = this.rooms.generateRoom("Bedroom", gridSection);
		this.grid.setRoom(this.hoveredShape.gridX, this.hoveredShape.gridY, room);
		this.addShape(room);
		this.clearDragging();
	};

	// OTHER

	this.getShapes = function() {

		var shapes = [];

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			shapes.push(this.shapes[i].model);
		};

		return shapes;
	};

	this.updateShapeHoverStates = function() {

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
	};

	// USER INPUT

	this.mouseMove = function(event) {

		event.preventDefault();
		var mousePosition = this.graphics.mouseMove(event);
			//this.test.model.position.set(mousePosition.x, mousePosition.y, mousePosition.z);

		this.updateShapeHoverStates();

		if (this.draggingShape instanceof Room) {
			if (this.hoveredShape instanceof GridSection) {
				this.rooms.snapHoveredRoomToGrid(this.draggingShape, this.hoveredShape);	
			} else {
				this.rooms.moveAndUnsnapRoom(this.draggingShape, mousePosition);
			}
		}
		else if (this.draggingShape instanceof Servant) {
			var z = this.draggingShape.getZ();
			var mousePositionAtZ = this.graphics.getMousePositionByZ(event, z);
			this.draggingShape.setPosition(mousePositionAtZ.x, mousePositionAtZ.y, z);
		}

	}

	this.mouseDown = function(event) {

		if (event.button == 0) {
		//left click
			if (this.hoveredShape instanceof Servant) {
				this.hoveredShape.stop();
				this.draggingShape = this.hoveredShape;
			}
		}

		if (event.button == 2) {
		//right click
			this.graphics.setRightMouseButtonDown(true);
		}
	};

	this.click = function( event ) {

		if (event.button == 0) {
		//left click
			if (this.draggingShape instanceof Servant) {
				this.draggingShape.stopDragging();
				this.draggingShape = null;
				return;
			}

			for (var i = this.shapes.length - 1; i >= 0; i--) {
				if (this.shapes[i].hover) {
					this.shapes[i].clicked();
				}
			};

			if (this.hoveredShape instanceof GridSection) {
				this.placeRoomOnHoverLocation(this.hoveredShape);
			}
		}

		if (event.button == 2) {
		//right click
			this.graphics.setRightMouseButtonDown(false);
			this.clearDragging();
		}
	}

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

	// UPDATING

	this.render = function() {

		var delta = this.clock.getDelta();

		this.graphics.render();
	}

	this.update = function(dt) {

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			this.shapes[i].update(dt);
		};

		this.updateResources(dt);

		this.updateLoadingBar(dt);

		this.graphics.update(dt);
	}

	this.updateResources = function(dt) {
		var productionPower = this.resources.peasants * dt / 100000;

		var foodProd = this.resources.peasantProduction.food * productionPower;
		var stoneProd = this.resources.peasantProduction.stone * productionPower;
		
		this.changeResourceValue("Food", foodProd);
		this.changeResourceValue("Stone", stoneProd);
	};

	this.updateLoadingBar = function(dt) {

		if (this.loadingBar.max) {

			this.loadingBar.current += dt;
			this.gui.setLoadingBar(this.loadingBar.current / 1000);

			if (this.loadingBar.current > this.loadingBar.max) {
				this.loadingBar.max = 0;
				this.loadingBar.current = 0;
				this.gui.removeLoadingBar();
				this.loadingBar.finished();
			}
		}
	}

	this.onWindowResize = function() {

		this.graphics.resize();
	}
}

var oldTime = 0;
var stats;
var sim = new CastleSim();

sim.init();
animate();

document.addEventListener( 'mouseup', onDocumentMouseUp, false );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
window.addEventListener( 'resize', onWindowResize, false );
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

	var dt = time - oldTime;
	oldTime = time;

	sim.update(dt);
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