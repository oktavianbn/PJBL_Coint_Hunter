var scenePlay = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () {
    Phaser.Scene.call(this, { key: "scenePlay" });
  },

  init: function () {},

  preload: function () {
    this.load.setBaseURL("Assets/");
    this.load.image("background", "images/BG.png");
    this.load.image("btn_play", "images/ButtonPlay.png");
    this.load.image("gameover", "images/GameOver.png");
    this.load.image("coin", "images/Koin.png");
    this.load.image("enemy1", "images/Musuh01.png");
    this.load.image("enemy2", "images/Musuh02.png");
    this.load.image("enemy3", "images/Musuh03.png");
    this.load.image("coin_panel", "images/PanelCoin.png");
    this.load.image("ground", "images/Tile50.png");

    this.load.audio("snd_coin", "audio/koin.mp3");
    this.load.audio("snd_lose", "audio/kalah.mp3");
    this.load.audio("snd_jump", "audio/lompat.mp3");
    this.load.audio("snd_leveling", "audio/ganti_level.mp3");
    this.load.audio("snd_walk", "audio/jalan.mp3");
    this.load.audio("snd_touch", "audio/touch.mp3");
    this.load.audio("music_play", "audio/music_play.mp3");

    this.load.spritesheet("char", "images/CharaSpriteAnim.png", {
      frameWidth: 44.8,
      frameHeight: 93,
    });
  },
  create: function () {
    X_POSITION = {
      LEFT: 0,
      CENTER: this.game.canvas.width / 2,
      RIGHT: this.game.canvas.width,
    };

    Y_POSITION = {
      TOP: 0,
      CENTER: this.game.canvas.height / 2,
      BOTTOM: this.game.canvas.height,
    };

    relativeSize = {
      w: (this.game.canvas.width - layoutSize.w) / 2,
      h: (this.game.canvas.height - layoutSize.h) / 2,
    };

    let activeScene = this;

    // Background
    this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, "background");

    // Sound dan musik
    this.snd_coin = this.sound.add("snd_coin");
    this.snd_jump = this.sound.add("snd_jump");
    this.snd_leveling = this.sound.add("snd_leveling");
    this.snd_lose = this.sound.add("snd_lose");
    this.snd_touch = this.sound.add("snd_touch");
    this.snd_walk = this.sound.add("snd_walk");
    this.snd_walk.loop = true;
    this.snd_walk.setVolume(5);
    this.snd_walk.play();
    if (!this.sound.get("music_play")) {
      this.music_play = this.sound.add("music_play", { loop: true });
    } else {
      this.music_play = this.sound.get("music_play");
    }

    let countCoin = 0;

    this.add.image(X_POSITION.CENTER, 30, "coin_panel").setDepth(10);

    let coinText = this.add.text(X_POSITION.CENTER, 30, "0", {
      fontFamily: "Permanent Maker, Arial",
      fontSize: "36px",
      color: "#adadad",
    });
    coinText.setOrigin(0.5).setDepth(10);

    // Darken layer + tombol play
    let darkenLayer = this.add.rectangle(
      X_POSITION.CENTER,
      Y_POSITION.CENTER,
      this.game.canvas.width,
      this.game.canvas.height,
      0x000000
    );
    darkenLayer.setDepth(10);
    darkenLayer.alpha = 0.25;

    let ButtonPlay = this.add
      .image(X_POSITION.CENTER, Y_POSITION.CENTER, "btn_play")
      .setDepth(10)
      .setInteractive();

    ButtonPlay.on("pointerover", () => ButtonPlay.setTint(0x5a5a5a));
    ButtonPlay.on("pointerdown", () => ButtonPlay.setTint(0x5a5a5a));
    ButtonPlay.on("pointerout", () => ButtonPlay.clearTint());
    ButtonPlay.on("pointerup", () => {
      ButtonPlay.clearTint();
      activeScene.tweens.add({
        targets: ButtonPlay,
        scaleX: 0,
        scaleY: 0,
        duration: 250,
        ease: "Power2",
      });
      activeScene.tweens.add({
        targets: darkenLayer,
        alpha: 0,
        duration: 250,
        delay: 150,
        ease: "Sine.easeOut",
        onComplete: function () {
          activeScene.gameStarted = true;
          activeScene.physics.resume();
        },
      });
      activeScene.snd_touch.play();
      if (!activeScene.music_play.isPlaying) {
        activeScene.music_play.play();
      }
    });

    // Ground
    let groundTemp = this.add.image(0, 0, "ground").setVisible(false);
    let groundSize = { width: groundTemp.width, height: groundTemp.height };

    let platforms = this.physics.add.staticGroup();

    // Player
    this.player = this.physics.add.sprite(0, 0, "char");
    this.player.setGravityY(800);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, platforms);

    function resetPlayerPosition() {
      if (currentLevel === 1) {
        activeScene.player.setPosition(100, 500);
      } else if (currentLevel === 2) {
        activeScene.player.setPosition(200, 400); // bebas sesuai level lo
      } else {
        activeScene.player.setPosition(100, 500); // default fallback
      }
    }

    // Kontrol
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.keyWAD = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Animasi
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("char", { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("char", { start: 5, end: 8 }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: "front",
      frames: [{ key: "char", frame: 4 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "jumpRight",
      frames: [{ key: "char", frame: 8 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "jumpLeft",
      frames: [{ key: "char", frame: 3 }],
      frameRate: 20,
    });

    // Coin group
    let coins = this.physics.add.group({
      key: "coin",
      repeat: 9,
      setXY: { x: 100 - relativeSize.w, y: 80, stepX: 100 },
    });

    coins.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.3));
      child.setGravityY(800);
    });
    this.physics.add.collider(coins, platforms);

    this.coinParticles = this.add.particles("coin");

    this.coinEmitter = this.coinParticles.createEmitter({
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 10,
    });
    this.coinEmitter.setPosition(-100, -100);
    this.coinEmitter.explode();

    var collectCoin = (player, coin) => {
      countCoin += 10;
      coinText.setText(countCoin.toString());
      activeScene.snd_coin.play();
      activeScene.coinEmitter.setPosition(coin.x, coin.y);
      activeScene.coinEmitter.explode();
      coin.disableBody(true, true);

      if (coins.countActive(true) === 0) {
        currentLevel++;
        activeScene.snd_walk.setVolume(0);
        activeScene.gameStarted = false;
        activeScene.physics.pause();
        activeScene.player.anims.play("front");
        activeScene.tweens.add({
          targets: darkenLayer,
          duration: 250,
          alpha: 1,
          onComplete: function () {
            prepareWorld();
            newLavelTransition();
            activeScene.snd_walk.setVolume(5);
          },
        });
      }
    };
    this.physics.add.overlap(this.player, coins, collectCoin, null, this);

    var currentLevel = 3;
    this.gameStarted = false;

    var prepareWorld = function () {
      platforms.clear(true, true);
      resetPlayerPosition();

      for (let i = -4; i <= 4; i++) {
        platforms.create(
          X_POSITION.CENTER + groundSize.width * i,
          Y_POSITION.BOTTOM - groundSize.height / 2,
          "ground"
        );
      }

      if (currentLevel == 1) {
        platforms.create(150 - relativeSize.w, 250, "ground");
        platforms.create(780 + relativeSize.w, 250, "ground");
        platforms.create(
          250 + groundTemp.width / 2 + relativeSize.w,
          350,
          "ground"
        );
        platforms.create(
          650 + groundTemp.width / 2 - relativeSize.w,
          480,
          "ground"
        );
        platforms.create(
          845 + groundTemp.width / 2 - relativeSize.w,
          480,
          "ground"
        );
        platforms.create(
          550 + groundTemp.width / 2 + relativeSize.w,
          584,
          "ground"
        );
      } else if (currentLevel == 2) {
        platforms.create(480 - relativeSize.w, 250, "ground");
        platforms.create(1075 - relativeSize.w, 380, "ground");
        platforms.create(500 - relativeSize.w, 600, "ground");
        platforms.create(975 - relativeSize.w, 500, "ground");
        platforms.create(200 - relativeSize.w, 350, "ground");
        platforms.create(335 - relativeSize.w, 500, "ground");
        platforms.create(25 - relativeSize.w, 600, "ground");
        platforms.create(440 - relativeSize.w, 600, "ground");
        platforms.create(230 - relativeSize.w, 670, "ground");
      } else if (currentLevel == 3) {
        platforms.create(150 - relativeSize.w, 250, "ground");
        platforms.create(
          550 + groundTemp.width / 2 + relativeSize.w,
          584,
          "ground"
        );
        platforms.create(350 - relativeSize.w, 350, "ground");
        platforms.create(950 - relativeSize.w, 422, "ground");
        platforms.create(
          720 + groundTemp.width / 2 + relativeSize.w,
          280,
          "ground"
        );
      } else if (currentLevel == 4) {
        platforms.create(150 - relativeSize.w, 250, "ground");
        platforms.create(780 + relativeSize.w, 250, "ground");
        platforms.create(
          250 + groundTemp.width / 2 + relativeSize.w,
          350,
          "ground"
        );
        platforms.create(
          650 + groundTemp.width / 2 - relativeSize.w,
          480,
          "ground"
        );
        platforms.create(
          845 + groundTemp.width / 2 - relativeSize.w,
          480,
          "ground"
        );
        platforms.create(
          550 + groundTemp.width / 2 + relativeSize.w,
          584,
          "ground"
        );
      } else if (currentLevel == 5) {
        platforms.create(480 - relativeSize.w, 250, "ground");
        platforms.create(1075 - relativeSize.w, 380, "ground");
        platforms.create(500 - relativeSize.w, 600, "ground");
        platforms.create(975 - relativeSize.w, 500, "ground");
        platforms.create(200 - relativeSize.w, 350, "ground");
        platforms.create(335 - relativeSize.w, 500, "ground");
        platforms.create(25 - relativeSize.w, 600, "ground");
        platforms.create(440 - relativeSize.w, 600, "ground");
        platforms.create(230 - relativeSize.w, 670, "ground");
      }

      coins.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.3));
        child.enableBody(true, child.x, -100, true, true);
      });

      if (currentLevel > 2) {
        var x = Phaser.Math.Between(100, game.canvas.width - 100);
        var enemy = enemies.create(
          x,
          -100,
          "enemy" + Phaser.Math.Between(1, 3)
        );
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
        enemy.setVelocity(Phaser.Math.Between(-200, 200), 20);
        enemy.allowGravity = false;
      }
    };
    var newLavelTransition = function () {
      var levelTransitionText = activeScene.add.text(
        activeScene.game.canvas.width / 2,
        activeScene.game.canvas.height / 2,
        "Level " + currentLevel,
        {
          fontFamily: "Verdana, Arial",
          fontSize: "42px",
          color: "#ffffff",
        }
      );

      levelTransitionText.setOrigin(0.5);
      levelTransitionText.setDepth(10);
      levelTransitionText.setAlpha(0);

      activeScene.snd_leveling.play();

      activeScene.tweens.add({
        targets: levelTransitionText,
        duration: 1000,
        alpha: 1,
        yoyo: true,
        onComplete: function () {
          levelTransitionText.destroy();
        },
      });

      activeScene.tweens.add({
        targets: darkenLayer,
        delay: 2000,
        alpha: 0,
        duration: 250,
        onComplete: function () {
          activeScene.gameStarted = true;
          activeScene.physics.resume();
        },
      });
    };

    var enemies = this.physics.add.group();

    var hitEnemy = function (player, enemy) {
      this.physics.pause();
      player.setTint(0xff0000);

      darkenLayer.setDepth(9);
      darkenLayer.setAlpha(0);

      this.tweens.add({
        targets: darkenLayer,
        alpha: 0.75,
        duration: 500,
      });

      const gameOverImage = this.add.image(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 200,
        "gameover"
      );
      gameOverImage.setOrigin(0.5);
      gameOverImage.setDepth(10);
      gameOverImage.setAlpha(0);

      // Fade-in Game Over
      this.tweens.add({
        targets: gameOverImage,
        alpha: 1,
        duration: 500,
        delay: 200,
      });

      // Tambahkan tombol restart
      const restartImage = this.add.image(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 50,
        "btn_play"
      );
      restartImage.setOrigin(0.5);
      restartImage.setDepth(10);
      restartImage.setAlpha(0);
      restartImage.setScale(0.75);
      restartImage.setInteractive();

      // Fade-in tombol restart
      this.tweens.add({
        targets: restartImage,
        alpha: 1,
        duration: 500,
        delay: 400,
      });

      // Restart game saat tombol diklik
      restartImage.on("pointerdown", () => {
        this.scene.start("scenePlay");
      });
    };

    // Tambahkan collider musuh dengan player
    this.physics.add.collider(this.player, enemies, hitEnemy, null, this);

    // Dunia awal
    prepareWorld();

    // Collider musuh ke platform
    this.physics.add.collider(enemies, platforms);

    this.physics.pause();
  },

  update: function () {
    if (!this.gameStarted) {
      this.snd_walk.setVolume(0);
      return;
    }

    isJumpPressed =
      this.keyWAD.up.isDown || this.cursors.up.isDown || this.spaceKey.isDown;

    if (isJumpPressed && this.player.body.touching.down) {
      this.player.setVelocityY(-510);
      this.snd_jump.play();
    }

    if (this.keyWAD.right.isDown || this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      if (this.player.body.touching.down) {
        this.player.anims.play("right", true);
        this.snd_walk.setVolume(5);
      }
    } else if (this.keyWAD.left.isDown || this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      if (this.player.body.touching.down) {
        this.player.anims.play("left", true);
        this.snd_walk.setVolume(5);
      }
    } else {
      this.player.setVelocityX(0);
      if (this.player.body.touching.down) {
        this.player.anims.play("front");
        this.snd_walk.setVolume(0);
      }
    }

    if (!this.player.body.touching.down) {
      if (this.player.body.velocity.x > 0) {
        this.player.anims.play("jumpRight");
      } else if (this.player.body.velocity.x < 0) {
        this.player.anims.play("jumpLeft");
      } else {
        this.player.anims.play("front");
      }
      this.snd_walk.setVolume(0);
    }
  },
});
