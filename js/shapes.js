(function() {

	var Shape = my.Class({

		STATIC: {
		  	AGE_OF_MAJORITY: 18
		},

		constructor: function(model) {
			this.model = model;
			this.hover = false;
			this.tween = null;

		},

		update: function() {},

		updateMaterialVector: function() {},

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

		constructor: function(model, room) {
			Person.Super.call(this, model);
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
				IDLEWALK: 1,
				MOVING: 2,
				CLEANING: 3,
				FALLING: 4,
				DRAGGING: 5,
			};

			this.stateSounds = {
				IDLE: [],
				IDLEWALK: [],
				MOVING: [],
				CLEANING: ["trashPickup2.mp3", "trashPickup3.mp3"], //"res/sounds/trashPickup1.mp3", 1 sucks
				FALLING: [],
				DRAGGING: []
			};

			this.stateAnimations = {
				IDLE: ["idle"],
				IDLEWALK: ["walk"],
				MOVING: ["walk"],
				CLEANING: ["idle"], //"res/sounds/trashPickup1.mp3", 1 sucks
				FALLING: ["idle"],
				DRAGGING: ["idle"]
			};

			if (!this.room instanceof SIM.Room) {
				console.log("ERROR: Initiated servant with non-room object");
			}
		},

		update: function(dt) {

			if (this.state == this.states.IDLE || this.state == this.states.IDLEWALK) {

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

			if (this.model.position.y < (this.room.getY() + 1.2)) {
				this.model.position.y = this.room.getY() + 1.2;
				this.state = this.states.IDLE;
			}
		},

		wanderToRandomLocation: function() {

			this.state = this.states.IDLEWALK;

			var roomDimensions = this.room.getDimensions();

			var x = this.model.position.x + (Math.random() * 7 + 2) * (Math.random() > .5 ? 1 : -1);
			var z = this.model.position.z + (Math.random() * 7 + 2) * (Math.random() > .5 ? 1 : -1);
			var y = roomDimensions.start.y + 1.2;

			x = this.makePointBetweenMinAndMax(x, roomDimensions.start.x + 5, roomDimensions.start.x + roomDimensions.size.x - 5);
			z = this.makePointBetweenMinAndMax(z, roomDimensions.start.z + 5, roomDimensions.start.z + roomDimensions.size.z - 5);

			this.moveTo(new THREE.Vector3(x, y, z), this.idleSpeed);
		},

		makePointBetweenMinAndMax: function(point, min, max) {

			return Math.min(Math.max(point, min), max);
		},

		moveTo: function(position, speed) {
			if (this.tween)
				this.tween.stop();

			this.rotateToPosition(position.x, position.z);

			var oldPosition = this.model.position;
			var distance = oldPosition.distanceTo(position);
			var time = distance / speed * 1000;

			this.tween = new TWEEN.Tween(this.model.position).to({
			    x: position.x,
			    y: position.y,
			    z: position.z
			}, time).onComplete($.proxy(this.arrivedAtDestination, this)).start();

			if (this.model.animations) {
				if (!this.model.animations["walk"].isPlaying) {
					this.model.stopAll();
					this.model.play("walk", 1, speed / 7);
				} else {
					this.model.animations["walk"].timeScale = speed / 7;
				}
			}

			//need to adjust shorter distances to take longer in order to use sine easing
			//.easing(TWEEN.Easing.Sinusoidal.InOut)

			this.timeTilWander = Math.random() * 4000 + 2000 + time;

		},

		rotateToPosition: function(x, z) {

			var dx = x - this.getX();
			var dz = z - this.getZ();
			var rotation = - Math.atan2(dz, dx) + .5 * Math.PI;
			this.model.rotation.y = rotation;
		},

		arrivedAtDestination: function() {

			if (this.model.animations) {
				this.model.stopAll();
				this.model.play("idle", 1);
			}
			this.state = this.states.IDLE;
		},

		stop: function() {

			this.state = this.states.DRAGGING;
			this.lastPositionInRoom = this.getPosition().clone();
			this.path = null;

			if (this.tween)
				TWEEN.remove(this.tween);
		},

		stopDragging: function() {
			var room = sim.rooms.getContainingRoom(this.model.position);

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

		constructor: function(model, room) {
			Servant.Super.call(this, model, room);


			this.trashToCollect = null;
			this.newTrash = false;
			this.cleaningTimer = 0;

			if (room == null) {
				console.log("ERROR: Tried to instantiate a servant with a null room");
			}
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

			if (this.state == this.states.IDLE || this.state == this.states.IDLEWALK) {
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
				sim.audio.addSound([this.getRandomStateSound("CLEANING")], 200, 1, this.getPosition())
			}
		},

		moveIfTrashToClean: function() {
			if (this.trashToCollect) {
				return;
			}

			var trash = this.room.getClosestTrash(this.model.position);

			if (trash) {
				this.assignTrash(trash);
			} else {
				this.tryGettingForeignTrash();
			}
		},

		tryGettingForeignTrash: function() {

			trash = sim.rooms.getTrash();

			if (trash) {
				var path = sim.grid.getPath(this, trash);
				this.assignTrash(trash, path);
			}
		},

		assignTrash: function(trash, path) {

			this.state = this.states.MOVING;
			this.trashToCollect = trash;
			this.newTrash = true;
			trash.claimed = true;

			if (path) {
				this.path = path;
				this.moveAlongPath();
			} else {
				this.moveTo(new THREE.Vector3(trash.getX(), this.getY(), trash.getZ()), this.walkingSpeed);	
			}
		},

		moveAlongPath: function() {

			if (this.path[0].room) {
				this.room = this.path[0].room;
			}

			this.moveTo(new THREE.Vector3(this.path[0].x, this.path[0].y, this.path[0].z), this.walkingSpeed);
		},

		arrivedAtDestination: function() {

			if (this.path) {
				this.path.shift();
				if (this.path.length) {
					this.moveAlongPath();
					return;
				}
				this.path = null;
			}

			if (this.model.animations) {
				this.model.stopAll();
				this.model.play("idle", 1);
			}

			if (this.trashToCollect) {
				this.state = this.states.CLEANING;
				this.cleaningTimer = 2000;
			} else {
				this.state = this.states.IDLE;
			}
		},

		turnRed: function() {

			this.model.traverse(function(thing) {
				if (thing.material instanceof THREE.MeshLambertMaterial) {
					thing.material.color.setHex( 0xff0000 );
					//thing.material.ambient.setHex( 0xff0000 );
				}
			});	
		},

		stop: function() {

			if (this.trashToCollect) {
				this.trashToCollect.claimed = false;
				this.trashToCollect = null;
			}

			Servant.Super.prototype.stop.call(this);
		},

		setState: function(state) {

		}

	});

	SIM.Servant = Servant;

	var Noble = my.Class(SIM.Person, {
		constructor: function(model, room) {
			Noble.Super.call(this, model, room);

			this.taxMoney = 0;
		},

		update: function(dt) {
			Noble.Super.prototype.update.call(this, dt);

			this.taxMoney += dt / 1000;
		},

		getTaxMoney: function() {

			var money = this.taxMoney;
			this.taxMoney = 0;
			return money;
		},

	});

	SIM.Noble = Noble;

})();