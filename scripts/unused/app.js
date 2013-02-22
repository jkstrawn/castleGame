window.requestAnimFrame = (function() {
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
})();

var canvasFG = document.getElementById('surface');
var canvasBG = document.getElementById('background');
var ctxFG = canvasFG.getContext('2d');
var ctxBG = canvasBG.getContext('2d');
var game = new Colonies();

var ASSET_MANAGER = new AssetManager();

//Entities
ASSET_MANAGER.queueDownload('img/ant_black.png');
ASSET_MANAGER.queueDownload('img/ant_black_princess.png');
ASSET_MANAGER.queueDownload('img/ant_black_queen.png');
ASSET_MANAGER.queueDownload('img/ant_black_soldier.png');
ASSET_MANAGER.queueDownload('img/ant_green.png');
ASSET_MANAGER.queueDownload('img/ant_green_princess.png');
ASSET_MANAGER.queueDownload('img/ant_green_queen.png');
ASSET_MANAGER.queueDownload('img/ant_green_soldier.png');
ASSET_MANAGER.queueDownload('img/ant_red.png');
ASSET_MANAGER.queueDownload('img/ant_red_princess.png');
ASSET_MANAGER.queueDownload('img/ant_red_queen.png');
ASSET_MANAGER.queueDownload('img/ant_red_soldier.png');
ASSET_MANAGER.queueDownload('img/ant_egg.png');
ASSET_MANAGER.queueDownload('img/dirt.png');
ASSET_MANAGER.queueDownload('img/dirt_wall.png');
ASSET_MANAGER.queueDownload('img/dirt_walls.png');
ASSET_MANAGER.queueDownload('img/dirt_solid.png');
ASSET_MANAGER.queueDownload('img/grass.png');
ASSET_MANAGER.queueDownload('img/rock.png');
ASSET_MANAGER.queueDownload('img/ant_black_walk.png');
ASSET_MANAGER.queueDownload('img/ant_green_walk.png');
ASSET_MANAGER.queueDownload('img/food_1.png');
ASSET_MANAGER.queueDownload('img/food_2.png');
ASSET_MANAGER.queueDownload('img/food_3.png');
ASSET_MANAGER.queueDownload('img/food_4.png');
ASSET_MANAGER.queueDownload('img/gui_main.png');
ASSET_MANAGER.queueDownload('img/colony_entrance.png');
ASSET_MANAGER.queueDownload('img/ant_black_big.png');
ASSET_MANAGER.queueDownload('img/ant_black_big_walk.png');
ASSET_MANAGER.queueDownload('img/button_nursery.png');
ASSET_MANAGER.queueDownload('img/smoke_tan.png');

$(document).ready( function() {
	$("#surface").rightClick( function(e) {
		var x = e.pageX - canvasFG.offsetLeft;
		var y = e.pageY - canvasFG.offsetTop;
		game.rightClick(x, y);
    });
});

ASSET_MANAGER.downloadAll(function() {
    game.init(ctxBG, ctxFG);
    game.start();
});