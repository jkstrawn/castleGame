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

	this.modify = function() {
	};

	this.createLight = function() {};
	this.removeLight = function() {};
}

var Servant = function(sim, model, room) {
	this.__proto__.__proto__.constructor.call(this, sim, model);
	this.idleTimer = 0;
	this.room = room;
	this.moving = false;
	this.trashToCollect = null;
	this.speed = 15;
	this.idleSpeed = 10;
	this.tween = null;

	var that = this;

	this.update = function(dt) {
		this.idleTimer -= dt;

		this.moveIfTrashToClean();

		if (this.idleTimer < 0 && !this.moving) {
			this.goToRandomLocation();
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

		TWEEN.remove(this.tween);

		var oldPosition = this.model.position;
		var distance = oldPosition.distanceTo(position);
		var time = distance / speed * 1000;
		this.tween = new TWEEN.Tween(this.model.position).to({
		    x: position.x,
		    y: position.y,
		    z: position.z
		}, time).onComplete(this.stopMoving).start();

		//need to adjust shorter distances to take longer in order to use sine easing
		//.easing(TWEEN.Easing.Sinusoidal.InOut)

		this.moving = true;
		this.idleTimer = Math.random() * 2000 + 3000;

	};

	this.stopMoving = function() {
		that.moving = false;

		if (that.trashToCollect) {
			that.room.removeTrash(that.trashToCollect);
			that.trashToCollect = null;
		}
	};
}

Servant.prototype = new Shape();
Servant.prototype.constructor = Servant;