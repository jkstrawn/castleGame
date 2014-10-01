/**
 * @author Michael Guerrero / http://realitymeltdown.com
 */

function BlendCharacterGui(animations) {
	var that = this;

	this.gui = new dat.GUI();
	this.controls = {
		Servants: 0, 
		"Create Bedroom": function() {
			window.dispatchEvent( new CustomEvent( 'create-room', {detail: {room: "hall"}} ) );
		},
		"Hire Servant": function() {
			window.dispatchEvent( new CustomEvent( 'hire-servant'));
		},
		folderRooms: null,
		folderResources: null
	};

	this.init = function() {

		this.controls.folderRooms = this.gui.addFolder( "Rooms" );
		this.controls.folderRooms.add( this.controls, "Create Bedroom" );
		this.controls.folderRooms.open();

		this.controls.folderResources = this.gui.addFolder( "Resources" );
		this.controls.folderResources.add( this.controls, "Servants" );
		this.controls.folderResources.add( this.controls, "Hire Servant" );
		this.controls.folderResources.open();

	};

	this.setValue = function(name, value) {
		this.controls[name] = value;

		for (var i in this.controls.folderResources.__controllers) {
			this.controls.folderResources.__controllers[i].updateDisplay();
		}
	};

	this.init();
/*

	var controls = {

		gui: null,
		"Servants": 1,
		"Peasants": 2

	};

	this.settings2 = null;

	this.update = function() {

	};

	var init = function() {

		controls.gui = new dat.GUI();

		var settings1 = controls.gui.addFolder( 'Rooms' );
		settings1.add( controls, "Create Bedroom" );
		settings1.open();

		this.settings2 = controls.gui.addFolder( 'Resources' );
		this.settings2.add( controls, "Servants" );
		this.settings2.open();

		/*
		var playback = controls.gui.addFolder( 'Playback' );
		var blending = controls.gui.addFolder( 'Blend Tuning' );

		settings.add( controls, "Lock Camera" ).onChange( controls.lockCameraChanged );
		settings.add( controls, "Show Model" ).onChange( controls.createHall );
		settings.add( controls, "Show Skeleton" ).onChange( controls.showSkeletonChanged );
		settings.add( controls, "Time Scale", 0, 1, 0.01 );
		settings.add( controls, "Step Size", 0.01, 0.1, 0.01 );
		settings.add( controls, "Crossfade Time", 0.1, 6.0, 0.05 );

		// These controls execute functions
		playback.add( controls, "start" );
		playback.add( controls, "pause" );
		playback.add( controls, "step" );
		playback.add( controls, "idle to walk" );
		playback.add( controls, "walk to run" );
		playback.add( controls, "warp walk to run" );

		blending.add( controls, "idle", 0, 1, 0.01).listen().onChange( controls.weight );
		blending.add( controls, "walk", 0, 1, 0.01).listen().onChange( controls.weight );
		blending.add( controls, "run", 0, 1, 0.01).listen().onChange( controls.weight );
		*/
/*
	}

	this.setValue = function(name, value) {
		controls["Servants"] = 4;
		
		for (var i in controls.gui.__controllers) {
			controls.gui.__controllers[i].updateDisplay();
		}

		console.log(controls["Peasants"]);
	}

	this.dol = function() {

		//this.settings2.add( controls, "Peasants" );
		this.setValue();
	}

	controls['Create Bedroom'] = function() {

		window.dispatchEvent( new CustomEvent( 'create-room', {detail: {room: "hall"}} ) );
	};

	controls.createRoom = function() {

		window.dispatchEvent( new CustomEvent( 'create-room', {details: {room: "hall"}} ) );
	}


	init.call(this);
	*/

}