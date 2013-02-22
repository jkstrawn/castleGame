function GuiScreenOptions(game, x, y, sprite) {
    GUI.call(this, game, x, y, sprite);
	this.game = game;
	this.buttons.push(game.addGUI(new Button(game, x+300, y+350, 'Close', this, 1)));


	for(var i = 0; i < 4; i++) {
		var labelText = '';
		if(i == 0) {
			labelText = "Up";
		} else if(i == 1) {
			labelText = "Right";
		} else if(i == 2) {
			labelText = "Down";
		} else if(i == 3) {
			labelText = "Left";
		}
		var newInputDiv = 
			"<div class='texts' id='text"+i+"' style='position:absolute; z-index:30;'>" +
			"<input type='text' id='input"+i+"' style='width:20px; height:20px;'>" +
			"</div>";
		$("#canvasContainer").append(newInputDiv);
		var newLabelDiv = 
			"<div class='texts' id='label"+i+"' style='position:absolute; z-index:30;'>" +
			"<p>"+labelText+"</p>" +
			"</div>";
		$("#canvasContainer").append(newLabelDiv);

		var canvas = document.getElementById('surface');
		var label = document.getElementById('label'+i);
		var div = document.getElementById('text'+i);
		var text = document.getElementById('input'+i);
		var that = this;
		text.addEventListener("keydown", function(e) {
		//when a key is pressed then clear the box
			this.value = '';
		}, false);
		text.addEventListener("keyup", function(e) {
		//and when its let up then register it and save it to the hotkeys
			that.getKey(this.id, e.keyCode);
		}, false);
		div.style.left = (this.x+canvas.offsetLeft+100)+"px";
		div.style.top =  (this.y+canvas.offsetTop+ 100+i*40)+"px";
		label.style.left = (this.x+canvas.offsetLeft+50)+"px";
		label.style.top =  (this.y+canvas.offsetTop+ 100+i*40)+"px";
		this.divs.push(div);
		this.divs.push(label);
		this.texts.push(text);
	}
}

GuiScreenOptions.prototype = new GuiScreen();
GuiScreenOptions.prototype.constructor = GuiScreenOptions;

GuiScreenOptions.prototype.draw = function(ctx) {
	GuiScreen.prototype.draw.call(this, ctx);
}

GuiScreenOptions.prototype.remove = function() {
	for(var i = 0; i < this.buttons.length; i++) {
		this.game.removeGUI(this.buttons[i]);
	}
	for(var i = 0; i < this.divs.length; i++) {
		document.getElementById('canvasContainer').removeChild(this.divs[i]);
	}
}

GuiScreenOptions.prototype.getKey = function(id, key) {
	console.log("got " + key + " from " + id.substring(5));
	game.setHotkey(id.substring(5), key);
}

GuiScreenOptions.prototype.update = function () {
	for(var i = 0; i < this.buttons.length; i++) {
		var _button = this.buttons[i];
		if(_button.clicked) {
			if(_button.id == 1) {
			//if its the close button
				this.toRemove = true;
			}
		}
	}
}