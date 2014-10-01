var RoomManager = function(_sim) {
	this.sim = _sim;
	this.rooms = [];



	this.generateTransparentRoom = function() {
		var room = this.generateRoomModel(new THREE.Vector3(150, 50, 0));
		
		room.traverse(function(thing) {
			if (thing.material instanceof THREE.MeshLambertMaterial) {
				var clonedMat = thing.material.clone();

				thing.material = clonedMat;
				thing.material.opacity = .4;
				thing.material.transparent = true;
			}
		});

		return room;
	};

	this.generateRoomModel = function(vector) {

		var room = this.sim.graphics.getModel(this.sim.modelUrls[1]);

		room.position.set(vector.x, vector.y, vector.z);
		room.rotation.y = Math.PI * 1.5;
		room.scale.x = room.scale.y = room.scale.z = 3;

		return room;
	};


	this.generateRoom = function(gridSection) {

		var roomModel = this.generateRoomModel(new THREE.Vector3(gridSection.x, gridSection.y, 0));
		var room = new Room(this.sim, roomModel);

		return room;
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
		var room = this.sim.graphics.getModel(this.sim.modelUrls[2]);

		room.position.set(gridLoc.x, gridLoc.y, 0);
		room.rotation.y = Math.PI * 1.5;
		room.scale.x = room.scale.y = room.scale.z = 3;

		this.addRoom(room);
		this.sim.graphics.addModel(room);
	};

};


var Room = function(sim, model) {
	//Shape(sim, model);
	//console.log(this.__proto__);
	this.__proto__.__proto__.constructor.call(this, sim, model);

	this.light = null;

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
}

Room.prototype = new Shape();
Room.prototype.constructor = Room;