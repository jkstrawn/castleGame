var GridManager = function(_sim) {
	this.sim = _sim;
	this.grid = [];
	this.gridWidth = 30;
	this.gridLength = 30;

	this.init = function() {

		var startPoint = -110;
		var numOfGridSide = 7;
		var numOfGridUp = 4;

		for (var x = 0; x < numOfGridSide; x++) {
			this.grid[x] = [];

			for (var y = 0; y < numOfGridUp; y++) {
				this.grid[x][y] = {
					x: x * this.gridLength + startPoint, 
					y: y * this.gridWidth, 
					z: 0,
					used: false
				};
			}
		};

		this.grid[2][0].used = true;
		this.grid[3][0].used = true;
		this.grid[4][0].used = true;
	}

	this.get = function(x, y) {

		return this.grid[x][y];
	}

	this.show = function() {
		var gridSpots = [];

		for (var x = this.grid.length - 1; x >= 0; x--) {
			for (var y = 0; y < this.grid[x].length; y++) {
				var box = this.grid[x][y];

				if (!box.used) {
					this.generateSpot(box, x, y);
					this.sim.graphics.addRoomSpotParticles(new THREE.Vector3(box.x, box.y, 0), this.gridLength, this.gridWidth);
					break;
				}
			}
		};
	}

	this.generateSpot = function(box, x, y) {

		var boundingBox = new THREE.Mesh(
			new THREE.BoxGeometry(this.gridLength, this.gridWidth, this.gridWidth), 
			new THREE.MeshBasicMaterial( { color: 0x44cc00, wireframe: true, transparent: true, opacity: 0.3 } )
		);
		boundingBox.position.set(box.x + 15, box.y + 15, box.z + 15);
		
		var gridSection = new GridSection(this, boundingBox, x, y);
		this.sim.shapes.push(gridSection);
		this.sim.graphics.addBoundingBox(boundingBox);
	}
}

var GridSection = function(sim, model, _x, _y) {
	this.__proto__.__proto__.constructor.call(this, sim, model);
	this.x = _x;
	this.y = _y;
}

GridSection.prototype = new Shape();
GridSection.prototype.constructor = GridSection;