var Shape = function(_sim, _model) {
	this.sim = _sim;
	this.model = _model;
	this.hover = false;

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

var Room = function(sim, model) {
	//Shape(sim, model);
	//console.log(this.__proto__);
	this.__proto__.__proto__.constructor.call(this, sim, model);

	this.light = null;

	this.createLight = function() {

		sim.pointLight.position.set( this.model.position.x, this.model.position.y + 20, this.model.position.z + 10 );
	}

	this.removeLight = function() {

		if (sim.pointLight.position.x == this.model.position.x)
		sim.pointLight.position.set( 0, 100, 0 );
	};

	this.modify = function() {

		this.model.position.z += 10;

		sim.pointLight.position.set( this.model.position.x, this.model.position.y + 20, this.model.position.z + 10 );
	}
}

Room.prototype = new Shape();
Room.prototype.constructor = Room;

var Boundable = function(sim, model, _x, _y) {
	this.__proto__.__proto__.constructor.call(this, sim, model);
	this.x = _x;
	this.y = _y;
}

Boundable.prototype = new Shape();
Boundable.prototype.constructor = Boundable;