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
	this.draggingRoom = null;
	this.hoveredShape = null;
	this.snappedShape = null;
	this.tweenForBox = null;

	this.resources = {
		food: 10,
		servants: 0,
		peasants: 0,
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

		this.grid.init();
		this.graphics.init(this.modelUrls, this.loadedModels);
		this.gui = new BlendCharacterGui();
		this.gui.setValue("Servants", this.resources.servants);
		this.gui.setValue("Food", this.resources.food);
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
		that.rooms.addInitialHall();


		//add initial servant
		that.finishedHireServant();
	};

	this.clickRoomButton = function(data) {

		that.grid.show();

		var room = that.rooms.generateTransparentRoomModel("Bedroom");

		that.draggingRoom = room;
		that.graphics.addDraggingRoom(room);
	};

	this.setLoadingBar = function(time, name, callback) {

		that.loadingBar.max = time * 1000;
		that.loadingBar.finished = callback;
		that.gui.createLoadingBar(name, time);
	};

	this.hireServant = function() {

		that.setLoadingBar(3, "Getting Servant", that.finishedHireServant);
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
		
		var servant = new Servant(that, mesh, that.shapes[1]);
		that.addShape(servant);
	};

	this.buildPeasantHouse = function() {

		that.setLoadingBar(3, "Getting Peasant", that.finishedBuildPeasantHouse);
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
		this.draggingRoom = null;
	};

	this.addShape = function(shape) {

		this.graphics.addModel(shape.model);
		this.shapes.push(shape);
	};

	this.placeRoomOnHoverLocation = function() {

		var gridSection = this.grid.get(this.hoveredShape.gridX, this.hoveredShape.gridY);
		var room = this.rooms.generateRoom("Bedroom", gridSection);
		this.grid.setRoom(this.hoveredShape.gridX, this.hoveredShape.gridY, room);
		this.addShape(room);
		this.clearDragging();
	};

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
			if (this.hoveredShape instanceof GridSection) { //Bounding box being hovered
				if (this.hoveredShape != this.snappedShape) //Only resnap if not already being snapped here
				{
					//console.log(this.snappedShape)
					//console.log(this.hoveredShape)
					this.snappedShape = this.hoveredShape;
					var gridLoc = this.grid.get(this.hoveredShape.gridX, this.hoveredShape.gridY);
					//console.log(gridLoc.x + ", " + gridLoc.y + "    " + this.hoveredShape.x + ", " + this.hoveredShape.y);

					
					this.draggingRoom.tween = new TWEEN.Tween(this.draggingRoom.position).to({
					    x: gridLoc.x,
					    y: gridLoc.y,
					    z: 0
					}, 200).easing(TWEEN.Easing.Linear.None).start();

					//this.draggingRoom.position.set(gridLoc.x, gridLoc.y, 0);

					this.graphics.focusCamera(gridLoc.x, gridLoc.y, 0);					
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

			if (this.draggingRoom != null && this.hoveredShape instanceof GridSection) {
				this.placeRoomOnHoverLocation(this.hoveredShape);
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

	this.update = function(dt) {

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			this.shapes[i].update(dt);
		};

		this.updateLoadingBar(dt);

		this.graphics.update(dt);
	}

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


