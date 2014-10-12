var RoomManager = function(_sim) {
	this.sim = _sim;
	this.rooms = [];
	this.roomTypes = [];

	this.roomTypes.push({name: "Bedroom", width: 1, modelIndex: 1});
	this.roomTypes.push({name: "Hall", width: 3, modelIndex: 2});


	this.generateDraggingRoom = function(typeName) {

		var roomType = this.getRoomFromType(typeName);
		var roomModel = this.generateRoomModel(roomType, new THREE.Vector3(500, 500, 0));
		
		roomModel.traverse(function(thing) {
			if (thing.material instanceof THREE.MeshLambertMaterial) {
				var clonedMat = thing.material.clone();

				thing.material = clonedMat;
				thing.material.opacity = .4;
				thing.material.transparent = true;
			}
		});

		var room = new DraggingRoom(this.sim, roomModel, roomType);

		return room;
	};

	this.generateRoom = function(typeName, gridSection) {

		var roomType = this.getRoomFromType(typeName);
		var roomModel = this.generateRoomModel(roomType, new THREE.Vector3(gridSection.x, gridSection.y, 0));
		var room = new Room(this.sim, roomModel, roomType);

		this.rooms.push(room);
		return room;
	};

	this.generateRoomModel = function(roomType, vector) {

		var room = this.sim.graphics.getModel(this.sim.modelUrls[roomType.modelIndex]);

		room.position.set(vector.x, vector.y, vector.z);
		room.rotation.y = Math.PI * 1.5;
		room.scale.x = room.scale.y = room.scale.z = 3;

		return room;
	};

	this.getRoomFromType = function(typeName) {
		for (var i = this.roomTypes.length - 1; i >= 0; i--) {
			if (this.roomTypes[i].name == typeName) {
				return this.roomTypes[i];
			}
		};

		console.log("ERROR: Invalid room type name:", typeName);
		return null;
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

		var shape = new Room(this.sim, model);
		console.log(shape);
		this.sim.shapes.push(shape);
	};

	this.addInitialHall = function() {
		console.log("add initial hall");
		var gridSection = this.sim.grid.get(2, 0);
		var room = this.generateRoom("Hall", gridSection);

		this.sim.grid.setRoom(2, 0, room);
		this.sim.addShape(room);

		return room;
	};

	this.snapHoveredRoomToGrid = function(room, hoveredGrid) {

		if (room.gridSectionToSnapTo == hoveredGrid) {
			return;
		}

		room.gridSectionToSnapTo = hoveredGrid;
		var gridSection = this.sim.grid.get(hoveredGrid.gridX, hoveredGrid.gridY);
	
		room.tween = new TWEEN.Tween(room.model.position).to({
		    x: gridSection.x,
		    y: gridSection.y,
		    z: 0
		}, 100).easing(TWEEN.Easing.Sinusoidal.In).start();

		this.sim.graphics.focusCamera(gridSection.x, gridSection.y, 0);	
	};

	this.moveAndUnsnapRoom = function(room, mousePosition) {

		if (room.tween) {
			TWEEN.remove(room.tween);
		}
		room.model.position.set(mousePosition.x - room.width / 2, mousePosition.y - 15, 0);
		room.gridSectionToSnapTo = null;
	};

	this.getContainingRoom = function(position) {

		for (var i = this.rooms.length - 1; i >= 0; i--) {
			if (this.rooms[i].isPointInsideRoom(position)) {
				return this.rooms[i];
			}
		};

		return null;
	};

	this.getNumberOfTrash = function() {

		var number = 0;

		for (var i = this.rooms.length - 1; i >= 0; i--) {
			number += this.rooms[i].getNumberOfTrash();
		};

		return number;
	};

};


var Room = function(_sim, _model, _type) {
	if (!_sim) return;
	//Shape(sim, model);
	//console.log(this.__proto__);
	console.log("new " + _type.name);
	//this.__proto__.__proto__.constructor.call(this, sim, model);
	Shape.call(this, _sim, _model);

	this.light = null;
	this.type = _type;
	this.trashSpawnSpeed = 3000;
	this.trashTimer = 8000;
	this.width = _type.width * sim.grid.gridWidth;
	this.length = sim.grid.gridLength;
	this.trash = [];

	this.createLight = function() {
		sim.pointLight.position.set( this.model.position.x + 15, this.model.position.y + 15, this.model.position.z + 10 );
	}

	this.removeLight = function() {
		if (sim.pointLight.position.x == (this.model.position.x + 15)
		 && sim.pointLight.position.y == (this.model.position.y + 15)) {
			sim.pointLight.position.set( 0, -200, 0 );
		}
	};

	this.clicked = function() {

		//this.model.position.z += 10;
		//sim.pointLight.position.set( this.model.position.x, this.model.position.y + 20, this.model.position.z + 10 );
	}

	this.getDimensions = function() {

		return {
			start: this.model.position,
			size: new THREE.Vector3(this.width, 30, this.length)
		};
	};

	this.update = function(dt) {

		this.trashTimer -= dt;

		if (this.trashTimer < 0) {
			this.trashTimer = this.trashSpawnSpeed;

			this.generateTrash();
		}
	};

	this.generateTrash = function() {

		var x = (this.width - 10) * Math.random() + this.model.position.x + 5;
		var z = (this.length - 10) * Math.random() + this.model.position.z + 5;
		var y = this.model.position.y + 2;

		//var model = sim.graphics.getModel(sim.modelUrls[0]);

		var mesh = new THREE.Mesh(
			new THREE.BoxGeometry(2, 2, 2), 
			new THREE.MeshBasicMaterial( { color: 0x606060 } )
			);

		mesh.position.set(x, y, z);
		
		var trash = new Trash(sim, mesh);
		this.trash.push(trash);
		sim.addShape(trash);
	};

	this.getClosestTrash = function(position) {

		var closestTrash = null;
		var smallestDistance = 0;

		for (var i = this.trash.length - 1; i >= 0; i--) {
			
			var distance = this.trash[i].model.position.distanceTo(position);

			if ((closestTrash == null || distance < smallestDistance) && !this.trash[i].claimed) {
				closestTrash = this.trash[i];
				smallestDistance = distance;
			}
		};

		if (closestTrash) {
			closestTrash.claimed = true;
		}
		return closestTrash;
	};

	this.removeTrash = function(trash) {

		for (var i = this.trash.length - 1; i >= 0; i--) {
			if (this.trash[i] == trash) {
				sim.removeShape(this.trash[i]);
				this.trash.splice(i, 1);
				return;
			}
		};

		console.log("ERROR: Tried to remove non-existant trash");
	};

	this.isPointInsideRoom = function(point) {
		return point.x > this.model.position.x && point.x < (this.model.position.x + this.width) &&
				point.y > this.model.position.y && point.y < (this.model.position.y + 30) &&
				point.z > this.model.position.z && point.z < (this.model.position.z + this.length);
	};

	this.getNumberOfTrash = function() {
		return this.trash.length;
	};
}

Room.prototype = new Shape();
Room.prototype.constructor = Room;


var DraggingRoom = function(sim, model, type) {
	//Shape(sim, model);
	//console.log(this.__proto__);
	Room.call(this, sim, model, type);
	//this.__proto__.__proto__.constructor.call(this, sim, model);

	this.gridSectionToSnapTo = null;
}

DraggingRoom.prototype = new Room();
DraggingRoom.prototype.constructor = DraggingRoom;


var Trash = function(sim, model) {
	Shape.call(this, sim, model);
	//console.log(this.__proto__);
	//this.__proto__.__proto__.constructor.call(this, sim, model);

	this.claimed = false;
}

Trash.prototype = new Shape();
Trash.prototype.constructor = Trash;