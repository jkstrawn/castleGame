(function() {

	var Shape = my.Class({

		STATIC: {
		  	AGE_OF_MAJORITY: 18
		},

		constructor: function(sim, model) {
			this.sim = sim;
			this.model = model;
			this.hover = false;
			this.tween = null;

		},

		update: function() {},

		setHover: function(_hover) {

			this.hover = _hover;
		},

		clicked: function() {
		},

		getX: function() {
			return this.model.position.x;
		},

		getY: function() {
			return this.model.position.y;
		},

		getZ: function() {
			return this.model.position.z;
		},

		getPosition: function() {
			return this.model.position;
		},

		setPosition: function(x, y, z) {
			this.model.position.set(x, y, z);
		}

	});

	SIM.Shape = Shape;


	var Person = my.Class(SIM.Shape, {

		constructor: function(_sim, model, room) {
			Person.Super.call(this, _sim, model);
			this.room = room;
			this.tween = null;
			this.lastPositionInRoom = null;
			this.timeTilWander = 0;
			this.walkingSpeed = 15;
			this.idleSpeed = 8;
			this.fallingSpeed = 0;
			this.idleTime = 10000;
			this.state = 0;
			this.states = {
				IDLE: 0,
				MOVING: 1,
				CLEANING: 2,
				FALLING: 3,
				DRAGGING: 4,
			};

			this.stateSounds = {
				IDLE: [],
				MOVING: [],
				CLEANING: ["trashPickup2.mp3", "trashPickup3.mp3"], //"res/sounds/trashPickup1.mp3", 1 sucks
				FALLING: [],
				DRAGGING: []
			};

			if (!this.room instanceof SIM.Room) {
				console.log("ERROR: Initiated servant with non-room object");
			}
		},

		update: function(dt) {

			if (this.state == this.states.IDLE) {

				this.idleTime += dt;
				this.timeTilWander -= dt;

				if (this.timeTilWander < 0) {
					this.wanderToRandomLocation();
				}
			}
		},

		getRandomStateSound: function (state) {

			var sounds = this.stateSounds[state],
				result = null;

			if (sounds.length > 0)
			{
				result = sounds[Math.floor(Math.random() * sounds.length)];
			}

			return result;
		},

		fall: function(dt) {

			this.model.position.y -= this.fallingSpeed * dt / 100;

			this.fallingSpeed += .01 * dt;

			if (this.model.position.y < (this.room.getY() + 6)) {
				this.model.position.y = this.room.getY() + 6;
				this.state = this.states.IDLE;
			}
		},

		wanderToRandomLocation: function() {

			var roomDimensions = this.room.getDimensions();

			var x = this.model.position.x + (Math.random() * 7 + 2) * (Math.random() > .5 ? 1 : -1);
			var z = this.model.position.z + (Math.random() * 7 + 2) * (Math.random() > .5 ? 1 : -1);
			var y = roomDimensions.start.y + 5;

			x = this.makePointBetweenMinAndMax(x, roomDimensions.start.x + 5, roomDimensions.start.x + roomDimensions.size.x - 5);
			z = this.makePointBetweenMinAndMax(z, roomDimensions.start.z + 5, roomDimensions.start.z + roomDimensions.size.z - 5);

			this.moveTo(new THREE.Vector3(x, y, z), this.idleSpeed);
		},

		makePointBetweenMinAndMax: function(point, min, max) {

			return Math.min(Math.max(point, min), max);
		},

		moveTo: function(position, speed) {

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
			}, time).onComplete($.proxy(this.arrivedAtDestination, this)).start();

			//need to adjust shorter distances to take longer in order to use sine easing
			//.easing(TWEEN.Easing.Sinusoidal.InOut)

			this.timeTilWander = Math.random() * 4000 + 2000 + time;

		},

		rotateToPosition: function(x, z) {

			var dx = x - this.getX();
			var dz = z - this.getZ();
			var rotation = - Math.atan2(dz, dx);
			this.model.rotation.y = rotation;
		},

		arrivedAtDestination: function() {
			this.state = this.states.IDLE;
		},

		stop: function() {

			this.state = this.states.DRAGGING;
			this.lastPositionInRoom = this.getPosition().clone();

			if (this.tween)
				TWEEN.remove(this.tween);
		},

		stopDragging: function() {
			var room = this.sim.rooms.getContainingRoom(this.model.position);

			if (room) {
				this.room = room;
				//this.model.position.y = room.getY();
				this.state = this.states.FALLING;
				this.fallingSpeed = 0;
			} else {
				this.state = this.states.IDLE;
				this.setPosition(this.lastPositionInRoom.x, this.lastPositionInRoom.y, this.lastPositionInRoom.z);
			}
		},

		getIdleTime: function() {

			var time = this.idleTime;
			this.idleTime = 0;
			return time; 
		},

	});

	SIM.Person = Person;

	var Servant = my.Class(SIM.Person, {

		constructor: function(_sim, model, room) {
			Servant.Super.call(this, _sim, model, room);


			this.trashToCollect = null;
			this.newTrash = false;
			this.cleaningTimer = 0;
		},

		update: function(dt) {

			if (this.state == this.states.DRAGGING) return;

			if (this.state == this.states.FALLING) {
				this.fall(dt);
				return;
			}

			if (this.state == this.states.CLEANING) {
				this.cleanTrash(dt);
				return;
			}

			if (this.state == this.states.IDLE) {

				this.idleTime += dt;
				this.timeTilWander -= dt;
				this.moveIfTrashToClean();

				if (this.timeTilWander < 0) {
					this.wanderToRandomLocation();
				}
			}
		},


		cleanTrash: function(dt) {

			this.cleaningTimer -= dt;

			if (this.cleaningTimer < 0) {
				this.state = this.states.IDLE;
				this.room.removeTrash(this.trashToCollect);
				this.trashToCollect = null;
				this.timeTilWander = Math.random() * 2000 + 3000;
			}

			if (this.state == this.states.CLEANING && this.newTrash) {
				this.newTrash = false;
				this.sim.audio.addSound([this.getRandomStateSound("CLEANING")], 200, 1, this.getPosition())
			}
		},

		moveIfTrashToClean: function() {
			if (this.trashToCollect) {
				return;
			}

			var trash = this.room.getClosestTrash(this.model.position);

			if (trash) {
				this.state = this.states.MOVING;
				this.trashToCollect = trash;
				this.newTrash = true;
				this.moveTo(new THREE.Vector3(trash.model.position.x, this.model.position.y, trash.model.position.z), this.walkingSpeed);
			}
		},


		arrivedAtDestination: function() {
			Servant.Super.prototype.arrivedAtDestination.call(this);

			if (this.trashToCollect) {
				this.state = this.states.CLEANING;
				this.cleaningTimer = 2000;
			}
		},

		turnRed: function() {

			var redMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
			this.model.children[0].children[0].material = redMaterial;
		},

		stop: function() {

			if (this.trashToCollect) {
				this.trashToCollect.claimed = false;
				this.trashToCollect = null;
			}

			Servant.Super.prototype.stop.call(this);
		},

	});

	SIM.Servant = Servant;

	var Noble = my.Class(SIM.Person, {
		constructor: function(_sim, model, room) {
			Noble.Super.call(this, _sim, model, room);
		},

	});

	SIM.Noble = Noble;

})();