var CastleSim = function() {
	this.shapes = [];
	this.pointLight = null;

	this.clock = new THREE.Clock();
	this.stats = null;
	this.graphics = new GraphicsEngine(this);

	this.onStartAnimation = function() {
		console.log("start");
	}

	this.init = function() {

		// listen for messages from the gui
		window.addEventListener( 'start-animation', this.onStartAnimation );

		this.graphics.init();

		gui = new BlendCharacterGui();
	}

	this.addRoom = function(model) {

		var shape = new Room(this);
		shape.model = model;

		this.shapes.push(shape);
	};

	this.addShape = function(model) {

		var shape = new Shape(this);
		shape.model = model;
		this.shapes.push(shape);
	}

	this.mouseMove = function(event) {

		event.preventDefault();
		this.graphics.setMouse(event);

		var hoveredShape = this.graphics.getHoveredShape(this.getShapes());

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			var shape = this.shapes[i];

			if (shape.model == hoveredShape) {
				shape.setHover(true);
			}
			else {
				shape.setHover(false);
			}
		};

	}

	this.click = function( event ) {

		event.preventDefault();

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			if (this.shapes[i].hover) {
				this.shapes[i].modify();
			}
		};
	}

	this.render = function() {

		var delta = this.clock.getDelta();

		this.graphics.render();
	}

	this.update = function() {

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			this.shapes[i].update();
		};
	}

	this.onWindowResize = function() {

		this.graphics.resize();
	}

	this.getShapes = function() {

		var shapes = [];

		for (var i = this.shapes.length - 1; i >= 0; i--) {
			shapes.push(this.shapes[i].model);
		};

		return shapes;
	};

	this.keypress = function (event) {
		var character = String.fromCharCode(event.keyCode)

		switch (character) {
			case "w":
				this.graphics.moveCamera("up")
				break
			case "a":
				this.graphics.moveCamera("left")
				break
			case "s":
				this.graphics.moveCamera("down")
				break
			case "d":
				this.graphics.moveCamera("right")
				break
		}
	}

	this.zoom = function(dt) {
		this.graphics.zoom(dt);
	}
}

var stats;
var sim = new CastleSim();

sim.init();
animate();

window.addEventListener( 'resize', onWindowResize, false );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
window.addEventListener("mousewheel", onWindowMouseWheel, false);
window.addEventListener("DOMMouseScroll", onWindowMouseWheel, false);
window.addEventListener("keypress", onWindowKeyPress, false)

function onDocumentMouseDown(event) {
	sim.click(event);
}

function onDocumentMouseMove(event) {
	sim.mouseMove(event);
}

function onWindowResize() {
	sim.onWindowResize();
}

function animate() {		
	requestAnimationFrame( animate );

	sim.update();
	sim.render();
	stats.update();
}

function onWindowMouseWheel(event) {
	var event = window.event || event; // old IE support
	var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
	//console.log(delta)
	sim.zoom(delta);
}

function onWindowKeyPress(event) {
	sim.keypress(event)
}


