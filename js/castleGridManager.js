(function() {

	var GridManager = my.Class({
		constructor: function(_sim) {
			this.sim = _sim;
			this.grid = [];
			this.gridWidth = 15;
			this.gridLength = 30;
			this.gridHeight = 30;

			this.gridStates = {
				INVALID: 0,
				ROOMTOOBIG: 1,
				OPEN: 2
			}
		},

		init: function() {

			var startPoint = -110;
			var numOfSectionsX = 15;
			var numOfSectionsY = 4;

			for (var x = 0; x < numOfSectionsX; x++) {
				this.grid[x] = [];

				for (var y = 0; y < numOfSectionsY; y++) {
					this.grid[x][y] = {
						x: x * this.gridWidth + startPoint, 
						y: y * this.gridHeight, 
						z: 0,
						gridX: x,
						gridY: y,
						used: false
					};
				}
			};
		},

		get: function(x, y) {

			if (this.grid[x]) {
				return this.grid[x][y];
			}

			return null;
		},

		getRoom: function(x, y) {
			var loc = this.get(x, y);
			if (loc) {
				return loc.room;
			}

			return null;
		},

		show: function(roomWidth) {
			var openSpots = [];
			var lastGoodYRoom = [];
			var lastRoomBlob = [];
			var roomBlobs = [];

			for (var i = 0; i < this.grid[0].length; i++) {
				lastGoodYRoom[i] = -1;
			}

			for (var x = 0; x < this.grid.length; x ++) {
				for (var y = 0; y < this.grid[x].length; y++) {
					var box = this.grid[x][y];
					var gridState = this.isGridLocationValid(x, y, roomWidth);

					if (gridState == this.gridStates.OPEN) {
						openSpots.push({start: box, segments: 1, gridX: x, gridY: y});

						if (lastGoodYRoom[y] == -1) {
							lastRoomBlob[y] = {start: box, segments: 1};
						} else {
							lastRoomBlob[y].segments++;
						}

						lastGoodYRoom[y] = openSpots.length - 1;
					}

					if (gridState == this.gridStates.ROOMTOOBIG && lastGoodYRoom[y] > -1) {
						lastRoomBlob[y].segments++;
						openSpots[lastGoodYRoom[y]].segments++;
					}

					if (gridState == this.gridStates.INVALID) {
						if (lastGoodYRoom[y] > -1) {
							roomBlobs.push(lastRoomBlob[y]);
							lastRoomBlob[y] = null;
						}
						lastGoodYRoom[y] = -1;
					}
				}
			};

			this.generateGridStuff(lastGoodYRoom, lastRoomBlob, openSpots, roomBlobs);
		},

		isGridLocationValid: function(x, y, roomWidth) {

			if (this.grid[x][y - 1] && !this.grid[x][y - 1].used) {
				// the grid below is empty
				return this.gridStates.INVALID;
			}

			if (this.grid[x][y].used) {
				// the grid is occupied by a room already
				return this.gridStates.INVALID;
			}

			for (var i = 1; i < roomWidth; i++) {
				if (this.grid[x + i]) {
					if (this.grid[x + i][y].used && !this.grid[x][y].used) {
						// the right side of the room is overlapping another room
						return this.gridStates.ROOMTOOBIG;
					} else if (this.grid[x + 1][y - 1] && !this.grid[x + 1][y - 1].used) {
						// the right side of the room is hanging in mid air
						return this.gridStates.ROOMTOOBIG;
					}
				} else {
					// the room is going off the right side of the grid
					return this.gridStates.ROOMTOOBIG;
				}
			}

			return this.gridStates.OPEN;
		},

		generateGridStuff: function(lastGoodYRoom, lastRoomBlob, openSpots, roomBlobs) {

			for (var i = lastGoodYRoom.length - 1; i >= 0; i--) {
				if (lastGoodYRoom[i] > -1) {
					roomBlobs.push(lastRoomBlob[i]);
				}
			};

			for (var i = roomBlobs.length - 1; i >= 0; i--) {
				this.generateRoomBlob(roomBlobs[i]);
			};

			for (var i = openSpots.length - 1; i >= 0; i--) {
				var box = openSpots[i];
				this.generateSnappableGridLocation(box.start, box.gridX, box.gridY, box.segments);
			};
		},

		generateRoomBlob: function(blob) {

			var adjustedSegments = Math.max(Math.floor(blob.segments / 1.5), 2);
			var smoothCubeGeom = new THREE.BoxGeometry(this.gridWidth * blob.segments, this.gridHeight, this.gridLength, adjustedSegments, adjustedSegments, 2);
			var modifier = new THREE.SubdivisionModifier( 2 );
			modifier.modify( smoothCubeGeom ); 

			var glow = new THREE.Mesh( smoothCubeGeom, this.sim.graphics.glowMaterial.clone());
			glow.position.set(blob.start.x + this.gridWidth * blob.segments / 2, blob.start.y + this.gridHeight / 2, blob.start.z + this.gridLength / 2);

			var boundingBox = new BoundingBox(glow);
			this.sim.graphics.addBoundingBox(boundingBox);

			this.sim.graphics.addRoomSpotParticles(blob.start.x, blob.start.y, blob.segments, this.gridWidth, this.gridLength);
		},

		generateSnappableGridLocation: function(box, gridX, gridY, segments) {

			var gridSnapperBox = new THREE.BoxGeometry(this.gridWidth * segments, this.gridHeight, this.gridLength, 2, 2, 2);

			var glow = new THREE.Mesh( gridSnapperBox, new THREE.MeshBasicMaterial());
			glow.position.set(box.x + this.gridWidth * segments / 2, box.y + this.gridHeight / 2, box.z + this.gridLength / 2);
			glow.visible = false;

			var gridSnapper = new GridSnapper(this.sim, glow, gridX, gridY);
			this.sim.shapes.push(gridSnapper);
			this.sim.graphics.scene.add(glow);
		},

		setRoom: function(startSection, room) {
			
			var width = room.type.width;

			for (var i = startSection.gridX; i < startSection.gridX + width; i++) {
				var section = this.get(i, startSection.gridY);
				section.used = true;
				section.room = room;
			}
		},

	});

	SIM.GridManager = GridManager;

	var GridSnapper = my.Class(SIM.Shape, {

		constructor: function(sim, model, _x, _y) {	
			GridSnapper.Super.call(this, sim, model);

			this.gridX = _x;
			this.gridY = _y;
			this.room = null;
		}
	});

	SIM.GridSnapper = GridSnapper;

	var BoundingBox = my.Class({

		constructor: function(model) {	
			this.model = model;
		},

		updateMaterialVector: function(camera) {

			this.model.material.uniforms.viewVector.value = new THREE.Vector3().subVectors( camera, this.model.position );
		}
	});

	SIM.BoundingBox = BoundingBox;

})()