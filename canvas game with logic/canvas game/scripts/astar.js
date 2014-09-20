function AStar(map, start, goal, big) {
	this.map = map;
	this.start = start;
	this.goal = goal;
	this.big = big;
	this.cols =	this.map[0].length;
	this.rows =	this.map.length;
	this.limit = this.cols * this.rows;

	return this.Path();
}

AStar.prototype.IsAvailable = function(map, x, y){
	return (map[x][y].item == null || map[x][y].item.solid == false) && !map[x][y].solid;
}

AStar.prototype.IsAvailableBig = function(map, x, y){
	for(var _x = x; _x <= x+1; _x++)
	for(var _y = y; _y <= y+1; _y++) {
		if(_x < 0 || _x >= map[0].length || _y < 0 || _y >= map.length)
			return false;
		var _tile = map[_x][_y];
		var bool = (!_tile.item || !_tile.item.solid) && !_tile.solid;
		if(!bool) return false;
	}
	return true;
}

AStar.prototype.Node = function(Parent, Point){
	return {
		Parent:Parent,
		value:Point.x + (Point.y * this.cols),
		x:Point.x,
		y:Point.y,
		f:0,
		g:0
	};
}

AStar.prototype.Path = function() {
	var	_start = this.Node(null, {x:this.start.xIndex, y:this.start.yIndex});
	var _goal = this.Node(null, {x:this.goal.xIndex, y:this.goal.yIndex});
	var AStar = new Array(this.limit);
	var Open = [_start], Closed = [], result = [];
	var _successors, _node, _path;
	var length, max, min, i, j;
	while(length = Open.length) {
		max = this.limit;
		min = -1;
		for(i = 0; i < length; i++) {
			if(Open[i].f < max) {
				max = Open[i].f;
				min = i;
			}
		};
		_node = Open.splice(min, 1)[0];
		if(_node.value === _goal.value) {
			_path = Closed[Closed.push(_node) - 1];
			do {
				result.push([_path.x, _path.y]);
			}while(_path = _path.Parent);
			AStar = Closed = Open = [];
			result.reverse();
		} else {
			if(this.big)
				_successors = this.Successors(_node.x, _node.y, this.IsAvailableBig);
			else
				_successors = this.Successors(_node.x, _node.y, this.IsAvailable);
			for(i = 0, j = _successors.length; i < j; i++){
				_path = this.Node(_node, _successors[i]);
				if(!AStar[_path.value]){
					_path.g = _node.g + this.Diagonal(_successors[i], _node);
					_path.f = _path.g + this.Diagonal(_successors[i], _goal);
					Open.push(_path);
					AStar[_path.value] = true;
				};
			};
			Closed.push(_node);
		};
	};
	return result;
}

AStar.prototype.Successors = function(x, y, isAvail){
	var	N = y - 1,
		S = y + 1,
		E = x + 1,
		W = x - 1,
		_N = N > -1 && isAvail(this.map, x, N),
		_S = S < this.rows && isAvail(this.map, x, S),
		_E = E < this.cols && isAvail(this.map, E, y),
		_W = W > -1 && isAvail(this.map, W, y),
		result = [];
	if(_N)
		result.push({x:x, y:N});
	if(_E)
		result.push({x:E, y:y});
	if(_S)
		result.push({x:x, y:S});
	if(_W)
		result.push({x:W, y:y});
	this.DiagonalSuccessors(_N, _S, _E, _W, N, S, E, W, result, isAvail);
	return result;
}

AStar.prototype.DiagonalSuccessors = function(_N, _S, _E, _W, N, S, E, W, result, isAvail){
	if(_N) {
		if(_E && isAvail(this.map, E, N))
			result.push({x:E, y:N});
		if(_W && isAvail(this.map, W, N))
			result.push({x:W, y:N});
	};
	if(_S){
		if(_E && isAvail(this.map, E, S))
			result.push({x:E, y:S});
		if(_W && isAvail(this.map, W, S))
			result.push({x:W, y:S});
	};
}

AStar.prototype.Diagonal = function(Point, Goal) {
		return Math.max(Math.abs(Point.x - Goal.x), Math.abs(Point.y - Goal.y));
}

/*
function DiagonalSuccessorsTwo(_N, _S, _E, _W, N, S, E, W, result){
	_N = N > -1;
	_S = S < this.rows;
	_E = E < this.cols;
	_W = W > -1;
	if(_E) {
		if(_N && this.IsAvailable(E, N))
			result.push({x:E, y:N});
		if(_S && this.IsAvailable(E, S))
			result.push({x:E, y:S});
	};
	if(_W) {
		if(_N && this.IsAvailable(W, N))
			result.push({x:W, y:N});
		if(_S && this.IsAvailable(W, S))
			result.push({x:W, y:S});
	};
};
*/