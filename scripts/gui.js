function GUI(game, x, y, width, height, sprite) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
	this.sprite = (sprite) ? ASSET_MANAGER.getAsset(sprite) : null;
    this.toRemove = false;
	this.hover = false;
	this.clicked = false;
	this.mouseDown = false;
	this.mouseUp = false;
	this.hidden = false;
	this.z = 0;
	this.buttons = [];
}


GUI.prototype.setXandY = function(x, y) {
	this.x = x;
	this.y = y;
}

GUI.prototype.draw = function(ctx) {
	if(!this.hidden) {	
		if(this.sprite) {
			ctx.drawImage(this.sprite, this.x, this.y);
		} else {
			ctx.strokeStyle = '#222222'
			var lingrad = ctx.createLinearGradient(this.x, this.y, this.x, this.y+this.height);
			lingrad.addColorStop(0, 'rgba(230,230,250,1)');
			lingrad.addColorStop(1, 'rgba(200,200,230,1)');
			ctx.fillStyle = lingrad;
			ctx.lineWidth = 3;
			ctx.fillRect(this.x, this.y, this.width, this.height);

			ctx.translate(0.5, 0.5);
			ctx.strokeRect(this.x, this.y, this.width, this.height);
			ctx.translate(-0.5, -0.5);
		}
	}
}

GUI.prototype.isMouseInsideGUI = function(x, y) {
	if(x >= this.x && x <= (this.x + this.width) && y >= this.y && y <= (this.y + this.height)) {
		return true;
	}
	return false;
}

GUI.prototype.update = function () {
	this.mouseDown = false;
	this.clicked = false;
	this.mouseUp = false;
}

GUI.prototype.setHidden = function(hidden) {
	this.hidden = hidden;
	for(var i = 0; i < this.buttons.length; i++) {
		this.buttons[i].hidden = hidden;
	}
}

GUI.prototype.createLabel = function(id, labelText, x, y) {
}

GUI.prototype.mouseDragged = function (x, y) {
}

GUI.prototype.remove = function() {
}

//*****************************************************************************************************************************************************************
function GuiTop(game, x, y, width, height, sprite) {
    GUI.call(this, game, x, y, width, height, sprite);
    this.icons = [];

    var _x = 7;

	this.icons[0] = new Icon(this, _x, 7, 'food', game.resources.food);
	this.icons[1] = new Icon(this, _x, 44, 'timber', game.resources.timber);
	this.icons[2] = new Icon(this, _x, 81, 'gold', game.resources.gold);

	_x+= 95;
	this.icons[3] = new Icon(this, _x, 7, 'peasants', game.resources.peasants);
	this.icons[4] = new Icon(this, _x, 44, 'servants', game.resources.servants);
	_x+= 75;
	this.icons[5] = new Icon(this, _x, 7, 'nobles', game.resources.nobles);
	this.icons[6] = new Icon(this, _x, 44, 'militia', game.resources.militia);
	_x+= 95;
	this.icons[7] = new Icon(this, _x, 7, 'happiness');
	this.icons[8] = new Icon(this, _x, 44, 'morale');
	this.icons[9] = new Icon(this, _x, 81, 'hygiene');
	_x+= 150;
	this.icons[10] = new Icon(this, _x, 7, 'fear');
	this.icons[11] = new Icon(this, _x, 44, 'reputation');
	this.icons[12] = new Icon(this, _x, 81, 'luxury');
}

GuiTop.prototype = new GUI();
GuiTop.prototype.constructor = GuiTop;

GuiTop.prototype.draw = function(ctx) {
	GUI.prototype.draw.call(this, ctx);

	for(var i = 0; i < this.icons.length; i++) {
		this.icons[i].draw(ctx);
	}
}

function Icon(gui, x, y, sprite, value) {
	this.gui = gui;
	this.x = x;
	this.y = y;
	this.sprite = ASSET_MANAGER.getAsset('img/icon_'+sprite+'.png');
	this.resource = value;
}

Icon.prototype.draw = function(ctx) {
	ctx.drawImage(ASSET_MANAGER.getAsset('img/icon_frame.png'), this.gui.x+this.x-2, this.gui.y+this.y-2);
	ctx.drawImage(this.sprite, this.gui.x+this.x, this.gui.y+this.y);
	ctx.font = "18px 'Fantasy'";
	ctx.fillStyle = "#000000";
	if(typeof this.resource !== 'undefined')
		ctx.fillText(this.resource.value, this.gui.x+this.x+40, this.gui.y+this.y+20);
}

//*****************************************************************************************************************************************************************
function GuiSide(game, x, y, width, height, sprite) {
	GUI.call(this, game, x, y, width, height, sprite);

	this.panes = [];
	this.currentPane = 0;

	var _h = 33;
	this.buttons.push(game.addGUI(new ButtonPane(game, this.x+10, this.y+10, 'living', this, 0)));
	this.buttons.push(game.addGUI(new ButtonPane(game, this.x+10+_h*1, this.y+10, 'cooking', this, 1)));
	this.buttons.push(game.addGUI(new ButtonPane(game, this.x+10+_h*2, this.y+10, 'military', this, 2)));
	this.buttons.push(game.addGUI(new ButtonPane(game, this.x+10+_h*3, this.y+10, 'advanced', this, 3)));
	this.buttons.push(game.addGUI(new ButtonPane(game, this.x+10+_h*4, this.y+10, 'misc', this, 4)));


	var paneWidth = 166;
	var paneHeight = 102;
	this.panes.push(game.addGUI(new PaneLiving(game, this.x+10, this.y+50, paneWidth, paneHeight)));
	this.panes.push(game.addGUI(new PaneCooking(game, this.x+10, this.y+50, paneWidth, paneHeight)));
	this.panes.push(game.addGUI(new PaneMilitary(game, this.x+10, this.y+50, paneWidth, paneHeight)));
	this.panes.push(game.addGUI(new PaneAdvanced(game, this.x+10, this.y+50, paneWidth, paneHeight)));
	this.panes.push(game.addGUI(new PaneMisc(game, this.x+10, this.y+50, paneWidth, paneHeight)));
	for(var i = 1; i < 5; i++) {
		this.panes[i].setHidden(true);
	}
	this.buttons[0].select = true;
}

GuiSide.prototype = new GUI();
GuiSide.prototype.constructor = GuiSide;

GuiSide.prototype.draw = function(ctx) {
	GUI.prototype.draw.call(this, ctx);
}

GuiSide.prototype.setPane = function(id) {
	console.log("set new pane: " + id);
	this.buttons[this.currentPane].select = false;
	this.buttons[id].select = true;
	this.panes[this.currentPane].setHidden(true);
	this.panes[id].setHidden(false);
	this.currentPane = id;
}
//*****************************************************************************************************************************************************************
function GuiRoom(game, parent, type) {
	this.type = type;
    GUI.call(this, game, 0, 0, 32, 32, 'img/room_'+type+'.png');
    this.parent = parent;
}

GuiRoom.prototype = new GUI();
GuiRoom.prototype.constructor = GuiRoom;

GuiRoom.prototype.draw = function(ctx) {
	var _tile = game.getTileAtMouse();
	if(_tile) {
		ctx.drawImage(this.sprite, _tile.x, _tile.y);
	}
}

GuiRoom.prototype.update = function() {
	if(this.game.click) {
		var _tile = this.game.getTileAtMouse();
		if(_tile) {
			this.game.map.addRoom(_tile, this.type);
			this.parent.setSelected(false);
		}
	}
	if(this.game.rClick) {
		this.parent.setSelected(false)
	}
	GUI.prototype.update.call(this);
}

//*****************************************************************************************************************************************************************
function Button(game, x, y, type, parent, id) {
    GUI.call(this, game, x, y, 32, 32, 'img/button_' + type + '.png');
    this.type = type;
	this.id = id;
	this.z = 2;
	this.parent = parent;
	this.hoverLabel = null;

	this.toDraw = true;
	//this.spriteHover = ASSET_MANAGER.getAsset('img/button_' + this.type + 'Hover.png');
}

Button.prototype = new GUI();
Button.prototype.constructor = Button;

Button.prototype.update = function() {
	if(this.clicked && !this.hidden) {
		console.log("clicked!");
	}

	GUI.prototype.update.call(this);
}

Button.prototype.draw = function(ctx) {
	GUI.prototype.draw.call(this, ctx);
	if(!this.hidden) {
		if(this.hover)
			ctx.strokeStyle = '#AAAAAA';
		else
			ctx.strokeStyle = '#222222';
		ctx.lineWidth = 1;
		ctx.translate(0.5, 0.5);
		ctx.strokeRect(this.x, this.y, 31, 31);
		ctx.translate(-0.5, -0.5);

	}
}
//*****************************************************************************************************************************************************************
function ButtonPane(game, x, y, type, parent, id) {
	Button.call(this, game, x, y, type, parent, id);
	this.select = false;
}

ButtonPane.prototype = new Button();
ButtonPane.prototype.constructor = ButtonPane;

ButtonPane.prototype.update = function() {
	if(this.clicked && !this.hidden) {
		this.parent.setPane(this.id);
	}
	Button.prototype.update.call(this);
}

ButtonPane.prototype.draw = function(ctx) {
	if(!this.hidden) {
		if(this.select)
			ctx.drawImage(ASSET_MANAGER.getAsset('img/button_'+this.type+'_select.png'), this.x, this.y);
		else
			ctx.drawImage(ASSET_MANAGER.getAsset('img/button_'+this.type+'.png'), this.x, this.y);

		if(this.hover)
			ctx.strokeStyle = '#AAAAAA';
		else
			ctx.strokeStyle = '#222222';
		ctx.lineWidth = 1;
		ctx.translate(0.5, 0.5);
		ctx.strokeRect(this.x, this.y, 31, 31);
		ctx.translate(-0.5, -0.5);
	}
}

//*****************************************************************************************************************************************************************
function ButtonRoom(game, x, y, type, parent) {
	Button.call(this, game, x, y, 'room', parent);

	this.type = type;
	this.dragging = false;
	this.guiToDrag = null;
	this.guiSet = false;
	this.select = false;
}
ButtonRoom.prototype = new Button();
ButtonRoom.prototype.constructor = ButtonRoom;

ButtonRoom.prototype.update = function() {
	if(!this.hidden && this.hover && this.clicked) {
	//if the mouse is over this button at this moment
		console.log("clicked to build a building");
		this.parent.deselectButtons();
		this.select = true;
		this.guiToDrag = new GuiRoom(this.game, this, this.type);
		this.game.addGUI(this.guiToDrag);
		//this.guiToDrag = this.game.mouseGui = this.game.addGUI(new GuiRoom(this.game, this.x, this.y, this));
	}
	Button.prototype.update.call(this);
}

ButtonRoom.prototype.draw = function(ctxBG, ctxFG) {
	if(!this.hidden) {	
		ctx.drawImage(this.sprite, this.x, this.y);
		ctx.fillStyle = 'black';
		ctx.fillText(this.type.charAt(0), this.x+10, this.y+20);
	}
}

ButtonRoom.prototype.setSelected = function(selected) {
	this.select = selected;
	if(this.guiToDrag) {
		this.guiToDrag.toRemove = true;
		this.guiToDrag = null;
	}
}

//**********************************************************************************************************************************************

function Pane(game, x, y, width, height) {
	GUI.call(this, game, x, y, width, height);

	this.z = 1;
	this.init();
}

Pane.prototype = new GUI();
Pane.prototype.constructor = Pane;

Pane.prototype.init = function() {
}

Pane.prototype.draw = function(ctx) {
	if(!this.hidden) {
		ctx.strokeStyle = '#222222'
		ctx.fillStyle = "#DDDDDD";
		ctx.lineWidth = 2;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.strokeRect(this.x, this.y, this.width, this.height);
		for(var i = 0; i < 15; i++) {
			var _x = i%5;
			var _y = Math.floor(i/5);
			if(this.buttons[i] && (this.buttons[i].hover || this.buttons[i].select))
				ctx.drawImage(ASSET_MANAGER.getAsset('img/button_frame_hover.png'), this.x+3+_x*32, this.y+3+_y*32);
			else
				ctx.drawImage(ASSET_MANAGER.getAsset('img/button_frame.png'), this.x+3+_x*32, this.y+3+_y*32);
		}		
	}
}

Pane.prototype.addButton = function(type) {
	var _x = this.buttons.length%5;
	var _y = Math.floor(this.buttons.length/5);
	this.buttons.push(game.addGUI(new ButtonRoom(game, this.x+3+_x*32, this.y+3+_y*32, type, this)));
}

Pane.prototype.deselectButtons = function() {
	for(var i = 0; i < this.buttons.length; i++) {
		this.buttons[i].setSelected(false);
	}
}

//****
function PaneMisc(game, x, y, width, height) {
	Pane.call(this, game, x, y, width, height);
}

PaneMisc.prototype = new Pane();
PaneMisc.prototype.constructor = PaneMisc;

PaneMisc.prototype.init = function() {
	this.addButton('chapel');
	this.addButton('washroom');
	this.addButton('lavatory');
	this.addButton('dungeon');
	this.addButton('cellar');
	this.addButton('storeroom');
}

function PaneAdvanced(game, x, y, width, height) {
	Pane.call(this, game, x, y, width, height);
}

PaneAdvanced.prototype = new Pane();
PaneAdvanced.prototype.constructor = PaneAdvanced;

PaneAdvanced.prototype.init = function() {
	this.addButton('throne');
	this.addButton('library');
	this.addButton('theater');
	this.addButton('minstrel');
	this.addButton('tailor');
	this.addButton('alchemy');
	this.addButton('brothel');
}

function PaneMilitary(game, x, y, width, height) {
	Pane.call(this, game, x, y, width, height);
}

PaneMilitary.prototype = new Pane();
PaneMilitary.prototype.constructor = PaneMilitary;

PaneMilitary.prototype.init = function() {
	this.addButton('barracks');
	this.addButton('armory');
}

function PaneLiving(game, x, y, width, height) {
	Pane.call(this, game, x, y, width, height);
}

PaneLiving.prototype = new Pane();
PaneLiving.prototype.constructor = PaneLiving;

PaneLiving.prototype.init = function() {
	this.addButton('bedroom');
	this.addButton('wardrobe');
	this.addButton('parlor');
	this.addButton('stewards');
	this.addButton('study');
	this.addButton('servants');
	this.addButton('lords');
}

function PaneCooking(game, x, y, width, height) {
	Pane.call(this, game, x, y, width, height);
}

PaneCooking.prototype = new Pane();
PaneCooking.prototype.constructor = PaneCooking;

PaneCooking.prototype.init = function() {
	this.addButton('kitchen');
	this.addButton('buttery');
	this.addButton('pantry');
}
//*****************************************************************************************************************************************************************

//*****************************************************************************************************************************************************************

//*****************************************************************************************************************************************************************

//*****************************************************************************************************************************************************************

//*****************************************************************************************************************************************************************