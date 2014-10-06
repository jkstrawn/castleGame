var Shape = function(_sim, _model) {
	this.sim = _sim;
	this.model = _model;
	this.hover = false;
	this.tween = null;

	this.init = function() {};

	this.update = function() {
		//this.model.rotation.y += .01;
	};

	this.setHover = function(_hover) {

		if (!this.hover && _hover) {
			this.createLight();
		}
		if (this.hover && !_hover) {
			this.removeLight();
		}
		this.hover = _hover;
	}

	this.clicked = function() {
	};

	this.getX = function() {
		return this.model.position.x;
	};

	this.getY = function() {
		return this.model.position.y;
	};

	this.getZ = function() {
		return this.model.position.z;
	};

	this.getPosition = function() {
		return this.model.position;
	};

	this.setPosition = function(x, y, z) {
		this.model.position.set(x, y, z);
	};

	this.createLight = function() {};
	this.removeLight = function() {};
}

var Servant = function(sim, model, room) {
	Shape.call(this, sim, model);

	this.idleTimer = 0;
	this.room = room;
	this.moving = false;
	this.trashToCollect = null;
	this.speed = 15;
	this.idleSpeed = 10;
	this.tween = null;
	this.dragging = false;
	this.fallingSpeed = 0;
	this.falling = false;
	this.lastPositionInRoom = null;

	var that = this;

	init();

	function init() {
		if (!this.room instanceof Room) {
			console.log("ERROR: Initiated servant with non-room object");
		}
	}

	this.update = function(dt) {
		if (this.dragging) return;

		if (this.falling) {
			this.fall(dt);
			return;
		}

		this.idleTimer -= dt;

		this.moveIfTrashToClean();

		if (this.idleTimer < 0 && !this.moving) {
			this.goToRandomLocation();
		}
	};

	this.fall = function(dt) {

		this.model.position.y -= this.fallingSpeed * dt / 100;

		this.fallingSpeed += .01 * dt;

		if (this.model.position.y < (this.room.getY() + 6)) {
			this.model.position.y = this.room.getY() + 6;
			this.falling = false;
		}
	};

	this.moveIfTrashToClean = function() {
		if (this.trashToCollect) {
			return;
		}

		var trash = this.room.getClosestTrash(this.model.position);

		if (trash) {
			this.trashToCollect = trash;
			this.moveTo(new THREE.Vector3(trash.model.position.x, this.model.position.y, trash.model.position.z), this.speed);
		}
	};

	this.goToRandomLocation = function() {

		var roomDimensions = this.room.getDimensions();

		var maxX = roomDimensions.start.x + roomDimensions.size.x - 5;
		var minX = roomDimensions.start.x + 5;
		var maxZ = roomDimensions.start.z + roomDimensions.size.z - 5;
		var minZ = roomDimensions.start.z + 5;
		var y = roomDimensions.start.y + 5;

		var x = this.model.position.x + (Math.random() - .5) * 20;
		var z = this.model.position.z + (Math.random() - .5) * 20;

		x = Math.max(x, minX);
		x = Math.min(x, maxX);
		z = Math.max(z, minZ);
		z = Math.min(z, maxZ);

		this.moveTo(new THREE.Vector3(x, y, z), this.idleSpeed);
	};

	this.moveTo = function(position, speed) {

		if (this.tween)
			TWEEN.remove(this.tween);

		var oldPosition = this.model.position;
		var distance = oldPosition.distanceTo(position);
		var time = distance / speed * 1000;
		this.tween = new TWEEN.Tween(this.model.position).to({
		    x: position.x,
		    y: position.y,
		    z: position.z
		}, time).onComplete(this.hasStoppedMoving).start();

		//need to adjust shorter distances to take longer in order to use sine easing
		//.easing(TWEEN.Easing.Sinusoidal.InOut)

		this.moving = true;
		this.idleTimer = Math.random() * 2000 + 3000;

	};

	this.hasStoppedMoving = function() {
		that.moving = false;

		if (that.trashToCollect) {
			that.room.removeTrash(that.trashToCollect);
			that.trashToCollect = null;
		}
	};

	this.stop = function() {

		this.dragging = true;
		this.moving = false;
		this.lastPositionInRoom = this.getPosition().clone();

		if (this.trashToCollect) {
			this.trashToCollect.claimed = false;
			this.trashToCollect = null;
		}
		if (this.tween)
			TWEEN.remove(this.tween);
	};

	this.stopDragging = function() {
		var room = this.sim.rooms.getContainingRoom(this.model.position);

		if (room) {
			this.room = room;
			//this.model.position.y = room.getY();
			this.falling = true;
			this.fallingSpeed = 0;
		} else {
			this.setPosition(this.lastPositionInRoom.x, this.lastPositionInRoom.y, this.lastPositionInRoom.z);
		}

		this.dragging = false;
		this.lastPositionInRoom = null;
	};
}

Servant.prototype = new Shape();
Servant.prototype.constructor = Servant;