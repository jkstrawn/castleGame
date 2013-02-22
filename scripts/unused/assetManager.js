function AssetManager() {
    //console.log("test2");
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = {};
    this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function(path) {
    this.downloadQueue.push(path);
}

AssetManager.prototype.downloadAll = function(callback) {
    if (this.downloadQueue.length === 0) {
        callback();
    }
    
    for (var i = 0; i < this.downloadQueue.length; i++) {
        var path = this.downloadQueue[i];
        var img = new Image();
        var that = this;
        img.addEventListener("load", function() {
            console.log(this.src + ' is loaded');
            that.successCount += 1;
            if (that.isDone()) {
                callback();
            }
        }, false);
        img.addEventListener("error", function() {
            that.errorCount += 1;
            if (that.isDone()) {
                callback();
            }
        }, false);
        img.src = path;
        this.cache[path] = img;
    }
}

AssetManager.prototype.getAsset = function(path) {
    return this.cache[path];
}

AssetManager.prototype.isDone = function() {
    return (this.downloadQueue.length == this.successCount + this.errorCount);
}
/*
AssetManager.prototype.getAssetPortion = function(path, newWidth, newHeight, startX, startY) {
	var imgObj = this.cache[path];
	//set up canvas for thumbnail
	var tnCanvas = document.createElement('canvas');
	var tnCanvasContext = canvas.getContext('2d');
			 
	tnCanvas.width = newWidth;
	tnCanvas.height = newHeight;

	//create buffer canvas
	var bufferCanvas = document.createElement('canvas');
	var bufferContext = bufferCanvas.getContext('2d');
	 
	bufferCanvas.width = imgObj.width;
	bufferCanvas.height = imgObj.height;
	bufferContext.drawImage(imgObj, 0, 0);
			 
	tnCanvasContext.drawImage(bufferCanvas, startX,startY,newWidth, newHeight,0,0,newWidth,newHeight);
	return tnCanvas.toDataURL();   
}
*/