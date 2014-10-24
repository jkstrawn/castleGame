(function() {

	var RoomManager = my.Class({

		constructor: function() {
			this.rooms = [];
			this.roomTypes = [];
			this.tempRoom = null;

			this.roomTypes.push({name: "Bedroom", width: 2, modelIndex: 1, cost: 2});
			this.roomTypes.push({name: "Hall", width: 6, modelIndex: 2, cost: 0});
			this.roomTypes.push({name: "stairBottom", width: 1, modelIndex: 3, cost: 1});
			this.roomTypes.push({name: "stairMiddle", width: 1, modelIndex: 4, cost: 1});
			this.roomTypes.push({name: "stairTop", width: 1, modelIndex: 5, cost: 1});
		},

		generateDraggingRoom: function(typeName) {

			if (typeName == "stairBottom") {
				this.tempRoom = this.generateDraggingRoom("stairTop");
				this.tempRoom.model.visible = false;
			}

			var roomType = this.getTypeByName(typeName);
			var roomModel = this.generateRoomModel(roomType, new THREE.Vector3(500, 500, 0));
			
			roomModel.traverse(function(thing) {
				if (thing.material instanceof THREE.MeshLambertMaterial) {
					var clonedMat = thing.material.clone();

					thing.material = clonedMat;
					thing.material.opacity = .6;
					thing.material.transparent = true;
				}
			});

			var room = new DraggingRoom(roomModel, roomType);

			return room;
		},

		generateRoom: function(typeName, gridSection) {

			var roomType = this.getTypeByName(typeName);
			var roomModel = this.generateRoomModel(roomType, new THREE.Vector3(gridSection.x, gridSection.y, 0));
			var room = null;
			if (typeName == "Bedroom") {
				room = new Bedroom(roomModel, roomType);
			} else {
				room = new Room(roomModel, roomType);
			}

			this.rooms.push(room);
			return room;
		},

		generateRoomModel: function(roomType, vector) {

			var roomModel = sim.graphics.getModel(sim.modelUrls.dead[roomType.modelIndex]);

			roomModel.position.set(vector.x, vector.y, vector.z);
			roomModel.rotation.y = Math.PI * 1.5;

			return roomModel;
		},

		getTypeByName: function(typeName) {
			for (var i = this.roomTypes.length - 1; i >= 0; i--) {
				if (this.roomTypes[i].name == typeName) {
					return this.roomTypes[i];
				}
			};

			console.log("ERROR: Invalid room type name:", typeName);
			return null;
		},

		addRoom: function(model) {
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

			var shape = new Room(model);
			console.log(shape);
			sim.shapes.push(shape);
		},

		addInitialHall: function() {
			console.log("add initial hall");
			var gridSection = sim.grid.get(4, 0);
			var room = this.generateRoom("Hall", gridSection);

			sim.grid.setRoom({gridX: 4, gridY: 0}, room);
			sim.addShape(room);

			return room;
		},

		snapHoveredRoomToGrid: function(room, hoveredSnapLocation) {

			if (room.gridSectionToSnapTo == hoveredSnapLocation) {
				return;
			}

			room.gridSectionToSnapTo = hoveredSnapLocation;
			var gridSection = sim.grid.get(hoveredSnapLocation.gridX, hoveredSnapLocation.gridY);

			this.moveUpperRoomIfNecessary(room, gridSection, hoveredSnapLocation);
			room.tween = new TWEEN.Tween(room.model.position).to({
			    x: gridSection.x,
			    y: gridSection.y,
			    z: 0
			}, 100).easing(TWEEN.Easing.Back.Out).start();

			//this.sim.graphics.focusCamera(gridSection.x, gridSection.y, 0);	
		},

		moveUpperRoomIfNecessary: function(room, gridSection, hoveredSnapLocation) {

			var roomBelowLocation = sim.grid.getRoom(hoveredSnapLocation.gridX, hoveredSnapLocation.gridY - 1);

			if (this.tempRoom && this.shouldShowTempRoom(roomBelowLocation)) {
				var height = sim.grid.gridHeight;
				this.tempRoom.model.visible = true;
				this.tempRoom.model.position.set(room.model.position.x, room.model.position.y + height, room.model.position.z);

				this.tempRoom.tween = new TWEEN.Tween(this.tempRoom.model.position).to({
				    x: gridSection.x,
				    y: gridSection.y + height,
				    z: 0
				}, 100).easing(TWEEN.Easing.Back.Out).start();				
				sim.graphics.addTempObject(this.tempRoom.model);
			} else if (this.tempRoom) {
				this.tempRoom.model.visible = false;
			}
		},

		shouldShowTempRoom: function(roomBelowLocation) {

			// this won't work for othe room types if they span more than 1 grid location... maybe
			if (roomBelowLocation) {
				return roomBelowLocation.type.name.substring(0, 5) != "stair";
			}
			return true;
		},

		moveAndUnsnapRoom: function(room, mousePosition) {

			if (room.tween) {
				TWEEN.remove(room.tween);
			}
			if (this.tempRoom) {
				this.tempRoom.model.visible = false;
			}
			room.model.position.set(mousePosition.x - room.width / 2, mousePosition.y - 15, 0);
			room.gridSectionToSnapTo = null;
		},

		getContainingRoom: function(position) {

			for (var i = this.rooms.length - 1; i >= 0; i--) {
				if (this.rooms[i].isPointInsideRoom(position)) {
					return this.rooms[i];
				}
			};

			return null;
		},

		getNumberOfTrash: function() {

			var number = 0;

			for (var i = this.rooms.length - 1; i >= 0; i--) {
				number += this.rooms[i].getNumberOfTrash();
			};

			return number;
		},

		clearTempRoom: function() {
			this.tempRoom = null;
		},

		getRoomsToPlace: function(hoveredGridSnapper, roomName) {

			var rooms = [];

			if (roomName == "stairBottom") {
				var roomBelowLocation = sim.grid.getRoom(hoveredGridSnapper.gridX, hoveredGridSnapper.gridY - 1);
				if (this.shouldShowTempRoom(roomBelowLocation)) {
					var upperGridSection = sim.grid.get(hoveredGridSnapper.gridX, hoveredGridSnapper.gridY + 1);
					var extraRoom = this.generateRoom("stairTop", upperGridSection);
					rooms.push({room: extraRoom, grid: upperGridSection});
				}

				if (roomBelowLocation && roomBelowLocation.type.name == "stairTop") {
					roomName = "stairTop";
				}
			}

			var gridSection = sim.grid.get(hoveredGridSnapper.gridX, hoveredGridSnapper.gridY);
			var room = this.generateRoom(roomName, gridSection);
			rooms.push({room: room, grid: gridSection});

			return rooms;
		},

		getRoomsToChange: function(hoveredGridSnapper, roomName) {

			//if below is top: make below into middle

			var rooms = [];

			if (roomName == "stairBottom") {
				var roomBelowLocation = sim.grid.getRoom(hoveredGridSnapper.gridX, hoveredGridSnapper.gridY - 1);
				if (roomBelowLocation && roomBelowLocation.type.name == "stairTop") {
					var newRoomType = this.getTypeByName("stairMiddle");
					var newModel = this.generateRoomModel(newRoomType, roomBelowLocation.model.position);
					rooms.push({room: roomBelowLocation, model: newModel});
				}
			}

			return rooms;
		},

		clearRoomGridNames: function() {

			for (var i = this.rooms.length - 1; i >= 0; i--) {
				this.rooms[i].gridName = "a";
				this.rooms[i].gridConnected = false;
			};
		},

		getTrash: function() {

			for (var i = this.rooms.length - 1; i >= 0; i--) {
				var trash = this.rooms[i].getRandomTrash();
				if (this.rooms[i].reachable && trash && !trash.claimed) {
					return trash;
				}
			};

			return null;
		},

		getRoomByName: function(roomName) {

			for (var i = this.rooms.length - 1; i >= 0; i--) {
				if (this.rooms[i].gridName == roomName) {
					return this.rooms[i];
				}
			};

			console.log("ERROR: Tried to find non-existant room name '" + roomName + "'");
			return null;
		},

	});

	SIM.RoomManager = RoomManager;




	var Room = my.Class(SIM.Shape, {
		constructor: function (_model, _type) {
			Room.Super.call(this, _model);

			this.light = null;
			this.type = _type;
			this.trashSpawnSpeed = 8000;
			this.trashTimer = 1000;
			this.width = _type.width * sim.grid.gridWidth;
			this.length = sim.grid.gridLength;
			this.trash = [];
			this.age = 0;
			this.gridName = "a";
			this.gridConnected = false;
			this.reachable = false;
		},

		createLight: function() {
			sim.pointLight.position.set( this.model.position.x + 15, this.model.position.y + 15, this.model.position.z + 10 );
		},

		removeLight: function() {
			if (sim.pointLight.position.x == (this.model.position.x + 15)
			 && sim.pointLight.position.y == (this.model.position.y + 15)) {
				sim.pointLight.position.set( 0, -200, 0 );
			}
		},

		setHover: function(hover) {

			if (!this.hover && hover) {
				this.createLight();
			}
			if (this.hover && !hover) {
				this.removeLight();
			}
			Room.Super.prototype.setHover.call(this, hover);
		},

		clicked: function() {

			//this.model.position.z += 10;
			//sim.pointLight.position.set( this.model.position.x, this.model.position.y + 20, this.model.position.z + 10 );
		},

		getDimensions: function() {

			return {
				start: this.model.position,
				size: new THREE.Vector3(this.width, 30, this.length)
			};
		},

		update: function(dt) {

			this.age += dt;

			if (this.type.name.substring(0, 5) == "stair") return;

			this.trashTimer -= dt;

			if (this.trashTimer < 0) {
				this.trashTimer = this.trashSpawnSpeed;

				this.generateTrash();
			}
		},

		generateTrash: function() {

			var x = (this.width - 10) * Math.random() + this.model.position.x + 5;
			var z = (this.length - 10) * Math.random() + this.model.position.z + 5;
			var y = this.model.position.y + 1;

			//var model = sim.graphics.getModel(sim.modelUrls[0]);

			var mesh = new THREE.Mesh(
				new THREE.BoxGeometry(2, 2, 2), 
				new THREE.MeshBasicMaterial( { color: 0x606060 } )
				);

			mesh.position.set(x, y, z);
			
			var trash = new Trash(mesh, this.gridName);
			this.trash.push(trash);
			sim.grid.getPath(sim.servant, trash);
			sim.addShape(trash);
		},

		getClosestTrash: function(position) {

			var closestTrash = null;
			var smallestDistance = 0;

			for (var i = this.trash.length - 1; i >= 0; i--) {
				
				var distance = this.trash[i].model.position.distanceTo(position);

				if ((closestTrash == null || distance < smallestDistance) && !this.trash[i].claimed) {
					closestTrash = this.trash[i];
					smallestDistance = distance;
				}
			};

			return closestTrash;
		},

		getRandomTrash: function() {

			if (this.trash.length)
				return this.trash[0];

			return null;
		},

		removeTrash: function(trash) {

			for (var i = this.trash.length - 1; i >= 0; i--) {
				if (this.trash[i] == trash) {
					sim.removeShape(this.trash[i]);
					this.trash.splice(i, 1);
					return;
				}
			};

			console.log("ERROR: Tried to remove non-existant trash");
		},

		isPointInsideRoom: function(point) {
			return point.x > this.model.position.x && point.x < (this.model.position.x + this.width) &&
					point.y > this.model.position.y && point.y < (this.model.position.y + 30) &&
					point.z > this.model.position.z && point.z < (this.model.position.z + this.length);
		},

		getNumberOfTrash: function() {
			return this.trash.length;
		},

		getPointForDirection: function(direction) {

			if (direction == "east") {
				return this.gridName + "4";
			}
			if (direction == "west") {
				return this.gridName + "2";
			}
			if (direction == "north") {
				if (this.type.name == "stairMiddle" || this.type.name == "stairBottom") {
					return this.gridName + "1";
				}
				return null;
			}
			if (direction == "south") {
				if (this.type.name == "stairTop" || this.type.name == "stairMiddle") {
					return this.gridName + "2";
				}
				return null;
			}

			console.log("ERROR: tried to get non-existant point for type " + roomType + " with direction " + direction);
			return null;
		},

		generatePoints: function(gridName) {

			this.gridName = gridName;

			var points = [];
			var height = 1.2;

			this.addNewPoint(points, this.gridName + 2, this.width - 4, height, 25, [this.gridName + 4]);

			if (this.type.name == "stairMiddle" || this.type.name == "stairBottom") {
				this.addNewPoint(points, this.gridName + 1, this.width - 4, 30, 21, [this.gridName + 6]);
				this.addNewPoint(points, this.gridName + 4, 4, height, 25, [this.gridName + 2, this.gridName + 5]);
				this.addNewPoint(points, this.gridName + 5, 4, 15, 5, [this.gridName + 4, this.gridName + 6]);
				this.addNewPoint(points, this.gridName + 6, this.width - 4, 15, 5, [this.gridName + 1, this.gridName + 5]);
			} else {
				this.addNewPoint(points, this.gridName + 4, 4, height, 25, [this.gridName + 2]);
			}

			return points;
		},

		addNewPoint: function(points, name, x, y, z, siblings) {

			var point = {
				name: name,
				x: x + this.getX(),
				y: y + this.getY(),
				z: z + this.getZ(),
				siblings: siblings,
				room: this,
			};

			points.push(point);
		}

	});

	SIM.Room = Room;

	
	var Bedroom = my.Class(SIM.Room, {

		constructor: function(model, type) {
			Bedroom.Super.call(this, model, type);

			this.nobleTimer = Math.random() * 2000;
			this.noble = null;
		},

		update: function(dt) {

			if (!this.noble && this.age > 1000) {
				if (this.trash.length < 3) {
					this.nobleTimer -= dt;

					if (this.nobleTimer < 0) {
						//this.generateNoble();
					}
				} else {
					this.nobleTimer = Math.random * 2000;
				}
			}

			Bedroom.Super.prototype.update.call(this, dt);
		},

		generateNoble: function() {

			this.noble = true;

			var nobleModel = new THREE.Mesh(new THREE.BoxGeometry(5, 10, 5), new THREE.MeshLambertMaterial({color: 0xcccccc}));
			var position = this.getPosition();
			nobleModel.position.set(position.x + 10, position.y+ 5, position.z + 10);

			var noble = new SIM.Noble(nobleModel, this);
			sim.addShape(noble);
		},
	});

	SIM.Bedroom = Bedroom;


	var DraggingRoom = my.Class(SIM.Room, {

		constructor: function(model, type) {
			DraggingRoom.Super.call(this, model, type);
			this.gridSectionToSnapTo = null;
		},

	});

	SIM.DraggingRoom = DraggingRoom;


	var Trash = my.Class(SIM.Shape, {

		constructor: function(model, gridName) {
			Trash.Super.call(this, model);
			this.gridName = gridName;
			this.claimed = false;
		}
	});

	SIM.Trash = Trash;

})();

