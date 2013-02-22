function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.lastTime = 0;
}

Timer.prototype.tick = function() {
    var currentTime = Date.now();
    var deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    var gameDelta = Math.min(deltaTime, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}