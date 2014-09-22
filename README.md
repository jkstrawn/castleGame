Castle Sim Game
=============

##### A sim game using WebGL to render 3D graphics

##### Control a castle and all it's rooms and inhabitants. Keep your citizens and staff happy in the midst of enemy invasions, famine, and other disasters.

### Notes

#### Game Elements

##### Possible Resources

- Food
	* To feed your servants
	* To hosts feasts in the castle
- Timber
	* For making rooms and adding to the castle
	* Used for peasant housing?
- Gold
	* For paying militia
	* For building more luxurious rooms
	* Payments and treaties with other nations
- Tools?
	* For building more advanced buildings
- Stone?
	* It is a _castle_ after all

###### Advanced Resources

- Silk
- Wine
- Spices
- Salt
- jewelry
- leather
- tobacco
- herbs (medicinal)
- dye
- cotton
- charcoal
- fish
- flowers
- gold
- diamonds / gems
- hemp
- books
- sugarcane
- whale oil
- slaves

##### Citizens

- Servants
	* Provide service inside of the castle
	* Need food and happiness
- Peasants
	* Provide food from farming
	* Provide timber
	* Need protection from invaders
- Militia
	* Provide protection from invaders
	* Need gold for payment
- Nobles
	* Provide gold from takes
	* Need service inside the castle

##### Possible Ratings

- Cleanliness / Hygiene
	* Chance of disease
	* based on # of rooms vs # of servants vs # of nobles
- Morale
	* How tired are the servants (or peasants?)
	* Workers make mistakes when tired
	* Chance of rioting
- Reputation
	* View from the outside world
	* Chance of getting loan or help during war
	* Better trading prices
	* Chance of being attacked?
- Luxury
	* Higher luxury attracts better / more nobles
- Efficiency
	* Servants over- or under-performing
- Alignment
	* How evil or good the king is
	* Evil -> bloodlust, killing/starving servants, torture enemies, import slaves
	* Good -> fair to all, nice, not be evil
- Peasant happiness
	* trials / disputes
	* taxes
	* entertainment
	* safety from attackers
- Fear
	* Stops servants / peasants from rioting

##### Efficiencies?

- Food efficiency
- Militia efficiency
- Servant efficiency

#### Events

- feast
- banquet
- holiday
	* christmas
	* easter
	* harvest
	* may day (you know, with the maypole and stuff)
- joust
- tourney
- fair
- plays
- sports
- hunting
- animal entertainment
- arenas
- duels
- fight club
- send out raiding party

#### Disasters

- Drought
	* Weatherman can predict it
- Attack from other nation
	* Scout can warn ahead
	* options:
		- fight
		- hide in castle
		- bribe
- Food rotting
- Village fire

#### Rooms

##### Room List
- courtroom (archives)
- wash room (bath house?)
	* increase hygiene
- lavatory
	* increase hygiene
- 1/2 bedroom
- bedroom
	* allow noble to move in
- alchemy lab (apothecary)
- observatorium
- enchanting room
- hall
	* Continue to level-up
	* Unlocks more rooms
- kichen
	* Increase food efficiency
	* hygiene
	* luxury
- servants quarters
	* hygiene
	* servants efficiency
	* morale
- air lift / stair
- quarry
- stables
	* hygiene
	* military
- common room
- theater
	* luxury
	* morale
- chapel
	* morale
	* religion system?
	* luxury
- master bedroom (for king)
	* luxury
- lords chamber (suite)
	* luxury
- brothel
- keep
- barracks (and mess hall)
- storeroom (non-food)
	* store more resources?
	* efficiency
- pantry (food)
	* store more resources?
	* food efficiency
	* hygiene
- solar
- wardrobe
	* luxury
- tailor
- minstrels gallery
- hospital
- drawing room (parlor)
	* morale
	* luxury
- throne room
	* luxury
	* solving disputes have bigger gains (reputation, alignment, morale?)
- cellar
- buttery
	* luxury
- bottlery
- library
	* luxury
	* research points?
- oratory (private praying room)
- dungeon
- oubliette
- casemate (musketry)
- gatehouse
- bailey / ward / courtyard
	* luxury
	* morale
	* required for certain events? or just make them more effective
- study (office)
	* efficiency?
- garden
- treasury
	* luxury
	* increase gold max?
- stewards quarters
	* luxury
	* effeciency
- armory
- brewery
	* luxury
- forge
- cesspit
- closet

##### Room Categories

- Living
- Military
- Main / Necessary
- Cooking
- Misc
- Advanced
- Luxury?

#### Tyes of Nobles

- Baron
- Earl / Count
- Duke
- Grand Duke
- Regent
- Prince
- King
- Emporer
- Merchant
- Aristocrat

#### VISION

- Open the browser window
- We see a green field of grass gently blowing in the wind with a blue sky and clouds scuttling in the background
- We see we have 10 timber at the top, but no other resources
- Our eyes are drawn to our only clear option: a button to build a hall
- Clicking the button will depress it and create a rotating dashed border around the button
- When we move the mouse over to the field then an outline or a transparent version of the hall is shown over the cursor
- At the top we see it costs 5 wood and will leave us with 5
- As we move our mouse onto elligible spots to place the hall (which is marked by a green glow) then the hall snaps to nearby locations
- Clicking will "CHINK" the hall into place in a cloud of dust as its construction begins (immediate or wait?)
- A new option appears to hire a servant
- The food resource appears
- ...

#### Keys to making it fun

- Easy to start a game (game auto starts when you open the browser)
- Clear and simple choices to begin
- Limit the view of advanced resources and rooms
- Unlock each citizen: servant -> peasant -> noble -> militia
- Unlock resources: timber -> food -> gold
- Keep slow paced enough that you can play leisurely
- Create way to spend down time
	* Clicking a button to get ahead
	* "visit the kingdom"? and do what?
- Gray out / don't show other room tabs

#### TODO

###### Gameplay

- Show resources (food, timber, gold)
- Make awesome UI
- Hire servant button

###### ThreeJS

- Shadows
- Animate room snapping to position
- Add glow to available-room-outline
- Redo ground
- Add grass sprites
- Scroll camera up and down when hover over higher or lower rooms
- BUG: Transparency on room looks weird
- BUG: Light not showing up on floor or wall that is covered by tapestry or rug
- BUG: Light casting to room above the selected room

###### Models

- Servant model
- Animate servant model
- More rooms...
- Room furniture

###### Other

- Sound effects



Credit for the wonderful skybox goes to http://reije081.home.xs4all.nl/skyboxes/