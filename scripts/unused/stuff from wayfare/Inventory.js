function Slot(x, y) {
	this.x = x;
	this.y = y;
	this.hover = false;
	this.itemStack = null;
	this.itemSprite = ASSET_MANAGER.getAsset('img/iconsBig.png');
}

Slot.prototype.draw = function(invX, invY) {
	var x = this.itemStack.item.spriteCoordX;
	var y = this.itemStack.item.spriteCoordY;
	ctx.drawImage(this.itemSprite,
				  x, y,										//source from sheet
				  64, 64,									//H&W from the sheet
				  invX + this.x+6, invY + this.y+6,			//X&Y onto the canvas
				  64, 64);									//H&W onto the canvas
}

function Item(name, x, y, size) {
	this.name = name;
	this.spriteCoordX = x;
	this.spriteCoordY = y;
	this.stackSize = size;
}

function ItemStack(item, count) {
	this.item = item;
	this.count = count;
}

function ItemList() {
	this.list = [];
}

ItemList.prototype.addItem = function(name, x, y, size) {
	var newItem = new Item(name, x, y, size);
	this.list.push(newItem);
}

ItemList.prototype.getItem = function(id) {
/*
	for(var i = 0; i < this.list.length; i++) {
		if(this.list[i].name == id) {
			return this.list[i];
		}
	}
	return 0;
*/
	if(this.list[id]) {
		return this.list[id];
	} else {
		return 0;
	}
}

function Inventory(game) {
    this.game = game;
	this.mainInventory = [];
	this.invLength = 16;
	this.width = 4;
	this.init();
}

Inventory.prototype.init = function() {
	for(var x = 0; x < this.width; x++)
	for(var y = 0; y < this.invLength/this.width; y++) {
		this.mainInventory.push(new Slot(35+x*78, 35+y*76));
	}
}

Inventory.prototype.addItem = function(item) {
	var slotNum = this.getFirstEmptySlot();
	if(slotNum >= 0) {
		this.mainInventory[slotNum].item = item;
	}
}

Inventory.prototype.getFirstEmptySlot = function() {
    for(var i = 0; i < this.invLength; i++) {
		if(!this.mainInventory[i].item) {
			return i;
		}
	}
	return -1;
}