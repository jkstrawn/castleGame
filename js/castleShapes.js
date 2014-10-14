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

	this.room = room;
	this.height = 12;

	this.tween = null;
	this.trashToCollect = null;
	this.lastPositionInRoom = null;
	this.timeTilWander = 0;
	this.cleaningTimer = 0;
	this.walkingSpeed = 15;
	this.idleSpeed = 8;
	this.fallingSpeed = 0;
	this.idleTime = 10000;
	this.newTrash = false;

	var states = {
		IDLE: 0,
		MOVING: 1,
		CLEANING: 2,
		FALLING: 3,
		DRAGGING: 4,
	};

	var stateSounds = {
		IDLE: [],
		MOVING: [],
		CLEANING: ["res/sounds/trashPickup2.mp3", "res/sounds/trashPickup3.mp3"], //"res/sounds/trashPickup1.mp3", 1 sucks
		FALLING: [],
		DRAGGING: []
	}

	this.state = states.IDLE;

	var that = this;

	init();

	function init() {
		if (!this.room instanceof Room) {
			console.log("ERROR: Initiated servant with non-room object");
		}
	}

	this.update = function(dt) {

		if (this.state == states.DRAGGING) return;

		if (this.state == states.FALLING) {
			this.fall(dt);
			return;
		}

		if (this.state == states.CLEANING) {
			this.cleanTrash(dt);
			return;
		}

		if (this.state == states.IDLE) {

			this.idleTime += dt;
			this.timeTilWander -= dt;
			this.moveIfTrashToClean();

			if (this.timeTilWander < 0) {
				this.wanderToRandomLocation();
			}
		}
	};

	this.getRandomStateSound = function (state) {
		var sounds = stateSounds[state],
			result = null;

		if (sounds.length > 0)
		{
			result = sounds[Math.floor(Math.random() * sounds.length)];
		}

		return result;
	}

	this.fall = function(dt) {

		this.model.position.y -= this.fallingSpeed * dt / 100;

		this.fallingSpeed += .01 * dt;

		if (this.model.position.y < (this.room.getY() + 6)) {
			this.model.position.y = this.room.getY() + 6;
			this.state = states.IDLE;
		}
	};

	this.cleanTrash = function(dt) {

		this.cleaningTimer -= dt;

		if (this.cleaningTimer < 0) {
			this.state = states.IDLE;
			this.room.removeTrash(this.trashToCollect);
			this.trashToCollect = null;
			this.timeTilWander = Math.random() * 2000 + 3000;
		}
		
		if (this.state == states.CLEANING && this.newTrash) {
			this.newTrash = false;
			this.sim.audio.addSound([this.getRandomStateSound("CLEANING")], 200, 1, this.getPosition())
		}
	};

	this.moveIfTrashToClean = function() {
		if (this.trashToCollect) {
			return;
		}

		var trash = this.room.getClosestTrash(this.model.position);

		if (trash) {
			this.state = states.MOVING;
			this.trashToCollect = trash;
			this.newTrash = true;
			this.moveTo(new THREE.Vector3(trash.model.position.x, this.model.position.y, trash.model.position.z), this.walkingSpeed);
		}
	};

	this.wanderToRandomLocation = function() {

		var roomDimensions = this.room.getDimensions();

		var x = this.model.position.x + (Math.random() - .5) * 20;
		var z = this.model.position.z + (Math.random() - .5) * 20;
		var y = roomDimensions.start.y + 5;

		x = this.makePointBetweenMinAndMax(x, roomDimensions.start.x + 5, roomDimensions.start.x + roomDimensions.size.x - 5);
		z = this.makePointBetweenMinAndMax(z, roomDimensions.start.z + 5, roomDimensions.start.z + roomDimensions.size.z - 5);

		this.moveTo(new THREE.Vector3(x, y, z), this.idleSpeed);
	};

	this.makePointBetweenMinAndMax = function(point, min, max) {

		return Math.min(Math.max(point, min), max);
	};

	this.moveTo = function(position, speed) {

		if (this.tween)
			TWEEN.remove(this.tween);
		this.rotateToPosition(position.x, position.z);

		var oldPosition = this.model.position;
		var distance = oldPosition.distanceTo(position);
		var time = distance / speed * 1000;
		this.tween = new TWEEN.Tween(this.model.position).to({
		    x: position.x,
		    y: position.y,
		    z: position.z
		}, time).onComplete(this.arrivedAtDestination).start();

		//need to adjust shorter distances to take longer in order to use sine easing
		//.easing(TWEEN.Easing.Sinusoidal.InOut)

		this.timeTilWander = Math.random() * 2000 + 1000 + time;

	};

	this.rotateToPosition = function(x, z) {

		var dx = x - this.getX();
		var dz = z - this.getZ();
		var rotation = - Math.atan2(dz, dx);
		this.model.rotation.y = rotation;
	};

	this.arrivedAtDestination = function() {
		that.state = states.IDLE;

		if (that.trashToCollect) {
			that.state = states.CLEANING;
			that.cleaningTimer = 2000;
		}
	};

	this.stop = function() {

		this.state = states.DRAGGING;
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
			this.state = states.FALLING;
			this.fallingSpeed = 0;
		} else {
			this.state = states.IDLE;
			this.setPosition(this.lastPositionInRoom.x, this.lastPositionInRoom.y, this.lastPositionInRoom.z);
		}
	};

	this.getIdleTime = function() {

		var time = this.idleTime;
		this.idleTime = 0;
		return time; 
	};

	this.turnRed = function() {
console.log("enrage!!!");
		var redMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});

		this.model.children[0].children[0].material = redMaterial;
		console.log(this.model.children[0].children[0].material);
	};
}

Servant.prototype = new Shape();
Servant.prototype.constructor = Servant;