describe('castles', function() {
	var controller;

	beforeEach(function() {
		controller = new Controller();
	});

	it('is a controller', function() {
		expect(controller).toBeDefined();
	});

	it('has peasants', function() {
		controller.add(PEASANTS, 5);
		expect(controller.get(PEASANTS)).toEqual(5);
	});

	it('has nobles', function() {
		controller.add(NOBLES, 5);
		expect(controller.get(NOBLES)).toEqual(5);
	});

	it('has militia', function() {
		controller.add(MILITIA, 5);
		expect(controller.get(SERVANTS)).toEqual(5);
	});

	it('has servants', function() {
		controller.add(SERVANTS, 5);
		expect(controller.get(SERVANTS)).toEqual(5);
	});
});