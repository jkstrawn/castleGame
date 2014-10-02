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
	this.moveTimer = 0;
	this.room = room;
	this.moving = false;

	var that = this;

	this.update = function(dt) {
		this.moveTimer -= dt;

		if (this.moveTimer < 0 && !this.moving) {
			this.moveTimer = Math.random() * 2000 + 3000;
			var speed = 200;

			var roomDimensions = this.room.getDimensions();

			var maxX = roomDimensions.start.x + roomDimensions.size.x - 5;
			var minX = roomDimensions.start.x + 5;
			var maxZ = roomDimensions.start.z + roomDimensions.size.z - 5;
			var minZ = roomDimensions.start.z + 5;
			var y = roomDimensions.start.y + 5;

			var oldX = this.model.position.x;
			var oldZ = this.model.position.z;

			var x = oldX + (Math.random() - .5) * 20;
			var z = oldZ + (Math.random() - .5) * 20;

			if (x > maxX)
				x = maxX;
			if (x < minX)
				x = minX;
			if (z > maxZ)
				z = maxZ;
			if (z < minZ)
				z = minZ;

			var oldPosition = this.model.position;
			var newPosition = new THREE.Vector3(x, y, z);
			var distance = oldPosition.distanceTo(newPosition);
			var time = distance * speed;
			var tween = new TWEEN.Tween(this.model.position).to({
			    x: x,
			    y: y,
			    z: z
			}, time).onComplete(this.stopMoving).start();
			//need to adjust shorter distances to take longer in order to use sine easing
			//.easing(TWEEN.Easing.Sinusoidal.InOut)

			this.moving = true;
		}
	};

	this.stopMoving = function() {
		that.moving = false;
	};
}

Servant.prototype = new Shape();
Servant.prototype.constructor = Servant;