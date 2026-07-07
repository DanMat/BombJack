/*
 * BombJack — a vertical-scrolling car combat shooter.
 *
 * Rebuilt from the original 2011 jQuery version into a dependency-free canvas
 * game. All art is drawn procedurally (no image assets): 10 themed levels with
 * bosses, weapon power-ups, road hazards, combos, smart bombs, shield/boost,
 * and a shared high-score leaderboard (see leaderboard.js).
 */
(function () {
	'use strict';

	var W = 480, H = 720;
	var LEVELS = window.BOMBJACK_LEVELS;

	/* ------------------------- static data tables ------------------------ */

	var ENEMY_TYPES = {
		car:     { w: 40, h: 58, hp: 1, score: 100, behavior: 'straight', speed: 1.0, color: '#e04b4b' },
		bike:    { w: 26, h: 44, hp: 1, score: 140, behavior: 'fast',     speed: 1.6, color: '#ffd24a' },
		weaver:  { w: 40, h: 54, hp: 1, score: 180, behavior: 'weave',    speed: 1.0, color: '#b06bff' },
		truck:   { w: 54, h: 92, hp: 3, score: 320, behavior: 'tank',     speed: 0.6, color: '#e0862a' },
		shooter: { w: 42, h: 60, hp: 2, score: 240, behavior: 'shooter',  speed: 0.85, color: '#4caf50' }
	};

	var WEAPONS = {
		single: { fireEvery: 0.22, shots: [{ dx: 0, ang: 0 }] },
		rapid:  { fireEvery: 0.10, shots: [{ dx: 0, ang: 0 }] },
		spread: { fireEvery: 0.26, shots: [{ dx: 0, ang: -14 }, { dx: 0, ang: 0 }, { dx: 0, ang: 14 }] },
		triple: { fireEvery: 0.20, shots: [{ dx: -15, ang: 0 }, { dx: 0, ang: 0 }, { dx: 15, ang: 0 }] }
	};

	var POWERUPS = {
		spread: { label: 'W', color: '#4cd964', kind: 'weapon' },
		triple: { label: 'T', color: '#00e5ff', kind: 'weapon' },
		rapid:  { label: 'R', color: '#ffd24a', kind: 'weapon' },
		shield: { label: 'S', color: '#5aa9ff', kind: 'shield' },
		boost:  { label: 'N', color: '#ff2e97', kind: 'boost' },
		life:   { label: '+', color: '#ff5e7e', kind: 'life' },
		bomb:   { label: 'B', color: '#ff9f43', kind: 'bomb' }
	};
	var POWERUP_BAG = ['spread', 'triple', 'rapid', 'rapid', 'shield', 'boost', 'life', 'bomb', 'bomb'];

	/* ------------------------------ state -------------------------------- */

	var canvas, ctx, dpr = 1, el = {}, raf, lastTime;
	var state = 'title';
	var levelIndex = 0, level, score = 0, lives = 3, bombs = 1, combo = 0, comboTimer = 0;
	var kills = 0, bossActive = false, boss = null;
	var player, bullets, enemies, ebullets, powerups, hazards, particles;
	var weapon = 'single', weaponTimer = 0;
	var shieldTimer = 0, boostTimer = 0, invuln = 0, slip = 0;
	var fireTimer = 0, spawnTimer = 0, hazardTimer = 0, roadOffset = 0, introTimer = 0, shake = 0, flash = 0;
	var input = { left: false, right: false, up: false, down: false, pointer: null };

	/* ------------------------------ helpers ------------------------------ */

	function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
	function rand(a, b) { return a + Math.random() * (b - a); }
	function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
	function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
	function roundRect(x, y, w, h, r) {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.arcTo(x + w, y, x + w, y + h, r);
		ctx.arcTo(x + w, y + h, x, y + h, r);
		ctx.arcTo(x, y + h, x, y, r);
		ctx.arcTo(x, y, x + w, y, r);
		ctx.closePath();
	}

	/* ------------------------------- boot -------------------------------- */

	function boot() {
		canvas = document.getElementById('game');
		ctx = canvas.getContext('2d');
		['hudScore', 'hudLives', 'hudLevel', 'hudWeapon', 'hudBombs', 'combo', 'bossbar', 'bossfill', 'bossname',
		 'screenTitle', 'screenIntro', 'screenPause', 'screenGameover', 'screenInitials', 'screenLeaderboard', 'screenHowto',
		 'introLevel', 'introName', 'introTag', 'goTitle', 'goScore', 'goSub', 'initScore', 'lbBody', 'lbMode', 'lbTitle', 'titleTop'
		].forEach(function (id) { el[id] = document.getElementById(id); });
		resize();
		window.addEventListener('resize', resize);
		bindInput();
		bindButtons();
		showTitle();
		lastTime = performance.now();
		raf = requestAnimationFrame(loop);
	}

	function resize() {
		dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = W * dpr; canvas.height = H * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	/* ------------------------------ flow --------------------------------- */

	function startGame() {
		score = 0; lives = 3; bombs = 1; levelIndex = 0;
		weapon = 'single'; weaponTimer = 0;
		loadLevel(0);
	}

	function loadLevel(idx) {
		level = LEVELS[idx];
		kills = 0; bossActive = false; boss = null;
		bullets = []; enemies = []; ebullets = []; powerups = []; hazards = []; particles = [];
		player = { x: W / 2 - 20, y: H - 96, w: 40, h: 60 };
		spawnTimer = 0; hazardTimer = 0; fireTimer = 0;
		shieldTimer = boostTimer = invuln = slip = 0;
		combo = 0;
		el.bossbar.hidden = true;
		showIntro();
	}

	function showIntro() {
		state = 'intro'; introTimer = 1.8;
		el.introLevel.textContent = 'Level ' + (levelIndex + 1) + ' / ' + LEVELS.length;
		el.introName.textContent = level.name;
		el.introTag.textContent = level.tag;
		showScreen('screenIntro');
		updateHud();
	}

	function beginPlay() { state = 'playing'; showScreen(null); }

	function levelClear() {
		score += lives * 200 + (levelIndex + 1) * 500;
		if (levelIndex >= LEVELS.length - 1) { return endGame(true); }
		levelIndex++;
		loadLevel(levelIndex);
	}

	function playerHit() {
		if (invuln > 0 || state !== 'playing') { return; }
		if (shieldTimer > 0) { shieldTimer = 0; invuln = 1; flash = 0.15; return; }
		lives--; combo = 0; weapon = 'single'; weaponTimer = 0;
		invuln = 1.6; shake = 14; flash = 0.25;
		explode(player.x + player.w / 2, player.y + player.h / 2, '#ff6b6b', 18);
		updateHud();
		if (lives <= 0) { endGame(false); }
	}

	function endGame(won) {
		state = 'ending';
		if (won) { score += 2000; }
		Leaderboard.qualifies(score).then(function (ok) {
			if (ok) { showInitials(won); } else { showGameover(won); }
		});
	}

	function showGameover(won) {
		state = 'gameover';
		el.goTitle.textContent = won ? 'You beat BombJack!' : 'Game Over';
		el.goScore.textContent = score.toLocaleString();
		el.goSub.textContent = won ? 'All ' + LEVELS.length + ' levels cleared.' : 'Reached level ' + (levelIndex + 1) + '.';
		showScreen('screenGameover');
	}

	/* ---------------------------- spawning ------------------------------- */

	function spawnEnemy() {
		var id = pick(level.enemies), t = ENEMY_TYPES[id];
		var x = rand(20, W - 20 - t.w);
		enemies.push({
			id: id, x: x, y: -t.h - 10, w: t.w, h: t.h, hp: t.hp, maxHp: t.hp,
			color: t.color, behavior: t.behavior, score: t.score,
			vy: (level.scroll + 1.6) * t.speed, baseX: x, phase: rand(0, Math.PI * 2), fireT: rand(0.6, 1.6)
		});
	}

	function spawnHazard() {
		var id = pick(level.hazards);
		var sizes = { barrier: [72, 22], cone: [22, 30], oil: [74, 46] };
		var s = sizes[id];
		hazards.push({ id: id, x: rand(16, W - 16 - s[0]), y: -s[1] - 6, w: s[0], h: s[1], vy: level.scroll + 0.8 });
	}

	function spawnBoss() {
		bossActive = true;
		var b = level.boss;
		boss = { name: b.name, hp: b.hp, maxHp: b.hp, color: b.color, speed: b.speed, fireEvery: b.fireEvery,
			x: W / 2 - 80, y: -140, w: 160, h: 120, dir: 1, fireT: b.fireEvery, entering: true };
		el.bossname.textContent = b.name;
		el.bossbar.hidden = false;
	}

	function maybeDropPowerup(x, y) {
		if (Math.random() < 0.14) {
			powerups.push({ id: pick(POWERUP_BAG), x: x - 13, y: y - 13, w: 26, h: 26, vy: 2.4 });
		}
	}

	/* ------------------------------ update ------------------------------- */

	function loop(now) {
		var dt = Math.min((now - lastTime) / 1000, 0.05); lastTime = now;
		if (state === 'playing') { update(dt); }
		else if (state === 'intro') { introTimer -= dt; if (introTimer <= 0) { beginPlay(); } }
		render();
		raf = requestAnimationFrame(loop);
	}

	function update(dt) {
		var f = dt * 60;
		roadOffset = (roadOffset + level.scroll * f * (boostTimer > 0 ? 1.5 : 1)) % 48;

		updatePlayer(f);
		autoFire(dt);
		updateBullets(f);
		updateEnemies(dt, f);
		updateEbullets(f);
		updateHazards(f);
		updatePowerups(f);
		updateParticles(f);
		if (bossActive && boss) { updateBoss(dt, f); }

		// timers
		if (weaponTimer > 0) { weaponTimer -= dt; if (weaponTimer <= 0) { weapon = 'single'; updateHud(); } }
		if (shieldTimer > 0) { shieldTimer -= dt; }
		if (boostTimer > 0) { boostTimer -= dt; }
		if (invuln > 0) { invuln -= dt; }
		if (slip > 0) { slip -= dt; }
		if (comboTimer > 0) { comboTimer -= dt; if (comboTimer <= 0) { combo = 0; } }
		if (shake > 0) { shake = Math.max(0, shake - f); }
		if (flash > 0) { flash = Math.max(0, flash - dt); }

		// spawning (stop regular spawns once boss is out)
		if (!bossActive) {
			spawnTimer += dt;
			if (spawnTimer >= level.spawnEvery) { spawnTimer = 0; spawnEnemy(); }
			if (level.hazardEvery > 0) {
				hazardTimer += dt;
				if (hazardTimer >= level.hazardEvery) { hazardTimer = 0; spawnHazard(); }
			}
			if (kills >= level.quota) { spawnBoss(); }
		}
	}

	function updatePlayer(f) {
		var sp = (boostTimer > 0 ? 7.5 : 6) * f;
		var dir = slip > 0 ? -1 : 1; // oil slick inverts controls briefly
		if (input.pointer) {
			player.x += clamp(input.pointer.x - (player.x + player.w / 2), -sp * 1.6, sp * 1.6);
			player.y += clamp(input.pointer.y - (player.y + player.h / 2), -sp * 1.6, sp * 1.6);
		} else {
			if (input.left) { player.x -= sp * dir; }
			if (input.right) { player.x += sp * dir; }
			if (input.up) { player.y -= sp; }
			if (input.down) { player.y += sp; }
		}
		player.x = clamp(player.x, 12, W - 12 - player.w);
		player.y = clamp(player.y, H * 0.42, H - 74);
	}

	function autoFire(dt) {
		fireTimer += dt;
		var wpn = WEAPONS[weapon];
		if (fireTimer >= wpn.fireEvery) {
			fireTimer = 0;
			var cx = player.x + player.w / 2;
			wpn.shots.forEach(function (s) {
				var a = (s.ang || 0) * Math.PI / 180;
				bullets.push({ x: cx + (s.dx || 0) - 3, y: player.y - 6, w: 6, h: 14, vx: Math.sin(a) * 11, vy: -Math.cos(a) * 11 });
			});
		}
	}

	function updateBullets(f) {
		for (var i = bullets.length - 1; i >= 0; i--) {
			var b = bullets[i]; b.x += b.vx * f; b.y += b.vy * f;
			if (b.y < -20 || b.x < -20 || b.x > W + 20) { bullets.splice(i, 1); continue; }
			var hitSomething = false;
			for (var j = enemies.length - 1; j >= 0; j--) {
				if (overlap(b, enemies[j])) { damageEnemy(j); hitSomething = true; break; }
			}
			if (hitSomething) { bullets.splice(i, 1); continue; }
			if (bossActive && boss && overlap(b, boss)) {
				bullets.splice(i, 1); boss.hp--; explode(b.x, b.y, boss.color, 3);
				if (boss.hp <= 0) { defeatBoss(); }
			}
		}
	}

	function damageEnemy(j) {
		var e = enemies[j]; e.hp--;
		explode(e.x + e.w / 2, e.y + e.h / 2, e.color, 4);
		if (e.hp > 0) { return; }
		addScore(e.score);
		combo++; comboTimer = 2.5; updateCombo();
		explode(e.x + e.w / 2, e.y + e.h / 2, e.color, 12);
		maybeDropPowerup(e.x + e.w / 2, e.y + e.h / 2);
		enemies.splice(j, 1);
		kills++;
	}

	function defeatBoss() {
		addScore(boss.maxHp * 40 + 1000);
		explode(boss.x + boss.w / 2, boss.y + boss.h / 2, boss.color, 40);
		shake = 20; flash = 0.4;
		boss = null; bossActive = false; el.bossbar.hidden = true;
		levelClear();
	}

	function updateEnemies(dt, f) {
		for (var i = enemies.length - 1; i >= 0; i--) {
			var e = enemies[i];
			e.y += e.vy * f;
			if (e.behavior === 'weave') { e.x = e.baseX + Math.sin(e.y / 40 + e.phase) * 60; }
			if (e.behavior === 'shooter') {
				e.fireT -= dt;
				if (e.fireT <= 0 && e.y > 0 && e.y < H * 0.6) { e.fireT = 1.5; enemyShoot(e); }
			}
			if (overlap(e, player)) { playerHit(); explode(e.x + e.w / 2, e.y + e.h / 2, e.color, 8); enemies.splice(i, 1); continue; }
			if (e.y > H + 20) { enemies.splice(i, 1); }
		}
	}

	function enemyShoot(e) {
		var cx = e.x + e.w / 2, dx = (player.x + player.w / 2) - cx, dy = (player.y) - e.y;
		var d = Math.hypot(dx, dy) || 1;
		ebullets.push({ x: cx - 4, y: e.y + e.h, w: 8, h: 8, vx: dx / d * 4, vy: Math.max(2.5, dy / d * 4) });
	}

	function updateEbullets(f) {
		for (var i = ebullets.length - 1; i >= 0; i--) {
			var b = ebullets[i]; b.x += b.vx * f; b.y += b.vy * f;
			if (b.y > H + 20) { ebullets.splice(i, 1); continue; }
			if (overlap(b, player)) { ebullets.splice(i, 1); playerHit(); }
		}
	}

	function updateHazards(f) {
		for (var i = hazards.length - 1; i >= 0; i--) {
			var hz = hazards[i]; hz.y += hz.vy * f;
			if (hz.y > H + 20) { hazards.splice(i, 1); continue; }
			if (overlap(hz, player)) {
				if (hz.id === 'oil') { if (slip <= 0) { slip = 1.2; flash = 0.1; } }
				else { playerHit(); }
				if (hz.id !== 'oil') { hazards.splice(i, 1); }
			}
		}
	}

	function updatePowerups(f) {
		for (var i = powerups.length - 1; i >= 0; i--) {
			var p = powerups[i]; p.y += p.vy * f;
			if (p.y > H + 20) { powerups.splice(i, 1); continue; }
			if (overlap(p, player)) { applyPowerup(p.id); powerups.splice(i, 1); }
		}
	}

	function applyPowerup(id) {
		var meta = POWERUPS[id];
		if (meta.kind === 'weapon') { weapon = id; weaponTimer = 14; }
		else if (meta.kind === 'shield') { shieldTimer = 10; }
		else if (meta.kind === 'boost') { boostTimer = 6; }
		else if (meta.kind === 'life') { lives = Math.min(lives + 1, 5); }
		else if (meta.kind === 'bomb') { bombs = Math.min(bombs + 1, 5); }
		flashMsg(meta.color, id.toUpperCase());
		updateHud();
	}

	function useBomb() {
		if (bombs <= 0 || state !== 'playing') { return; }
		bombs--; shake = 16; flash = 0.5;
		enemies.forEach(function (e) { addScore(e.score); explode(e.x + e.w / 2, e.y + e.h / 2, e.color, 8); });
		enemies = []; ebullets = [];
		kills += 3;
		if (bossActive && boss) { boss.hp = Math.max(0, boss.hp - 6); if (boss.hp <= 0) { defeatBoss(); } }
		updateHud();
	}

	function updateBoss(dt, f) {
		if (boss.entering) { boss.y += 1.6 * f; if (boss.y >= 40) { boss.entering = false; } return; }
		boss.x += boss.speed * boss.dir * f;
		if (boss.x <= 12) { boss.x = 12; boss.dir = 1; }
		if (boss.x + boss.w >= W - 12) { boss.x = W - 12 - boss.w; boss.dir = -1; }
		boss.fireT -= dt;
		if (boss.fireT <= 0) {
			boss.fireT = boss.fireEvery;
			for (var k = -1; k <= 1; k++) {
				ebullets.push({ x: boss.x + boss.w / 2 - 4 + k * 20, y: boss.y + boss.h, w: 9, h: 9, vx: k * 1.6, vy: 4.2 });
			}
		}
		if (overlap(boss, player)) { playerHit(); }
	}

	function explode(x, y, color, n) {
		for (var i = 0; i < n; i++) {
			particles.push({ x: x, y: y, vx: rand(-4, 4), vy: rand(-4, 4), life: 1, color: color });
		}
	}
	function updateParticles(f) {
		for (var i = particles.length - 1; i >= 0; i--) {
			var p = particles[i]; p.x += p.vx * f; p.y += p.vy * f; p.vx *= 0.94; p.vy *= 0.94; p.life -= 0.04 * f;
			if (p.life <= 0) { particles.splice(i, 1); }
		}
	}

	function addScore(base) {
		var mult = Math.min(1 + Math.floor(combo / 5), 6) * (boostTimer > 0 ? 2 : 1);
		score += base * mult;
		updateHud();
	}

	/* ------------------------------ render ------------------------------- */

	function render() {
		ctx.save();
		if (shake > 0) { ctx.translate(rand(-shake, shake) * 0.3, rand(-shake, shake) * 0.3); }
		drawRoad();
		if (state !== 'title') {
			hazards.forEach(drawHazard);
			powerups.forEach(drawPowerup);
			enemies.forEach(drawEnemy);
			if (bossActive && boss) { drawBoss(); }
			ebullets.forEach(drawEbullet);
			bullets.forEach(drawBullet);
			if (state === 'playing' || state === 'paused' || state === 'ending') { drawPlayer(); }
			particles.forEach(drawParticle);
		}
		ctx.restore();
		if (flash > 0) { ctx.fillStyle = 'rgba(255,255,255,' + (flash * 0.8) + ')'; ctx.fillRect(0, 0, W, H); }
	}

	function drawRoad() {
		var th = level ? level.theme : { road: '#20222e', line: '#00e5ff', edge: '#2b2f45' };
		ctx.fillStyle = th.road; ctx.fillRect(0, 0, W, H);
		// side edges
		ctx.fillStyle = th.edge; ctx.fillRect(0, 0, 14, H); ctx.fillRect(W - 14, 0, 14, H);
		// scrolling lane dashes (2 dividers → 3 lanes)
		ctx.fillStyle = th.line;
		[W / 3, 2 * W / 3].forEach(function (lx) {
			for (var y = -48 + roadOffset; y < H; y += 48) { ctx.fillRect(lx - 3, y, 6, 26); }
		});
		// edge dashes
		ctx.globalAlpha = 0.5;
		for (var y2 = -48 + roadOffset; y2 < H; y2 += 48) { ctx.fillRect(6, y2, 4, 30); ctx.fillRect(W - 10, y2, 4, 30); }
		ctx.globalAlpha = 1;
	}

	// Top-down vehicle body. facing 'up' = player, 'down' = enemy.
	function carBody(x, y, w, h, color, facing) {
		ctx.fillStyle = color;
		roundRect(x, y, w, h, 7); ctx.fill();
		// wheels
		ctx.fillStyle = 'rgba(0,0,0,.55)';
		roundRect(x - 2, y + h * 0.18, 4, h * 0.22, 2); ctx.fill();
		roundRect(x - 2, y + h * 0.6, 4, h * 0.22, 2); ctx.fill();
		roundRect(x + w - 2, y + h * 0.18, 4, h * 0.22, 2); ctx.fill();
		roundRect(x + w - 2, y + h * 0.6, 4, h * 0.22, 2); ctx.fill();
		// windshield toward direction of travel
		ctx.fillStyle = 'rgba(255,255,255,.4)';
		var wy = facing === 'up' ? y + h * 0.16 : y + h * 0.56;
		roundRect(x + w * 0.2, wy, w * 0.6, h * 0.24, 4); ctx.fill();
		// roof
		ctx.fillStyle = 'rgba(0,0,0,.18)';
		roundRect(x + w * 0.22, y + h * 0.42, w * 0.56, h * 0.2, 4); ctx.fill();
	}

	function drawPlayer() {
		if (invuln > 0 && Math.floor(invuln * 12) % 2 === 0) { return; } // blink
		if (shieldTimer > 0) {
			ctx.strokeStyle = 'rgba(90,169,255,' + (0.5 + Math.sin(Date.now() / 100) * 0.2) + ')';
			ctx.lineWidth = 3;
			ctx.beginPath(); ctx.arc(player.x + player.w / 2, player.y + player.h / 2, player.w * 0.8, 0, Math.PI * 2); ctx.stroke();
		}
		var accent = level ? level.theme.accent : '#00e5ff';
		ctx.save(); ctx.shadowColor = accent; ctx.shadowBlur = 10;
		carBody(player.x, player.y, player.w, player.h, '#e8f6ff', 'up');
		ctx.restore();
		// nose accent
		ctx.fillStyle = accent;
		roundRect(player.x + player.w * 0.3, player.y - 2, player.w * 0.4, 6, 3); ctx.fill();
	}

	function drawEnemy(e) {
		if (e.id === 'truck') {
			carBody(e.x, e.y, e.w, e.h * 0.4, '#cfcfcf', 'down');
			ctx.fillStyle = e.color; roundRect(e.x + 3, e.y + e.h * 0.42, e.w - 6, e.h * 0.56, 6); ctx.fill();
		} else if (e.id === 'bike') {
			ctx.fillStyle = e.color; roundRect(e.x, e.y, e.w, e.h, 8); ctx.fill();
			ctx.fillStyle = 'rgba(0,0,0,.4)'; roundRect(e.x + e.w * 0.25, e.y + e.h * 0.3, e.w * 0.5, e.h * 0.4, 4); ctx.fill();
		} else {
			carBody(e.x, e.y, e.w, e.h, e.color, 'down');
			if (e.id === 'shooter') { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(e.x + e.w / 2, e.y + e.h - 8, 4, 0, Math.PI * 2); ctx.fill(); }
		}
		if (e.maxHp > 1) {
			ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(e.x, e.y - 6, e.w, 3);
			ctx.fillStyle = '#7CFC00'; ctx.fillRect(e.x, e.y - 6, e.w * (e.hp / e.maxHp), 3);
		}
	}

	function drawBoss() {
		ctx.save(); ctx.shadowColor = boss.color; ctx.shadowBlur = 16;
		ctx.fillStyle = boss.color; roundRect(boss.x, boss.y, boss.w, boss.h, 12); ctx.fill();
		ctx.restore();
		ctx.fillStyle = 'rgba(0,0,0,.3)'; roundRect(boss.x + 14, boss.y + 14, boss.w - 28, boss.h - 40, 8); ctx.fill();
		ctx.fillStyle = 'rgba(255,255,255,.5)';
		roundRect(boss.x + boss.w * 0.2, boss.y + boss.h - 30, boss.w * 0.6, 14, 6); ctx.fill();
		// cannons
		ctx.fillStyle = '#111';
		[-1, 0, 1].forEach(function (k) { ctx.fillRect(boss.x + boss.w / 2 - 4 + k * 20, boss.y + boss.h - 6, 8, 10); });
		if (el.bossfill) { el.bossfill.style.width = (100 * boss.hp / boss.maxHp) + '%'; }
	}

	function drawBullet(b) {
		ctx.save(); ctx.shadowColor = '#ffe066'; ctx.shadowBlur = 8;
		ctx.fillStyle = '#fff8c0'; roundRect(b.x, b.y, b.w, b.h, 3); ctx.fill();
		ctx.restore();
	}
	function drawEbullet(b) {
		ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2); ctx.fill();
	}
	function drawPowerup(p) {
		var m = POWERUPS[p.id];
		ctx.save(); ctx.shadowColor = m.color; ctx.shadowBlur = 10;
		roundRect(p.x, p.y, p.w, p.h, 6); ctx.fillStyle = m.color; ctx.fill(); ctx.restore();
		ctx.fillStyle = 'rgba(0,0,0,.8)'; ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
		ctx.fillText(m.label, p.x + p.w / 2, p.y + p.h / 2 + 1);
	}
	function drawHazard(hz) {
		if (hz.id === 'oil') {
			ctx.fillStyle = 'rgba(10,10,20,.7)'; ctx.beginPath(); ctx.ellipse(hz.x + hz.w / 2, hz.y + hz.h / 2, hz.w / 2, hz.h / 2, 0, 0, Math.PI * 2); ctx.fill();
			ctx.fillStyle = 'rgba(120,90,180,.4)'; ctx.beginPath(); ctx.ellipse(hz.x + hz.w / 2, hz.y + hz.h / 2, hz.w / 3, hz.h / 3, 0, 0, Math.PI * 2); ctx.fill();
		} else if (hz.id === 'cone') {
			ctx.fillStyle = '#ff7a18'; ctx.beginPath();
			ctx.moveTo(hz.x + hz.w / 2, hz.y); ctx.lineTo(hz.x + hz.w, hz.y + hz.h); ctx.lineTo(hz.x, hz.y + hz.h); ctx.closePath(); ctx.fill();
			ctx.fillStyle = '#fff'; ctx.fillRect(hz.x + hz.w * 0.2, hz.y + hz.h * 0.5, hz.w * 0.6, 4);
		} else {
			for (var i = 0; i < hz.w; i += 16) {
				ctx.fillStyle = (i / 16) % 2 ? '#f4c430' : '#333'; ctx.fillRect(hz.x + i, hz.y, 16, hz.h);
			}
		}
	}
	function drawParticle(p) {
		ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); ctx.globalAlpha = 1;
	}

	/* -------------------------------- HUD -------------------------------- */

	function updateHud() {
		el.hudScore.textContent = score.toLocaleString();
		el.hudLives.textContent = '♥'.repeat(Math.max(0, lives));
		el.hudLevel.textContent = level ? level.name : 'BombJack';
		el.hudWeapon.textContent = weapon === 'single' ? '—' : weapon.toUpperCase();
		el.hudBombs.textContent = '💣'.repeat(bombs) || '—';
	}
	var comboT;
	function updateCombo() {
		clearTimeout(comboT);
		if (combo >= 3) {
			el.combo.textContent = 'COMBO ×' + Math.min(1 + Math.floor(combo / 5), 6);
			el.combo.style.color = '#ffd166';
			el.combo.classList.add('combo--show');
			comboT = setTimeout(function () { el.combo.classList.remove('combo--show'); }, 1000);
		}
	}
	function flashMsg(color, text) {
		el.combo.textContent = text; el.combo.style.color = color; el.combo.classList.add('combo--show');
		clearTimeout(comboT); comboT = setTimeout(function () { el.combo.classList.remove('combo--show'); }, 900);
	}

	/* --------------------------- initials/lb ----------------------------- */

	var initSlots = ['A', 'A', 'A'], initCursor = 0;
	function showInitials(won) {
		state = 'initials'; initSlots = ['A', 'A', 'A']; initCursor = 0;
		el.initScore.textContent = score.toLocaleString();
		renderInitials(); showScreen('screenInitials'); el.screenInitials.dataset.won = won ? '1' : '';
	}
	function renderInitials() {
		el.screenInitials.querySelectorAll('.slot').forEach(function (s, i) {
			s.querySelector('.slot__ch').textContent = initSlots[i];
			s.classList.toggle('slot--active', i === initCursor);
		});
	}
	function cycleSlot(i, d) { var c = (initSlots[i].charCodeAt(0) - 65 + d + 26) % 26; initSlots[i] = String.fromCharCode(65 + c); initCursor = i; renderInitials(); }
	function submitInitials() {
		var won = el.screenInitials.dataset.won === '1';
		Leaderboard.submit(initSlots.join(''), score, levelIndex + 1).then(function () { showLeaderboard(initSlots.join(''), won); });
	}
	function showLeaderboard(highlight, won) {
		state = 'leaderboard';
		el.lbTitle.textContent = won ? 'You beat BombJack!' : 'High Scores';
		el.lbMode.textContent = Leaderboard.mode === 'supabase' ? 'online' : 'this device';
		el.lbBody.innerHTML = '<tr><td colspan="4" class="lb-loading">Loading…</td></tr>';
		showScreen('screenLeaderboard');
		Leaderboard.top().then(function (rows) {
			if (!rows.length) { el.lbBody.innerHTML = '<tr><td colspan="4" class="lb-loading">No scores yet — be the first!</td></tr>'; return; }
			var used = false;
			el.lbBody.innerHTML = rows.map(function (r, i) {
				var me = !used && highlight && r.initials === highlight && r.score === score; if (me) { used = true; }
				return '<tr' + (me ? ' class="lb-me"' : '') + '><td>' + (i + 1) + '</td><td class="lb-ini">' + esc(r.initials) +
					'</td><td class="lb-score">' + Number(r.score).toLocaleString() + '</td><td>' + (r.stage || '-') + '</td></tr>';
			}).join('');
		});
	}
	function refreshTitleTop() {
		Leaderboard.top(1).then(function (rows) { el.titleTop.textContent = rows.length ? 'Best: ' + Number(rows[0].score).toLocaleString() + ' — ' + rows[0].initials : ''; });
	}
	function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

	/* ------------------------------ screens ------------------------------ */

	function showScreen(id) {
		['screenTitle', 'screenIntro', 'screenPause', 'screenGameover', 'screenInitials', 'screenLeaderboard', 'screenHowto']
			.forEach(function (s) { el[s].hidden = (s !== id); });
	}
	function showTitle() {
		state = 'title'; level = null; showScreen('screenTitle');
		el.hudScore.textContent = '0'; el.hudLives.textContent = ''; el.hudLevel.textContent = 'BombJack';
		el.hudWeapon.textContent = '—'; el.hudBombs.textContent = '—'; el.bossbar.hidden = true;
		refreshTitleTop();
	}
	function togglePause() {
		if (state === 'playing') { state = 'paused'; showScreen('screenPause'); }
		else if (state === 'paused') { showScreen(null); state = 'playing'; }
	}

	/* ------------------------------- input ------------------------------- */

	function pointerPos(clientX, clientY) {
		var r = canvas.getBoundingClientRect();
		return { x: (clientX - r.left) / r.width * W, y: (clientY - r.top) / r.height * H };
	}
	function bindInput() {
		canvas.addEventListener('mousemove', function (e) { if (e.buttons || state === 'playing') { input.pointer = pointerPos(e.clientX, e.clientY); } });
		canvas.addEventListener('mouseleave', function () { input.pointer = null; });
		canvas.addEventListener('touchstart', function (e) { input.pointer = pointerPos(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }, { passive: false });
		canvas.addEventListener('touchmove', function (e) { input.pointer = pointerPos(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }, { passive: false });
		canvas.addEventListener('touchend', function () { input.pointer = null; });

		document.addEventListener('keydown', function (e) {
			var k = e.key;
			if (state === 'initials') { return handleInitials(e); }
			if (k === 'ArrowLeft' || k === 'a') { input.left = true; input.pointer = null; }
			else if (k === 'ArrowRight' || k === 'd') { input.right = true; input.pointer = null; }
			else if (k === 'ArrowUp' || k === 'w') { input.up = true; input.pointer = null; }
			else if (k === 'ArrowDown' || k === 's') { input.down = true; input.pointer = null; }
			else if (k === 'x' || k === 'X' || k === 'Shift') { useBomb(); }
			else if (k === ' ' || k === 'Enter') {
				if (state === 'title') { startGame(); }
				else if (state === 'intro') { beginPlay(); }
				else if (state === 'playing') { useBomb(); }
				e.preventDefault();
			}
			else if (k === 'p' || k === 'P' || k === 'Escape') { togglePause(); }
		});
		document.addEventListener('keyup', function (e) {
			var k = e.key;
			if (k === 'ArrowLeft' || k === 'a') { input.left = false; }
			else if (k === 'ArrowRight' || k === 'd') { input.right = false; }
			else if (k === 'ArrowUp' || k === 'w') { input.up = false; }
			else if (k === 'ArrowDown' || k === 's') { input.down = false; }
		});
	}
	function handleInitials(e) {
		var k = e.key;
		if (/^[a-zA-Z]$/.test(k)) { initSlots[initCursor] = k.toUpperCase(); if (initCursor < 2) { initCursor++; } renderInitials(); }
		else if (k === 'ArrowUp') { cycleSlot(initCursor, 1); }
		else if (k === 'ArrowDown') { cycleSlot(initCursor, -1); }
		else if (k === 'ArrowLeft') { initCursor = Math.max(0, initCursor - 1); renderInitials(); }
		else if (k === 'ArrowRight') { initCursor = Math.min(2, initCursor + 1); renderInitials(); }
		else if (k === 'Backspace') { initCursor = Math.max(0, initCursor - 1); renderInitials(); }
		else if (k === 'Enter') { submitInitials(); }
		e.preventDefault();
	}
	function bindButtons() {
		on('btnPlay', startGame); on('btnHow', function () { showScreen('screenHowto'); }); on('btnHowClose', showTitle);
		on('btnTitleLb', function () { showLeaderboard(null, false); });
		on('btnAgain', startGame); on('btnMenu', showTitle); on('btnLbFromGo', function () { showLeaderboard(null, false); });
		on('btnLbAgain', startGame); on('btnLbMenu', showTitle); on('btnInitEnter', submitInitials);
		on('btnResume', togglePause); on('btnPauseMenu', showTitle); on('btnBomb', useBomb);
		el.screenInitials.querySelectorAll('.slot').forEach(function (slot, i) {
			slot.querySelector('.slot__up').addEventListener('click', function () { cycleSlot(i, 1); });
			slot.querySelector('.slot__down').addEventListener('click', function () { cycleSlot(i, -1); });
		});
	}
	function on(id, fn) { var n = document.getElementById(id); if (n) { n.addEventListener('click', fn); } }

	if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();
