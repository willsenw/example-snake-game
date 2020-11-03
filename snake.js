var config = {
  type : Phaser.WEBGL,
  width : 640,
  height : 480,
  backgroundColor : '#DFD9BF',
  scene : {
    preload : preload,
    create : create,
    update : update
  }
};

var snake;
var food;
var cursors;

var UP = 0;
var DOWN = 1;
var LEFT = 2;
var RIGHT = 3;

var game = new Phaser.Game(config);

function preload(){
    this.load.image('food','./apple.png');
    this.load.image('body','./body2.png');
}

function create(){

  var Food = new Phaser.Class({
      Extends : Phaser.GameObjects.Image,
      initialize : function Food( scene,x,y){
        Phaser.GameObjects.Image.call(this,scene);
        this.setTexture('food');
        this.setPosition(x*16,y*16);
        this.setOrigin(0);
        this.total = 0;

        scene.children.add(this);
      },

      eat : function(){
        this.total++;
      }
  });

  var Snake = new Phaser.Class({
      initialize : function Snake(scene, x, y){
        this.headPosition = new Phaser.Geom.Point(x,y);

        this.body = scene.add.group();

        this.head = this.body.create(x*16, y * 16, 'body');
        this.head.setOrigin(0);

        this.alive = true;

        this.speed = 100;
        this.moveTime = 0;

        this.tail = new Phaser.Geom.Point(x,y);

        this.heading = RIGHT;
        this.direction = RIGHT;
      },
      update : function (time){
        if ( time >= this.moveTime ){
          return this.move(time);
        }
      },
      faceLeft : function(){
        if ( this.direction == UP || this.direction == DOWN ){
          this.heading = LEFT;
        }
      },

      faceRight : function(){
        if ( this.direction == UP || this.direction == DOWN ){
          this.heading = RIGHT;
        }
      },

      faceUp : function(){
        if ( this.direction == LEFT || this.direction == RIGHT ){
          this.heading = UP;
        }
      },

      faceDown : function(){
        if ( this.direction == LEFT || this.direction == RIGHT ){
          this.heading = DOWN;
        }
      },

      move : function ( time ){
        switch (this.heading) {
          case LEFT:
            this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x - 1 , 0, 40);
            break;
          case RIGHT:
            this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x + 1 , 0, 40);
            break;
          case UP:
            this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y - 1 , 0, 30);
            break;
          case DOWN:
            this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y + 1 , 0, 30);
            break;
          default:
            return false;
        }

        this.direction = this.heading;
        Phaser.Actions.ShiftPosition(this.body.getChildren(), this.headPosition.x * 16, this.headPosition.y * 16,1, this.tail);
        var hitBody = Phaser.Actions.GetFirst(this.body.getChildren(),{x:this.head.x, y : this.head.y}, 1 );

        if ( hitBody ){
          console.log('dead');
          this.alive = false;
          return false;
        } else {
          this.moveTime = time + this.speed;
          return true;
        }

        this.moveTime = time + this.speed;
        return true;
      },

      grow : function( ){
        var newPart = this.body.create(this.tail.x, this.tail.y, 'body');
        newPart.setOrigin(0);
      },

      collideWithFood : function( food ){
        if ( this.head.x == food.x && this.head.y == food.y ){
          this.grow();
          food.eat();
          food.setTint(0xff0000);
          if ( this.speed > 20 && food.total % 5 == 0 ){
            this.speed -= 5;
          }
          return true;
        } else {
          return false;
        }
      },

      updateGrid: function(grid){
        this.body.children.each( function(segment){
          var bx = segment.x / 16;
          var by = segment.y / 16;
          grid[by][bx] = false;
        });

        return grid;
      }
  });

  food = new Food(this,3,4);
  snake = new Snake(this,8,8);
  cursors = this.input.keyboard.createCursorKeys();
}

function repositionFood(){
  var testGrid = [];
  for ( var y = 0; y < 30; y++ ){
    testGrid[y] = [];
    for ( var x = 0; x < 40; x++ ){
      testGrid[y][x] = true;
    }
  }

  snake.updateGrid(testGrid);
  var validLocations = [];

  for ( var y = 0; y < 30; y++ ){
    for ( var x = 0; x < 40; x++ ){
      if ( testGrid[y][x] == true ){
        validLocations.push({x:x,y:y});
      }
    }
  }

  if ( validLocations.length > 0 ){
    var pos = Phaser.Math.RND.pick(validLocations);
    food.setPosition(pos.x * 16, pos.y * 16);
    return true;
  } else {
    return false;
  }
}

function update( time, delta ){
    if ( !snake.alive ){
      return;
    }

    if ( cursors.left.isDown ){
      snake.faceLeft();
    } else if ( cursors.right.isDown ){
      snake.faceRight();
    } else if ( cursors.up.isDown ){
      snake.faceUp();
    } else if ( cursors.down.isDown ){
      snake.faceDown();
    }

    if ( snake.update(time) ){
      if ( snake.collideWithFood(food) ) {
          repositionFood();
      }
    }
}
