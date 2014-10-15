(function() {

	var CastleSim = my.Class({

		//http://javascriptissexy.com/understand-javascript-callback-functions-and-use-them/
		that: this,

		constructor: function() {

			this.shapes = [];
			this.pointLight = null;
			this.stats = null;

			this.clock = new THREE.Clock();
			this.grid = new SIM.GridManager(this);
			this.gui = null;
			this.graphics = new SIM.GraphicsEngine(this);
			this.rooms = new SIM.RoomManager(this);
			this.audio = new SIM.AudioManager(this);

			this.modelUrls = [
				"res/models/ground_block/ground_block16.dae",
				"res/models/room/roomBed.dae",
				"res/models/room_hall/roomHall.dae",
				"res/models/servant/servant.dae"
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
				},
				hygieneTimer: 0,
				idleTimer: 0
			};

			this.loadingBar = {
				max: 0,
				current: 0,
				finished: null
			};

			this.events = {
				wind: false
			}

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
			this.gui.setValue("Servants", this.resources.servants);
			this.gui.setValue("Food", this.resources.food);
			this.gui.setValue("Stone", this.resources.food);
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

			if (this.resources.stone >= 2) {
				this.grid.show();

				var room = this.rooms.generateDraggingRoom("Bedroom");

				this.draggingShape = room;
				this.graphics.addDraggingRoom(room.model);
			}
		},

		hireServant: function() {

			if (this.resources.food >= 2) {
				var that = this;
				this.setLoadingBar(3, "Getting Servant", $.proxy(this.finishedHireServant, this), function() {
					that.changeResourceValue("Food", -2);
				});
			}
		},

		buildPeasantHouse: function() {

			this.setLoadingBar(3, "Getting Peasant", $.proxy(this.finishedBuildPeasantHouse, this), function() {});
		},

		sliderChanged: function(data) {

			this.resources.peasantProduction.food = data.detail.food;
			this.resources.peasantProduction.stone = data.detail.stone;
		},

		// PROCESS EVENTS

		changeResourceValue: function(name, value) {

			if (!value) {
				return;
			}

			var newValue = this.resources[name.toLowerCase()] += value;	

			this.gui.setValue(name, Math.floor(newValue));
		},

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

			mesh = this.graphics.getModel(this.modelUrls[3]);
			mesh.scale.x = mesh.scale.y = mesh.scale.z = .7;
			mesh.position.set(gridSection.x + 20, gridSection.y + 5, 10);
			

			var servant = new SIM.Servant(this, mesh, this.initialHall);
			this.addShape(servant);
		},

		finishedBuildPeasantHouse: function() {

			this.resources.peasants++;
			this.gui.setValue("Peasants", this.resources.peasants);		
		},

		clearDragging: function() {
			for (var i = this.shapes.length - 1; i >= 0; i--) {
				if (this.shapes[i] instanceof SIM.GridSection) {
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

			this.changeResourceValue("Stone", -2);
			var gridSection = this.grid.get(this.hoveredShape.gridX, this.hoveredShape.gridY);
			var room = this.rooms.generateRoom("Bedroom", gridSection);
			this.grid.setRoom(this.hoveredShape.gridX, this.hoveredShape.gridY, room);
			this.addShape(room);
			this.clearDragging();
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

		// USER INPUT

		mouseMove: function(event) {

			event.preventDefault();
			var mousePosition = this.graphics.mouseMove(event);
				//this.test.model.position.set(mousePosition.x, mousePosition.y, mousePosition.z);

			this.updateShapeHoverStates();

			if (this.draggingShape instanceof SIM.Room) {
				if (this.hoveredShape instanceof SIM.GridSection) {
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

				if (this.hoveredShape instanceof SIM.GridSection) {
					this.placeRoomOnHoverLocation(this.hoveredShape);
				}
			}

			if (event.button == 2) {
			//right click
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

			if (!dt || dt > 200) {
				return;
			}

			for (var i = this.shapes.length - 1; i >= 0; i--) {
				this.shapes[i].update(dt);
			};

			this.updateRatings(dt);

			this.updateResources(dt);

			this.updateLoadingBar(dt);

			this.graphics.update(dt);

			this.audio.update(dt, this.graphics.camera);
		},

		randomizeWind: function() {

		},

		updateRatings: function(dt) {

			this.resources.hygieneTimer -= dt;
			this.resources.idleTimer -= dt;

			if (this.resources.hygieneTimer < 0) {
				this.resources.hygieneTimer = 10000;

				var totalTrash = this.rooms.getNumberOfTrash();
				this.hygiene = (50 - totalTrash) * 2;
				this.gui.setRating("Hygiene", Math.floor(this.hygiene));	
			}

			if (this.resources.idleTimer < 0) {
				this.resources.idleTimer = 10000;

				var totalIdleTime = 0;
				var totalServants = 0;

				for (var i = this.shapes.length - 1; i >= 0; i--) {
					if (this.shapes[i] instanceof SIM.Servant) {
						totalServants++;
						totalIdleTime += this.shapes[i].getIdleTime();
					}
				};

				var averageIdleTime = totalIdleTime / totalServants;
				this.resources.morale = averageIdleTime / 100;
				if (this.resources.morale < 20) {
					this.turnServantsRed();
				}
				this.gui.setRating("Morale", Math.floor(this.resources.morale));
			}
		},

		updateResources: function(dt) {
			var productionPower = this.resources.peasants * dt / 100000;

			var foodProd = this.resources.peasantProduction.food * productionPower;
			var stoneProd = this.resources.peasantProduction.stone * productionPower;

			var totalServants = 0;
			for (var i = this.shapes.length - 1; i >= 0; i--) {
				if (this.shapes[i] instanceof SIM.Servant) {
					totalServants++;
				}
			};
			
			var foodDifference = foodProd - totalServants * dt / 20000;
			this.changeResourceValue("Food", foodDifference);
			this.changeResourceValue("Stone", stoneProd);
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