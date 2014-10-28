(function() {

	var CastleSim = my.Class({

		//http://javascriptissexy.com/understand-javascript-callback-functions-and-use-them/
		that: this,

		constructor: function() {

			this.shapes = [];
			this.pointLight = null;
			this.stats = null;

			this.clock = new THREE.Clock();
			this.grid = new SIM.GridManager();
			this.gui = null;
			this.graphics = new SIM.GraphicsEngine();
			this.rooms = new SIM.RoomManager();
			this.audio = new SIM.AudioManager();
			this.events = new SIM.EventManager();
			this.resources = new SIM.ResourceManager();

			this.modelUrls = {
				dead: [
					"res/models/ground_block/ground_block16.dae",
					"res/models/rooms/roomBed.dae",
					//"res/models/room/roomBed.dae",
					"res/models/rooms/roomHall.dae",
					"res/models/rooms/roomStairsBottom.dae",
					"res/models/rooms/roomStairsMiddle.dae",
					"res/models/rooms/roomStairsTop.dae",
				],
				live: [
					"res/models/servant/manfred.js"
				]
			};
			this.draggingShape = null;
			this.hoveredShape = null;
			this.tweenForBox = null;

			this.loadingBar = {
				max: 0,
				current: 0,
				finished: null
			};
		},

		init: function() {

			// listen for messages from the gui
			window.addEventListener( 'create-room', $.proxy(this.clickRoomButton, this) );
			window.addEventListener( 'hire-servant', $.proxy(this.hireServant, this) );
			window.addEventListener( 'build-peasant', $.proxy(this.buildPeasantHouse, this) );
			window.addEventListener( 'slider', $.proxy(this.sliderChanged, this) );
			window.addEventListener("toggleMute", $.proxy(function() {
				this.audio.toggleSound();
			}, this));

			this.grid.init();
			this.graphics.init(this.modelUrls, $.proxy( this.loadedModels, this ));
			this.gui = new BlendCharacterGui();
		},

		loadedModels: function() {

			//add initial hall
			this.initialHall = this.rooms.addInitialHall();

			//add initial servant
			this.finishedHireServant();

			var flameLocations = [new THREE.Vector3(-9.3, 9.5, 5.2), new THREE.Vector3(-30, 9.5, 5.2), 
				new THREE.Vector3(-48, 9.5, 5.2), new THREE.Vector3(12, 9.5, 5.2), new THREE.Vector3(34, 9.5, 5.2)];

			for(var i = 0; i < flameLocations.length; i++) {
				this.graphics.addFlame(flameLocations[i]);
				this.audio.addSound(["torch1.mp3"], 50, 1, flameLocations[i], 
					{ loop: true, autoplay: true })
			}
		},

		// EVENTS
		clickRoomButton: function(data) {

			if (data.detail.room != "Bedroom" || this.resources.stone >= 2) {
				var roomType = this.rooms.getTypeByName(data.detail.room);
				this.grid.show(roomType.width);

				var room = this.rooms.generateDraggingRoom(data.detail.room);

				this.draggingShape = room;
				this.graphics.addTempObject(room.model);

			}
		},

		hireServant: function() {

			if (this.resources.food >= 2) {
				var that = this;
				this.setLoadingBar(3, "Getting Servant", $.proxy(this.finishedHireServant, this), function() {
					that.resources.changeValue("Food", -2);
				});
			}
		},

		buildPeasantHouse: function() {

			this.setLoadingBar(3, "Getting Peasant", $.proxy(this.finishedBuildPeasantHouse, this), function() {});
		},

		sliderChanged: function(data) {

			this.resources.setPeasantProductionSlider(data.detail.food, data.detail.stone);
		},

		// PROCESS EVENTS

		setLoadingBar: function(time, name, callback, successful) {

			if (this.loadingBar.current) {
				return;
			}

			successful();
			this.loadingBar.max = time * 1000;
			this.loadingBar.finished = callback;
			this.gui.createLoadingBar(name, time);
		},

		finishedHireServant: function() {

			this.resources.servants++;
			this.gui.setValue("Servants", this.resources.servants);

			var gridSection = this.grid.get(2, 0);
			var mesh = new THREE.Mesh(
				new THREE.BoxGeometry(5, 10, 5), 
				new THREE.MeshBasicMaterial( { color: 0xFFFFFF } )
				);

			mesh = this.graphics.getModel(this.modelUrls.live[0]);
			mesh.position.set(gridSection.x + 20, gridSection.y + 1.2, 10);

			var servant = new SIM.Servant(mesh, this.initialHall);
			this.servant = servant;
			this.addShape(servant);
		},

		finishedBuildPeasantHouse: function() {

			this.resources.peasants++;
			this.gui.setValue("Peasants", this.resources.peasants);		
		},

		clearDragging: function() {
			for (var i = this.shapes.length - 1; i >= 0; i--) {
				if (this.shapes[i] instanceof SIM.GridSnapper) {
					this.shapes.splice(i, 1);
				}
			};

			this.graphics.removeDraggingObjects();
			this.draggingShape = null;
		},

		addShape: function(shape) {

			this.graphics.addModel(shape.model);
			this.shapes.push(shape);
		},

		getShapesOfType: function(type) {

			var shapesOfType = [];

			for (var i = this.shapes.length - 1; i >= 0; i--) {
				if (this.shapes[i] instanceof type) {
					shapesOfType.push(this.shapes[i]);
				}
			};

			return shapesOfType;
		},

		removeShape: function(shape) {

			for (var i = this.shapes.length - 1; i >= 0; i--) {
				if (this.shapes[i] == shape) {
					this.shapes.splice(i, 1);
					this.graphics.removeModel(shape.model);
					return;
				}
			};

			console.log("ERROR: tried to delete non-existant shape", shape);
		},

		placeRoomOnHoverLocation: function() {

			var cost = 0;
			var rooms = this.rooms.getRoomsToPlace(this.hoveredShape, this.draggingShape.type.name);
			var roomChanges = this.rooms.getRoomsToChange(this.hoveredShape, this.draggingShape.type.name);

			for (var i = rooms.length - 1; i >= 0; i--) {
				this.grid.setRoom(rooms[i].grid, rooms[i].room);
				this.addShape(rooms[i].room);
				cost += rooms[i].room.type.cost;
			};
			for (var i = roomChanges.length - 1; i >= 0; i--) {
				roomChanges[i].room.model = roomChanges[i].model;
				this.graphics.removeModel(roomChanges[i].model);
				this.graphics.addModel(roomChanges[i].model);
			};

			this.resources.changeValue("Stone", cost * -1);
			this.clearDragging();
			this.rooms.clearTempRoom();
			this.rooms.clearRoomGridNames();
			this.grid.updateRoomPoints();
		},

		// OTHER

		getShapes: function() {

			var shapes = [];

			for (var i = this.shapes.length - 1; i >= 0; i--) {
				shapes.push(this.shapes[i].model);
			};

			return shapes;
		},

		updateShapeHoverStates: function() {

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
		},

		turnServantsRed: function() {

			for (var i = this.shapes.length - 1; i >= 0; i--) {
				if (this.shapes[i] instanceof SIM.Servant) {
					this.shapes[i].turnRed();
				}
			};
		},

		getRoomByName: function(roomName) {

			return this.rooms.getRoomByName(roomName);
		},

		// USER INPUT

		mouseMove: function(event) {

			event.preventDefault();
			var mousePosition = this.graphics.mouseMove(event);
				//this.test.model.position.set(mousePosition.x, mousePosition.y, mousePosition.z);

			this.updateShapeHoverStates();

			if (this.draggingShape instanceof SIM.Room) {
				if (this.hoveredShape instanceof SIM.GridSnapper) {
					this.rooms.snapHoveredRoomToGrid(this.draggingShape, this.hoveredShape);	
				} else {
					this.rooms.moveAndUnsnapRoom(this.draggingShape, mousePosition);
				}
			}
			else if (this.draggingShape instanceof SIM.Servant) {
				var z = this.draggingShape.getZ();
				var mousePositionAtZ = this.graphics.getMousePositionByZ(event, z);
				this.draggingShape.setPosition(mousePositionAtZ.x, mousePositionAtZ.y, z);
			}

		},

		mouseDown: function(event) {

			if (event.button == 0) {
			//left click
				if (this.hoveredShape instanceof SIM.Servant) {
					this.hoveredShape.stop();
					this.draggingShape = this.hoveredShape;
				}
			}

			if (event.button == 2) {
			//right click
				this.graphics.setRightMouseButtonDown(true);
			}
		},

		click: function( event ) {

			if (event.button == 0) {
			//left click
				if (this.draggingShape instanceof SIM.Servant) {
					this.draggingShape.stopDragging();
					this.draggingShape = null;
					return;
				}

				for (var i = this.shapes.length - 1; i >= 0; i--) {
					if (this.shapes[i].hover) {
						this.shapes[i].clicked();
					}
				};

				if (this.hoveredShape instanceof SIM.GridSnapper) {
					this.placeRoomOnHoverLocation(this.hoveredShape);
				}
			}

			if (event.button == 2) {
			//right click
				this.rooms.clearTempRoom();
				this.graphics.setRightMouseButtonDown(false);
				if (this.draggingShape instanceof SIM.Room) {
					this.clearDragging();
				}
			}
		},

		keypress: function (event) {
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
		},

		zoom: function(dt) {
			this.graphics.zoom(dt);
		},

		// UPDATING

		render: function() {

			var delta = this.clock.getDelta();

			this.graphics.render();
		},

		update: function(dt) {

			for (var i = this.shapes.length - 1; i >= 0; i--) {
				this.shapes[i].update(dt);
			};

			this.resources.update(dt);

			this.updateLoadingBar(dt);

			this.graphics.update(dt);

			this.audio.update(dt, this.graphics.camera);

			this.events.update(dt);
		},

		randomizeWind: function() {

		},

		updateLoadingBar: function(dt) {

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
		},

		onWindowResize: function() {

			this.graphics.resize();
		},

	});

	SIM.CastleSim = CastleSim;

})()