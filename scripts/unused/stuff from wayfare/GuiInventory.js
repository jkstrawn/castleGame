function GuiInventory(game, x, y, sprite, inv) {
    GuiScreen.call(this, game, x, y, sprite);
	this.inventory = inv;
	this.slotSprite = ASSET_MANAGER.getAsset('img/slot.png');
	this.slotOutline = ASSET_MANAGER.getAsset('img/slotOutline.png');
	this.slotDragged = null;
}

GuiInventory.prototype = new GuiScreen();
GuiInventory.prototype.constructor = GuiInventory;


GuiInventory.prototype.draw = function(ctx) {
	GUI.prototype.draw.call(this, ctx);
    ctx.drawImage(this.sprite, this.x, this.y);
	
	for(var i = 0; i < this.inventory.length; i++) {
		var slot = this.inventory[i];
		ctx.drawImage(this.slotSprite, this.x + slot.x, this.y + slot.y);
		if(slot.hover) {
			ctx.drawImage(this.slotOutline, this.x + slot.x-1, this.y + slot.y-1);
		}
		if(slot.itemStack) {
			slot.draw(this.x, this.y);
			/*
			var x = slot.itemStack.item.spriteCoordX;
			var y = slot.itemStack.item.spriteCoordY;
			ctx.drawImage(this.itemSprite,
						  x, y,										//source from sheet
						  64, 64,									//H&W from the sheet
						  this.x + slot.x+6, this.y + slot.y+6,		//X&Y onto the canvas
						  64, 64);									//H&W onto the canvas
			*/
			//ctx.drawImage(slot.sprite, this.x + slot.x+6, this.y + slot.y+6);
		}
	}
	
	if(this.slotDragged) {
		this.slotDragged.draw(0, 0);
		//ctx.drawImage(this.slotDragged.sprite, this.slotDragged.x, this.slotDragged.y);
	}
}

GuiInventory.prototype.update = function () {
	for(var i = 0; i < this.inventory.length; i++) {
	//for each slot in the inventory
		var slot = this.inventory[i];
		if(this.isMouseInsideGUI(slot.x+this.x, slot.y+this.y, this.slotOutline)) {
		//if the mouse is over this slot at this moment
			slot.hover = true;
			if(this.clicked) {
			//if the mouse is clicked (and therefore clicked on this slot)
				if(this.slotDragged) {
				//and if Im dragging something then let it go onto the slot
					slot.itemStack = this.slotDragged.itemStack;
				}
				else {
				//otherwise make a new item
				
					var x = Math.floor(Math.random()*5);
					var item = this.game.itemList.getItem(x);
					console.log("made new item(" +x+ "): " + item.name);
					//and add it to a new itemStack
					var newItemStack = new ItemStack(item, 1);
					//and add the itemStack to the slot which was clicked
					slot.itemStack = newItemStack;
					//slot.sprite = ASSET_MANAGER.getAsset('img/morningstar.png');
				}
			}
			if(this.mouseDown && slot.itemStack) {
			//if the slot has an item and the mouse is pressed down onto it then set it to the slot
			//that is being dragged and then delete the itemstack from the inv slot
				this.slotDragged = new Slot(slot.x+this.x, slot.y+this.y);
				this.slotDragged.itemStack = slot.itemStack;
				//this.slotDragged.sprite = slot.sprite;
				slot.itemStack = null;
			}
		} else {
			slot.hover = false;
		}
	}
	if(this.mouseUp) {
		this.slotDragged = null;
	}
	this.mouseUp = false;
	this.clicked = false;
	this.mouseDown = false;
}

GuiInventory.prototype.mouseDragged = function(x, y) {
	if(this.slotDragged) {
		this.slotDragged.x -= x;
		this.slotDragged.y -= y;
	}
}