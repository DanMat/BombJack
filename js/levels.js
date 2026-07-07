/*
 * BombJack level definitions — pure data, so levels are easy to tune or extend.
 *
 * Each level references enemy/hazard type ids defined in game.js. `quota` is how
 * many enemies you must destroy before the boss appears; clearing the boss ends
 * the level. Difficulty ramps via scroll speed, spawn interval and enemy mix.
 */
window.BOMBJACK_LEVELS = [
	{
		name: 'Sunset Highway', tag: 'Ease onto the road',
		theme: { road: '#3a3a4a', line: '#ffd166', edge: '#7a5c3a', grass: '#c98a4b', accent: '#ff6b6b' },
		scroll: 3.2, spawnEvery: 1.3, enemies: ['car', 'car', 'car'], hazardEvery: 0, hazards: [],
		quota: 12, boss: { name: 'Road Baron', hp: 24, color: '#ff6b6b', speed: 2.2, fireEvery: 1.6 }
	},
	{
		name: 'Night City', tag: 'Bikes join the chase',
		theme: { road: '#20222e', line: '#00e5ff', edge: '#2b2f45', grass: '#12131c', accent: '#00e5ff' },
		scroll: 3.6, spawnEvery: 1.15, enemies: ['car', 'car', 'bike'], hazardEvery: 0, hazards: [],
		quota: 14, boss: { name: 'Neon Runner', hp: 30, color: '#00e5ff', speed: 2.6, fireEvery: 1.4 }
	},
	{
		name: 'Desert Run', tag: 'Weavers and cones',
		theme: { road: '#5a4a38', line: '#ffe0a0', edge: '#8a6a44', grass: '#c99a5a', accent: '#ff9f43' },
		scroll: 3.9, spawnEvery: 1.05, enemies: ['car', 'bike', 'weaver'], hazardEvery: 3.5, hazards: ['cone'],
		quota: 16, boss: { name: 'Dune Stinger', hp: 34, color: '#ff9f43', speed: 2.8, fireEvery: 1.3 }
	},
	{
		name: 'Rush Hour', tag: 'Trucks and traffic',
		theme: { road: '#33343f', line: '#f4f4f4', edge: '#3f4150', grass: '#23242c', accent: '#ffcc00' },
		scroll: 4.1, spawnEvery: 1.0, enemies: ['car', 'weaver', 'truck'], hazardEvery: 3.0, hazards: ['barrier'],
		quota: 18, boss: { name: 'Big Rig', hp: 44, color: '#ffcc00', speed: 1.8, fireEvery: 1.5 }
	},
	{
		name: 'Tunnel', tag: 'They shoot back',
		theme: { road: '#1c1c24', line: '#ff2e97', edge: '#101016', grass: '#08080c', accent: '#ff2e97' },
		scroll: 4.3, spawnEvery: 0.95, enemies: ['car', 'bike', 'shooter'], hazardEvery: 3.2, hazards: ['barrier'],
		quota: 20, boss: { name: 'Tunnel Wraith', hp: 48, color: '#ff2e97', speed: 2.6, fireEvery: 1.1 }
	},
	{
		name: 'Coastal Bridge', tag: 'Mind the barriers',
		theme: { road: '#2c3e50', line: '#a0e8ff', edge: '#22303d', grass: '#1a6a8a', accent: '#38f9d7' },
		scroll: 4.6, spawnEvery: 0.9, enemies: ['weaver', 'shooter', 'car'], hazardEvery: 2.6, hazards: ['barrier', 'cone'],
		quota: 22, boss: { name: 'Sea Serpent', hp: 54, color: '#38f9d7', speed: 3.0, fireEvery: 1.0 }
	},
	{
		name: 'Snowy Pass', tag: 'Slippery when iced',
		theme: { road: '#5b6b7b', line: '#ffffff', edge: '#8aa0b4', grass: '#dfeaf2', accent: '#90e0ef' },
		scroll: 4.8, spawnEvery: 0.85, enemies: ['truck', 'weaver', 'shooter'], hazardEvery: 2.4, hazards: ['oil'],
		quota: 24, boss: { name: 'Frost Hauler', hp: 60, color: '#90e0ef', speed: 2.2, fireEvery: 1.1 }
	},
	{
		name: 'Canyon', tag: 'No room for error',
		theme: { road: '#4a2c22', line: '#ffcf8a', edge: '#6a3a28', grass: '#a5502f', accent: '#ff7043' },
		scroll: 5.1, spawnEvery: 0.8, enemies: ['bike', 'weaver', 'shooter', 'truck'], hazardEvery: 2.2, hazards: ['barrier', 'oil'],
		quota: 26, boss: { name: 'Canyon King', hp: 68, color: '#ff7043', speed: 3.2, fireEvery: 0.95 }
	},
	{
		name: 'Neon Speedway', tag: 'Full throttle',
		theme: { road: '#161428', line: '#c400ff', edge: '#241a3a', grass: '#0c0a18', accent: '#c400ff' },
		scroll: 5.5, spawnEvery: 0.72, enemies: ['bike', 'weaver', 'shooter', 'car'], hazardEvery: 2.0, hazards: ['barrier', 'cone'],
		quota: 28, boss: { name: 'Voltage', hp: 76, color: '#c400ff', speed: 3.6, fireEvery: 0.85 }
	},
	{
		name: 'Final Gauntlet', tag: 'Everything, all at once',
		theme: { road: '#141820', line: '#00ffa3', edge: '#1c2430', grass: '#080b10', accent: '#00ffa3' },
		scroll: 5.9, spawnEvery: 0.65, enemies: ['bike', 'weaver', 'shooter', 'truck', 'car'], hazardEvery: 1.9, hazards: ['barrier', 'oil', 'cone'],
		quota: 32, boss: { name: 'The Warlord', hp: 100, color: '#00ffa3', speed: 3.4, fireEvery: 0.75 }
	}
];
