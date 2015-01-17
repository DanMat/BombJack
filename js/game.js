/*
Creator: Dragon Prince
Date: 23.10.2011
Time:08:02 PM
*/
var canvas;
var prince;
var width = 400;
var height = window.innerHeight;

/*var link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = 'http://fonts.googleapis.com/css?family=Vast+Shadow';
document.getElementsByTagName('head')[0].appendChild(link);*/

var totalGoodies = 1;
var totalJackers = 3;

var goodies = [];
var goodies_x = 50;
var goodies_y = -100;
var goodies_w = 40;
var goodies_h = 40;
var speed = 10;

var jackers = [];
var jackers_x = 50;
var jackers_y = -100;
var jackers_w = 60;
var jackers_h = 149;
var speed = 3;

var rightKey = false;
var leftKey = false;
var upKey = false;
var downKey = false;

var player_x = width / 2;
var player_y = height - 50;
var player_w = 60;
var player_h = 149;

var fire = [];
var fire_total = 3; //total nos of onscreen fire

var score = 0;
var temp = 0;

var offset = 1;
var TO_RADIANS = Math.PI/180; 

var alive = true;
var bootstrap = 0;

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		window.requestAnimationFrame = requestAnimationFrame;

for (var i = 0; i < totalGoodies; i++) {
	goodies_y = -40 -Math.floor(Math.random() * 100) + 1;
	goodies_x = Math.floor(Math.random() * 340) + 20;
	speed = Math.floor(Math.random() * 2) + 8;
	goodies.push([goodies_x, goodies_y, goodies_w, goodies_h, speed]);
}

for (var i = 0; i < totalJackers; i++) {
	jackers_y = -100 -Math.floor(Math.random() * 100) + 1;
	jackers_x = Math.floor(Math.random() * 72) + 138*i;
	speed = Math.floor(Math.random() * 2) + 8;
    jackers.push([jackers_x, jackers_y, jackers_w, jackers_h, speed]);
}

function clrCanvas() {
    prince.clearRect(0, 0, width, height);
}

function drawGoodies() {
	for (var i = 0; i < goodies.length; i++) {
		
		prince.drawImage(goodies_img, goodies[i][0], goodies[i][1]);
	}
}

function drawJackers() {
	for (var i = 0; i < jackers.length; i++) 
		prince.drawImage(jacker_car, jackers[i][0], jackers[i][1]);
}

function player() {
    //define movements
    if (rightKey) player_x += 5;
    else if (leftKey) player_x -= 5;

    if (upKey) player_y -= 5;
    else if (downKey) player_y += 5;

    //prevent the player from goin beyond focus
    if (player_x < 0) player_x = 0; //left wall

    if ((player_x + player_w) >= width) player_x = width - player_w; //right wall

    if (player_y < 0) player_y = 0; //top wall

    if ((player_y + player_h) >= height) player_y = height - player_h; //bottom wall

    //draw the player
    prince.drawImage(player_car, player_x, player_y);
}

function moveGoodies() {
    for (var i = 0; i < goodies.length; i++) {
        if (goodies[i][1] < height) {
            goodies[i][1] += goodies[i][4]; //add with speed
        } else if (goodies[i][1] > height - 1) //from de top again
        {
            goodies[i][1] = -45;
			goodies[i][4] = Math.floor(Math.random() * 3) + 8;
			goodies[i][0] = Math.floor(Math.random() * 340) + 20;
        }
    }
}

function moveJackers() {
    for (var i = 0; i < jackers.length; i++) {
        if (jackers[i][1] < height) {
            jackers[i][1] += jackers[i][4]; //add with speed
        } else if (jackers[i][1] > height - 1) //from de top again
        {
            jackers[i][1] = -45;
			jackers[i][4] = Math.floor(Math.random() * 2) + 8;
			if(i==0) jackers[i][0] = Math.floor(Math.random() * 80);
			if(i==1) jackers[i][0] = Math.floor(Math.random() * 82) + 138;
			if(i==2) jackers[i][0] = Math.floor(Math.random() * 72) + 278;
        }
    }
}

function drawFire() {
	for (var i = 0; i < fire.length; i++)
	prince.drawImage(missile, fire[i][0], fire[i][1]);
}

function moveFire() {
	for (var i = 0; i < fire.length; i++) {
		if (fire[i][1] > -26)
		fire[i][1] -=10;
		else if (fire[i][1] < -25)
		fire.splice(i, 1);//goes beyond screen so remove it
	}
}

function hitGoodies() {
    var player_width = player_x + player_w;
    var player_height = player_y + player_h;
    for (var i = 0; i < goodies.length; i++) {
		bottomLeft = player_x > goodies[i][0] && player_x < goodies[i][0] + goodies_w && player_y > goodies[i][1] && player_y < goodies[i][1] + goodies_h;
		bottomRight = player_width < goodies[i][0] + goodies_w && player_width > goodies[i][0] && player_y > goodies[i][1] && player_y < goodies[i][1] + goodies_h;
		topLeft = player_height > goodies[i][1] && player_height < goodies[i][1] + goodies_h && player_x > goodies[i][0] && player_x < goodies[i][0] + goodies_w;
		topRight = player_height > goodies[i][1] && player_height < goodies[i][1] + goodies_h && player_width < goodies[i][0] + goodies_w && player_width > goodies[i][0];
        if (bottomLeft || bottomRight || topLeft || topRight) //checks de bottom left most corner
        {
			goodies_x = Math.floor(Math.random() * 340) + 20;
			goodies[i][0] = goodies_x;
			goodies[i][1] = -100;
			goodies[i][2] = goodies_w;
			goodies[i][3] = goodies_h;
			goodies[i][4] = speed;
            fire_total++;
        }
    }
}

function hitJack() {
    var player_width = player_x + player_w;
    var player_height = player_y + player_h;
    for (var i = 0; i < jackers.length; i++) {
		bottomLeft = player_x > jackers[i][0] && player_x < jackers[i][0] + jackers_w && player_y > jackers[i][1] && player_y < jackers[i][1] + jackers_h;
		bottomRight = player_width < jackers[i][0] + jackers_w && player_width > jackers[i][0] && player_y > jackers[i][1] && player_y < jackers[i][1] + jackers_h;
		topLeft = player_height > jackers[i][1] && player_height < jackers[i][1] + jackers_h && player_x > jackers[i][0] && player_x < jackers[i][0] + jackers_w;
		topRight = player_height > jackers[i][1] && player_height < jackers[i][1] + jackers_h && player_width < jackers[i][0] + jackers_w && player_width > jackers[i][0];
        if (bottomLeft || bottomRight || topLeft || topRight) //checks de bottom left most corner
        {
			alive = false;
			prince.drawImage(blast, player_x, player_y);
        }
    }
}

function hit() {
	var remove= false;
	for (var i= 0; i< fire.length; i++) {
		for (var j= 0; j< jackers.length; j++) {
			if(((fire[i][0] >= jackers[j][0]) && (fire[i][0] <= (jackers[j][0] + jackers[j][2]))) && (fire[i][1] <= (jackers[j][1] + jackers[j][3]))) {
				remove = true;
				if(j==0) jackers[j][0] = Math.floor(Math.random() * 80);
				if(j==1) jackers[j][0] = Math.floor(Math.random() * 82) + 138;
				if(j==2) jackers[j][0] = Math.floor(Math.random() * 72) + 278;
				jackers[j][1] = -100;
				jackers[j][2] = jackers_w;
				jackers[j][3] = jackers_h;
				jackers[j][4] = Math.floor(Math.random() * 2) + 8;
				prince.drawImage(blast, player_x, player_y);
				score += 10;
				temp += 10;
				bootstrap = 0;
			}
		}
	if (remove == true) {
		fire.splice(i,1);
		remove= false;
	}
	}
}


function scoreDisplay() {
    prince.font = 'bold 21px Time';
    prince.fillStyle = '#fff';
    prince.fillText('Score: ', 290, 30);
    prince.fillText(score, 350, 30);
	prince.fillText('Missiles: ', 20, 30);
    prince.fillText(fire_total, 105, 30);
    if (!alive) {
        prince.fillText('Your dead buddy', 120, height / 2);
    }
    if (temp %100 == 0 && bootstrap == 0 && temp > 0) {
        fire_total+=3;
		bootstrap = 1;
    }
    
}

function scroll() {
	offset+=5;
	$('#move').css("background-position", "50% " + offset + "px");
	$('#move2').css("background-position", "50% " + offset + "px");
	$('#move3').css("background-position", "50% " + offset + "px");
	if(offset == 640) offset = 1;
}
	
function init() {
    canvas = document.getElementById('canvas');
    prince = canvas.getContext('2d');
	prince.canvas.width  = 400;
    prince.canvas.height = window.innerHeight;
    player_car = new Image();
    player_car.src = "images/player_car.png";
	jacker_car = new Image();
    jacker_car.src = "images/jacker_car.png";
	goodies_img = new Image();
    goodies_img.src = "images/goodies.png";
	missile = new Image();
	missile.src = "images/missile.gif";
	blast = new Image();
	blast.src = "images/blast.png";
    gameLoop(); //frames per millisec
    document.addEventListener('keydown', A, false);
    document.addEventListener('keyup', B, false);
}

function gameLoop() {
    clrCanvas();
    if (alive) {
		drawGoodies();
        moveGoodies();
        drawJackers();
		moveJackers(); 
		drawFire();
		moveFire();
		hit();
		hitJack();
		hitGoodies();
        player();
		scroll();
    }
    scoreDisplay();
	requestAnimationFrame(gameLoop);
}

function rotate(angle) {
	prince.save();
	prince.translate(player_x, player_y);
	prince.clearRect(0, 0, player_w, player_h);
	prince.rotate(angle * TO_RADIANS);
	prince.translate(-player_x, -player_y);
	prince.drawImage(player_car, player_x, player_y);
	prince.restore(); 
}

function A(a) {
    if (a.keyCode == 39) {
	rightKey = true;
	//rotate(20);
	}
    else if (a.keyCode == 37) {
	leftKey = true;
	//rotate(-20);
	}

    if (a.keyCode == 38) upKey = true;
    else if (a.keyCode == 40) downKey = true;

    if (a.keyCode == 32 && fire.length < fire_total) {fire.push([player_x + 23, player_y - 25]);fire_total--;}

}

function B(a) {
    if (a.keyCode == 39) rightKey = false;
    else if (a.keyCode == 37) leftKey = false;

    if (a.keyCode == 38) upKey = false;
    else if (a.keyCode == 40) downKey = false;
}





window.onload = init;


		
	




