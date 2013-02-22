function Animation(spriteSheet, frameWidth, frameHeight, frameDuration, offsetX, offsetY, loop, length) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameHeight= frameHeight;
    this.frameDuration = frameDuration;
	this.offsetX = offsetX || 0;
	this.offsetY = offsetY || 0;
    this.loop = loop || 0;
	this.length = length;
	if(this.length) {
		this.totalTime = this.length * this.frameDuration;
	} else {
		this.totalTime = ((this.spriteSheet.width-this.offsetX) / this.frameWidth) * this.frameDuration;
	}
    this.elapsedTime = 0;
}

Animation.prototype.drawFrame = function(tick, ctx, x, y, center) {
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.currentFrame();
    var locX = (center) ? x - (this.frameWidth/2) : x;
    var locY = (center) ? y - (this.frameHeight/2) : y;
    ctx.drawImage(this.spriteSheet,
                  index*this.frameWidth+this.offsetX, this.offsetY*this.frameHeight,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth, this.frameHeight);
}

Animation.prototype.currentFrame = function() {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function() {
    return (this.elapsedTime >= this.totalTime);
}