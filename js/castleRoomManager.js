var RoomManager = function(_sim) {
	this.sim = _sim;
	this.rooms = [];
	this.roomTypes = [];

	this.roomTypes.push({name: "Bedroom", width: 1, modelIndex: 1});
	this.roomTypes.push({name: "Hall", width: 3, modelIndex: 2});


	this.generateTransparentRoomModel = function(typeName) {

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

		return roomModel;
	};

	this.generateRoom = function(typeName, gridSection) {

		var roomType = this.getRoomFromType(typeName);
		var roomModel = this.generateRoomModel(roomType, new THREE.Vector3(gridSection.x, gridSection.y, 0));
		var room = new Room(this.sim, roomModel);

		room.type = roomType;

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
		var gridLoc = this.sim.grid.get(2, 0);
		var room = this.generateRoom("Hall", gridLoc);

		this.sim.grid.setRoom(2, 0, room);
		this.sim.addShape(room);
	};

};


var Room = function(sim, model) {
	//Shape(sim, model);
	//console.log(this.__proto__);
	this.__proto__.__proto__.constructor.call(this, sim, model);

	this.light = null;
	this.type = null;

	this.createLight = function() {
		sim.pointLight.position.set( this.model.position.x + 15, this.model.position.y + 15, this.model.position.z + 10 );
	}

	this.removeLight = function() {
		if (sim.pointLight.position.x == (this.model.position.x + 15)
		 && sim.pointLight.position.y == (this.model.position.y + 15)) {
			sim.pointLight.position.set( 0, -200, 0 );
		}
	};

	this.modify = function() {

		this.model.position.z += 10;

		sim.pointLight.position.set( this.model.position.x, this.model.position.y + 20, this.model.position.z + 10 );
	}

	this.getDimensions = function() {

		var width = this.type.width * this.sim.grid.gridWidth;
		var length = this.sim.grid.gridLength;

		return {
			start: this.model.position,
			size: new THREE.Vector3(width, 30, length)
		};
	};
}

Room.prototype = new Shape();
Room.prototype.constructor = Room;