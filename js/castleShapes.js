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

var Servant = function(sim, model) {
	this.__proto__.__proto__.constructor.call(this, sim, model);
}

Servant.prototype = new Shape();
Servant.prototype.constructor = Servant;