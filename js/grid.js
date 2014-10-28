(function() {

	var GridManager = my.Class({
		constructor: function() {
			this.grid = [];
			this.gridWidth = 15;
			this.gridLength = 30;
			this.gridHeight = 30;
			this.numOfSectionsX = 15;
			this.numOfSectionsY = 4;
			this.map = null;
			this.points = [];

			this.gridStates = {
				INVALID: 0,
				ROOMTOOBIG: 1,
				OPEN: 2
			}

			this.directions = ["north", "east", "south", "west"];
		},

		init: function() {

			var startPoint = -110;

			for (var x = 0; x < this.numOfSectionsX; x++) {
				this.grid[x] = [];

				for (var y = 0; y < this.numOfSectionsY; y++) {
					this.grid[x][y] = {
						x: x * this.gridWidth + startPoint, 
						y: y * this.gridHeight, 
						z: 0,
						gridX: x,
						gridY: y,
						used: false,
						room: null,
						name: "a"
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

			var glow = new THREE.Mesh( smoothCubeGeom, sim.graphics.glowMaterial.clone());
			glow.position.set(blob.start.x + this.gridWidth * blob.segments / 2, blob.start.y + this.gridHeight / 2, blob.start.z + this.gridLength / 2);

			var boundingBox = new BoundingBox(glow);
			sim.graphics.addBoundingBox(boundingBox);

			sim.graphics.addRoomSpotParticles(blob.start.x, blob.start.y, blob.segments, this.gridWidth, this.gridLength);
		},

		generateSnappableGridLocation: function(box, gridX, gridY, segments) {

			var gridSnapperBox = new THREE.BoxGeometry(this.gridWidth * segments, this.gridHeight, this.gridLength, 2, 2, 2);

			var glow = new THREE.Mesh( gridSnapperBox, new THREE.MeshBasicMaterial());
			glow.position.set(box.x + this.gridWidth * segments / 2, box.y + this.gridHeight / 2, box.z + this.gridLength / 2);
			glow.visible = false;

			var gridSnapper = new GridSnapper(glow, gridX, gridY);
			sim.shapes.push(gridSnapper);
			sim.graphics.scene.add(glow);
		},

		setRoom: function(startSection, room) {
			
			var width = room.type.width;

			for (var i = startSection.gridX; i < startSection.gridX + width; i++) {
				var section = this.get(i, startSection.gridY);
				section.used = true;
				section.room = room;
			}
		},

		generateRoomPoints: function() {

		},

		updateRoomPoints: function() {

			this.points = [];
			this.assignNamesAndPoints();

			for (var x = 0; x < this.grid.length; x ++) {
				for (var y = 0; y < this.grid[x].length; y++) {
					var gridSection = this.grid[x][y];

					if (gridSection.room && !gridSection.room.gridConnected) {
						var reachableNorth = this.connectTwoPoints(gridSection, "north", "south");
						var reachableEast = this.connectTwoPoints(gridSection, "east", "west");
						var reachableSouth = this.connectTwoPoints(gridSection, "south", "north");
						var reachableWest = this.connectTwoPoints(gridSection, "west", "east");
						var roomReachable = reachableNorth || reachableEast || reachableSouth || reachableWest;
						gridSection.room.gridConnected = true;
						if (!roomReachable)
							console.log("Room is unreachable: " + gridSection.room);
						gridSection.room.reachable = roomReachable;
					}
				}
			};

			this.map = this.constructGraph();

			/*
			console.log(this.points);
			for (var i = this.points.length - 1; i >= 0; i--) {
				var mesh = new THREE.BoxGeometry(2, 2, 2);
				var pointBox = new THREE.Mesh(mesh, new THREE.MeshBasicMaterial());
				pointBox.position.set(this.points[i].x, this.points[i].y, this.points[i].z);
				sim.graphics.scene.add(pointBox);
			};
			*/
		},

		constructGraph: function() {

			var map = {};

			for (var i = this.points.length - 1; i >= 0; i--) {
				var point = this.points[i];
				var siblings = {};
				for (var s = 0; s < point.siblings.length; s++) {
					siblings[point.siblings[s]] = 1;
				}
				map[this.points[i].name] = siblings;
			};

			return map;
		},

		getPath: function(startObject, endObject) {

			if(endObject.gridName == "a") return;

			var map = this.constructGraph();

			var startPoint = {};
			startPoint[startObject.room.gridName + "2"] = 1;
			startPoint[startObject.room.gridName + "4"] = 1;
			map["start"] = startPoint;

			var endRoomPoint1 = map[endObject.gridName + "2"];
			endRoomPoint1["end"] = 1;
			var endRoomPoint2 = map[endObject.gridName + "4"];
			endRoomPoint2["end"] = 1;
			map["end"] = {};
			
			var graph = new Graph(map);
			var path = graph.findShortestPath("start", "end");
			if (path) {
				return this.constructPathPoints(path, endObject);
			}

			return null;
		},

		constructPathPoints: function(path, endObject) {

			var pathPoints = [];

			for (var i = 1; i < path.length - 1; i++) {
				pathPoints.push(this.getPointByName(path[i]));
			}

			var endPoint = {
				x: endObject.getX(),
				y: endObject.getY(),
				z: endObject.getZ(),
			}
			pathPoints.push(endPoint);

			return pathPoints;
		},

		assignNamesAndPoints: function() {

			var nameIndex = 360;

			for (var x = 0; x < this.grid.length; x ++) {
				for (var y = 0; y < this.grid[x].length; y++) {
					var gridSection = this.grid[x][y];
					if (gridSection.room) {
						var roomNumber = parseInt(gridSection.room.gridName, 36);
						if (roomNumber < 360) {
							gridSection.name = nameIndex.toString(36);
							var points = gridSection.room.generatePoints(gridSection.name);
							this.points = this.points.concat(points);
							nameIndex++;
						}
					}
				}
			};
		},

		connectTwoPoints: function(grid, ourDirection, otherDirection, gridX, gridY) {

			var pointName = grid.room.getPointForDirection(ourDirection);
			if (!pointName) return false;
			var point = this.getPointByName(pointName);

			var otherRoom = this.getRoomInDirection(grid, otherDirection);
			if (otherRoom) {
				var otherPointName = otherRoom.getPointForDirection(otherDirection);
				if (otherPointName) {
					point.siblings.push(otherPointName);
					return true;
				}
			}

			return false;
		},

		getRoomInDirection: function(grid, direction) {

			var sign = (direction == "north" || direction == "west") ? -1 : 1;

			if (direction == "north" || direction == "south") {
				otherGrid = this.get(grid.gridX, grid.gridY + sign);
				if (otherGrid && otherGrid.room) {
					return otherGrid.room;
				}
				return null;
			}

			for (var i = grid.gridX; i < 100; i += sign) {
				var otherGrid = this.get(i, grid.gridY);
				if (otherGrid && otherGrid.room) {
					if (otherGrid.room != grid.room) {
						return otherGrid.room;
					}
				} else {
					return null;
				}
			}

			return null;
		},

		getPointByName: function(name) {

			for (var i = this.points.length - 1; i >= 0; i--) {
				if (this.points[i].name == name) {
					return this.points[i];
				}
			};

			console.log("ERROR: Tried to find point named '" + name + "'' but no such point exists in " + this.points);
			return null;
		},

	});

	SIM.GridManager = GridManager;

	var GridSnapper = my.Class(SIM.Shape, {

		constructor: function(model, _x, _y) {	
			GridSnapper.Super.call(this, model);

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