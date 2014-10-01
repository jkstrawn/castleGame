var RoomManager = function() {
	this.rooms = [];


	this.generateRoomModel = function(vector) {

		var room = this.graphics.getModel(this.modelUrls[1]);

		room.position.set(vector.x, vector.y, vector.z);
		room.rotation.y = Math.PI * 1.5;
		room.scale.x = room.scale.y = room.scale.z = 3;

		return room;
	}

};