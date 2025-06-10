var scenePlay = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
      Phaser.Scene.call(this, { key: "scenePlay" });
    },
    init: function () {},
    preload: function () {
        this.load.setBaseURL('assets/');
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
        this.load.spritesheet("chara", "images/CharaSpriteAnim.png", {frameWidth: 44.8, frameHeight: 93});
    },
    create: function () {

    var currentLevel = 1;
    this.gameStarted = false;

    this.snd_coin = this.sound.add ('snd_coin');
    this.snd_jump = this.sound.add ('snd_jump');
    this.snd_leveling = this.sound.add ('snd_leveling');
    this.snd_lose = this.sound.add ('snd_lose');
    this.snd_touch = this.sound.add ('snd_touch');
	
	this.gameStarted = false;

    this.snd_walk = this.sound.add ('snd_walk');
    this.snd_walk.loop = true;
    this.snd_walk.setVolume(0);
    this.snd_walk.play();
    this.music_play = this.sound.add ('music_play');
    this.music_play.loop = true;
    
    var countCoin = 0;
	
    X_POSITION =
    { 
        'LEFT': 0,
        'CENTER': game.canvas.width / 2,
        'RIGHT': game.canvas.width,
    };
    
    Y_POSITION =
    {
        'TOP': 0,
        'CENTER': game.canvas.height / 2,
        'BOTTOM': game.canvas.height,
    };
    
    relativeSize = 
    {
      'w': ((game.canvas.width - layoutSize.w) / 2),
      'h': ((game.canvas.height - layoutSize.h) / 2)
    };
    

    var activeScene = this;
    this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, 'background');
    var coinPanel = this.add.image(X_POSITION.CENTER, 30, 'coin_panel');
    coinPanel.setDepth(10);
    
    var coinText = this.add.text(X_POSITION.CENTER, 30, '0', { 
        fontFamily: 'Verdana, Arial',
        fontSize: '37px',
        color: '#adadad'
    });
    coinText.setOrigin(0.5);
    coinText.setDepth(10);

    var darkenLayer = this.add.rectangle(X_POSITION.CENTER, Y_POSITION.CENTER, game.canvas.width, game.canvas.height, 0x000000);
    darkenLayer.setDepth(10);

    darkenLayer.alpha = 0.25;
    
    var buttonPlay = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, 'btn_play');
    buttonPlay.setDepth(10);

    buttonPlay.setInteractive();
    
    buttonPlay.on('pointerdown', function (pointer) 
    {
        this.setTint(0x5a5a5a);
    });
    
    // mendeteksi ketika pointer mouse berada diatas tombol Play dan
    // klik kiri pada mouse ditekan sambil menggeser ke luar area tombol.
    buttonPlay.on('pointerout', function (pointer) 
    {
        // mengubah tampilan tombol play menjadi terang kembali
        this.clearTint();
    });
    
    // mendeteksi ketika pointer mouse berada diatas tombol Play dan
    // klik kiri pada mouse ditekan, kemudian dilepaskan
    buttonPlay.on('pointerup', function (pointer) 
    {   
        
        // animasi untuk menghilangkan tampilan lapisan gelap dengan mengubah transparansinya 
        // menjadi 0 selama 250 milidetik dengan jeda sebelum animasi 150 milidetik
        activeScene.tweens.add({
            delay: 150,
            targets: darkenLayer,
            duration: 250,
            alpha : 0,
            onComplete: function(){
                
                // mengubah nilai variabel menjadi 'true',
                // sehingga status game terdeteksi sudah dimulai
                activeScene.gameStarted = true;
                
                // melanjutkan jeda sistem physics yang terjadi
                // semua pergerakan yang terjadi karena physics
                activeScene.physics.resume();
            }
        });
        
        // memainkan sound efek dengan nama aset
        // 'snd_touch' ketika tombol play diklik
        activeScene.snd_touch.play();
        
        // memainkan musik dengan nama aset
        // 'music_play' ketika tombol play diklik
        activeScene.music_play.play();
        
        // mengubah tampilan tombol play menjadi terang kembali
        this.clearTint();
        // animasi untuk menghilangkan tampilan tombol Play dengan
        // mengubah ukurannya menjadi 0 selama 250 milidetik
        activeScene.tweens.add({ 
            targets: this,
            ease: 'Back.In',
            duration: 250,
            scaleX : 0,
            scaleY : 0,
        });
        // animasi untuk menghilangkan tampilan lapisan gelap dengan mengubah transparansinya 
        // menjadi 0 selama 250 milidetik dengan jeda sebelum animasi 150 milidetik
        activeScene.tweens.add({
            delay: 150,
            targets: darkenLayer, 
            duration: 250,
            alpha : 0,
            onComplete: function(){
                activeScene.gameStarted = true;
            }
        });
    });
    
    // membuat variabel untuk menampung sprite yang nantinya akan diambil datanya
    let groundTemp = this.add.image(0, 0, 'ground').setVisible(false);
    
    // membuat variabel untuk menampung ukuran dari tiap gambar pijakan untuk
    // nantinya digunakan untuk membantu menentukan posisi-posisi dari tiap
    // pijakan yang akan ditambahkan ke dalam game.
    let groundSize = { 'width': groundTemp.width, 'height': groundTemp.height };
    
    // membuat group physics yang nantinya akan digunakan untuk
    // menampung pijakan-pijakan yang tidak akan bisa bergerak.
    var platforms = this.physics.add.staticGroup();
    
    // membuat 9 buah pijakan yang tersusun rapi, letaknya berada di tepi bawah dan
    // menampungnya ke dalam variabel group penampung dengan nama 'platforms'
    platforms.create(X_POSITION.CENTER - groundSize.width * 4, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
    platforms.create(X_POSITION.CENTER - groundSize.width * 3, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
    platforms.create(X_POSITION.CENTER - groundSize.width * 2, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
    platforms.create(X_POSITION.CENTER - groundSize.width, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
    platforms.create(X_POSITION.CENTER, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
    platforms.create(X_POSITION.CENTER + groundSize.width, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
    platforms.create(X_POSITION.CENTER + groundSize.width * 2, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
    platforms.create(X_POSITION.CENTER + groundSize.width * 3, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
    platforms.create(X_POSITION.CENTER + groundSize.width * 4, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
    
    // membuat pijakan-pijakan tambahan yang posisinya tersebar di layar
    platforms.create(groundTemp.width/2 + relativeSize.w, 384, 'ground');
    platforms.create(400 + relativeSize.w, 424, 'ground');
    platforms.create(1024 - groundTemp.width/2 + relativeSize.w, 480, 'ground');
    platforms.create(600 + relativeSize.w, 584, 'ground');
    
    // menambahkan sprite karakter dengan physics ke dalam game.
    this.player = this.physics.add.sprite(100, 500, 'chara');
    
    // menambahkan deteksi tubrukan antara karakter berdasarkan hukum
    // fisika dengan group pijakan (yang mewakili semua pijakan)
    this.physics.add.collider(this.player, platforms);
    
    // membuat objek partikel berdasarkan aset gambar yang sudah ada
    // kemudian menampungnya di dalam variabel 'partikelCoin'
    let partikelCoin = this.add.particles('coin');
    
    this.player.setGravity(0, 800); 
    
    // membuat karakter memantul dengan
    // toleransi pantulan sebesar '0.2'
    this.player.setBounce(0.2);
    
    // menambahkan deteksi input tombol arah yang pada keyboard
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // mengatifkam proteksi agar karakter tidak
    // bisa bergerak ke luar dari area layar
    this.player.setCollideWorldBounds(true);
    
    // menambahkan animasi berlari dengan menghadap ke
    // arah kiri ke dalam game, dengan nama 'left'
    this.anims.create({
        // membari nama animasi dengan 'left'
        key: 'left',
        
        // menentukan frame tampilan dari aset spritesheet bernama 'chara',
        // dan dengan urutan bingkai gambar pertama sampai ke-empat
        frames: this.anims.generateFrameNumbers('chara', { start: 0, end: 3 }),
        
        // menentukan kecepatan perpindahan tampilan dari bingkai 1 ke selanjutnya
        frameRate: 12,
        
        // menentukan animasi diulang terus-menerus (-1 untuk terus-menerus)
        repeat: -1
    });
    
    // menambahkan animasi berlari dengan menghadap ke
    // arah kanan ke dalam game, dengan nama 'right'
    this.anims.create({
        // membari nama animasi dengan 'right'
        key: 'right',
        
        // menentukan frame tampilan dari aset spritesheet bernama 'chara',
        // dan dengan urutan bingkai gambar ke-enam sampai ke-sembilan
        frames: this.anims.generateFrameNumbers('chara', { start: 5, end: 8 }),
        
        // menentukan kecepatan perpindahan tampilan dari bingkai 1 ke selanjutnya
        frameRate: 12,
        
        // menentukan animasi diulang terus-menerus (-1 untuk terus-menerus)
        repeat: -1
    });
    
    // menambahkan animasi menghadap ke arah depan ke
    // dalam game, dengan nama animasi 'front'
    this.anims.create({
        // membari nama animasi dengan 'front'
        key: 'front',
        
        // menentukan frame tampilan dari aset spritesheet bernama 'chara',
        // dan dengan urutan bingkai gambar ke-5 saja
        frames: [ { key: 'chara', frame: 4 } ],
        
        // menentukan kecepatan perpindahan tampilan dari bingkai 1 ke selanjutnya
        frameRate: 20
    });

    var coins = this.physics.add.group({
    
        // menentukan nama aset gambar yang akan digunakan sebagai sprite koin
        key: 'coin',
    
        // menentukan jumlah pengulangan pembuatan koin (secara default sudah dibuat 1)
        repeat: 9,
    
        // membuat setiap koin yang dibuat akan memantul dengan besaran toleransi yang acak
        setXY: { x: 60 + relativeSize.w, y: -100, stepX: 100 }
    });
    
    // membuat koin baru sekaligus membuat koin bisa memantul
    // berdasarkan elastisitas yang ditentukan secara acak
    coins.children.iterate(function (child) 
    {
        // membuat setiap koin yang dibuat akan memantul dengan
        // toleransi yang diacak mulai dari 0.2 s/d 0.3
        child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.3));
    });
    
    // menambahkan deteksi tubrukan antara koin dengan
    // pijakan berdasarkan hukum fisika
    this.physics.add.collider(coins, platforms);
    
    // fungsi untuk menampilkan transisi jika sedang berganti level
    var newLevelTransition = function()
    {
        // menambahkan tampilan teks keterangan 
        var levelTransitionText = activeScene.add.text(X_POSITION.CENTER, Y_POSITION.CENTER, 'Level ' + currentLevel, { 
            fontFamily: 'Verdana, Arial',
            fontSize: '40px',
            color: '#ffffff'
        });
        levelTransitionText.setOrigin(0.5);
        levelTransitionText.setDepth(10);
        levelTransitionText.alpha = 0;
        
        // memainkan sound efek dengan nama aset
        // 'snd_touch' ketika tombol play diklik
        activeScene.snd_leveling.play();        
        
        
        // animasi untuk menyembunyikan background gelap-transparan dengan menggunakan tween
        activeScene.tweens.add({
            targets: levelTransitionText,
            duration: 1000,
            alpha : 1,
            yoyo : true,
            onComplete: function(){
                
                // menghapus dan menghilangkan teks transisi level
                levelTransitionText.destroy();
            }
        });
        
        // animasi untuk menyembunyikan background gelap-transparan dengan menggunakan tween
        activeScene.tweens.add({
            delay: 2000,
            targets: darkenLayer,
            duration: 250,
            alpha : 0,
            onComplete: function(){
                
                // mengubah nilai variabel 'gamestarter' menjadi 'true' kembali
                activeScene.gamestarted = true;
                
                // melanjutkan jeda sistem physics yang terjadi semua pergerakan yang terjadi karena physics
                activeScene.physics.resume();
                
            }
        });
    };
            
        // fungsi untuk menampilkan transisi jika kalah
        var Gameover = function()
        {
            // menambahkan tampilan gameover 
            var gim = activeScene.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, 'gameover');
            gim.setOrigin(0.5);
            gim.setDepth(10);
            gim.setScale(0);
        
            // animasi untuk animasi gameover
            activeScene.tweens.add({
                targets: gim,
                ease: 'Elastic',
                duration: 2000,
                delay: 100,
                
                scaleX: 1,
                scaleY: 1,
                onComplete: function(){
                    currentLevel = 1;
                    activeScene.music_play.setVolume(0);
                    activeScene.scene.start('scenePlay');
                }
            });
        };
        
    // fungsi untuk mendeteksi ketika terjadi tubrukan antara koin dengan karakter
    var collectCoin = function(player, coin)
    {
        // menambahkan nilai sebanyak 10 koin baru ke dalam variabel 'countCoin '
        countCoin += 10;
        
        // memainkan sound efek koin ketika terjadi
        // tubrukan antara karakter dengan koin
        activeScene.snd_coin.play();
        coinText.setText(countCoin);
        coin.disableBody(true, true);
        
        if (coins.countActive(true) === 0)
        { 
            // menambahkan nilai level seakarang sebanyak 1
            currentLevel++;
            
            // mengatur valume untuk sound efek berjalan menjadi 0
            activeScene.snd_walk.setVolume(0);
                
            // mengubah nilai variabel 'gamestarter' menjadi 'false'
            activeScene.gamestarted = false;
                
            // menjeda semua pergerakan yang terjadi karena physics
            activeScene.physics.pause();
            
            // menjalankan animasi untuk membuat tampilan
            // dari karakter menjadi menghadap ke depan 
            activeScene.player.anims.play('turn');
            
            // animasi untuk memunculkan background gelap-transparan dengan menggunakan tween
            activeScene.tweens.add({
                targets: darkenLayer,
                duration: 250,
                alpha : 1,
                onComplete: function(){
                        
                    // memanggil fungsi untuk membuat tampilan
                    prepareWorld();
                        
                    // memanggil fungsi untuk menjalankan 
                    // animasi transisi ketika level berganti
                    newLevelTransition();
                }
            }); 
        }
    };
    
    // melakukan pengecekan jika karakter utama
    // melewati objek koin, maka fungsi dengan
    // nama 'collectCoin' akan terpanggil
    this.physics.add.overlap(this.player, coins, collectCoin, null, this);

    // fungsi untuk membuat tampilan area bermain
    // berdasarkan level yang sedang aktif
    var prepareWorld = function() {
        
        // memastikan untuk membersihkan group yang
        // digunakan untuk menampung pijakan-pijakan
        // yang mungkin sudah pernah dibuat.
        platforms.clear(true, true);
        
        // menampilan koin baru sekaligus membuat koin bisa memantul
        // berdasarkan elastisitas yang ditentukan secara acak
        coins.children.iterate(function (child) 
        {
            // membuat setiap koin yang dibuat akan memantul dengan
            // toleransi yang diacak mulai dari 0.2 s/d 0.3
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.3));
            
            // mengaktifkan hukum fisika pada koin supaya
            // dapat terkena efek gravitasi dan kemudian turun 
            child.enableBody(true, child.x, -100, true, true);
        });
        
        // membuat 9 buah pijakan yang tersusun rapi, letaknya berada di tepi bawah dan
        // menampungnya ke dalam variabel group penampung dengan nama 'platforms'
        platforms.create(X_POSITION.CENTER - groundSize.width * 4, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
        platforms.create(X_POSITION.CENTER - groundSize.width * 3, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
        platforms.create(X_POSITION.CENTER - groundSize.width * 2, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
        platforms.create(X_POSITION.CENTER - groundSize.width, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
        platforms.create(X_POSITION.CENTER, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
        platforms.create(X_POSITION.CENTER + groundSize.width, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
        platforms.create(X_POSITION.CENTER + groundSize.width * 2, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
        platforms.create(X_POSITION.CENTER + groundSize.width * 3, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
        platforms.create(X_POSITION.CENTER + groundSize.width * 4, Y_POSITION.BOTTOM - groundSize.height/2, 'ground');
        
        // melakukan pengecekan jika level yang
        // sedang aktif adalah level "1"
        if (currentLevel == 1)
        {
            // membuat pijakan-pijakan tambahan untuk level 1 yang posisinya tersebar di layar
            platforms.create(groundTemp.width/2 + relativeSize.w, 384, 'ground');
            platforms.create(400 + relativeSize.w, 424, 'ground');
            platforms.create(1024 - groundTemp.width/2 + relativeSize.w, 480, 'ground');
            platforms.create(600 + relativeSize.w, 584, 'ground');
        }
        
        // melakukan pengecekan jika level yang
        // sedang aktif adalah level "2"
        else if (currentLevel == 2)
        {
            // membuat pijakan-pijakan tambahan untuk level 2 yang posisinya tersebar di layar
            platforms.create(80 + relativeSize.w, 284, 'ground');
            platforms.create(230 + relativeSize.w, 184, 'ground');
            platforms.create(390 + relativeSize.w, 284, 'ground');
            platforms.create(990 + relativeSize.w, 360, 'ground');    
            platforms.create(620 + relativeSize.w, 430, 'ground');
            platforms.create(900 + relativeSize.w, 570, 'ground');
        }
        
        // melakukan pengecekan jika level yang
        // sedang aktif adalah selain level "1" level "2"
        else
        {
            // membuat pijakan tambahan untuk level 3
            platforms.create(80 + relativeSize.w, 230, 'ground');
            platforms.create(230 + relativeSize.w, 230, 'ground');
            platforms.create(1040 + relativeSize.w, 280, 'ground');
            platforms.create(600 + relativeSize.w, 340, 'ground');    
            platforms.create(400 + relativeSize.w, 420, 'ground'); 
            platforms.create(930 + relativeSize.w, 430, 'ground');
            platforms.create(820 + relativeSize.w, 570, 'ground'); 
            platforms.create(512 + relativeSize.w, 590, 'ground');
            platforms.create(0 + relativeSize.w, 570, 'ground');
        }
        
        // melakukan pengecekan terhadap level yang
        // sedang aktif, jika level lebih dari 2, maka
        // akan muncul musuh di setiap pertambahan levelnya
        if (currentLevel > 3)
        {
            // menentukan posisi horizontal (titik x) dari musuh yang akan muncul secara acak dari titik 100 sampai di lebar dari layar dikurangi 100.
            var x = Phaser.Math.Between(100, game.canvas.width - 100);
            
            // membuat musuh baru yang akan muncul karena level lebih dari 2
            var enemy = enemies.create(x, -100, 'enemy' + Phaser.Math.Between(1, 3));
            enemy.setBounce(1);
            enemy.setCollideWorldBounds(true);
            
            // memberikan nilai percepatan untuk membuat musuh
            // langsung bergerak secara acak ketika muncul 
            enemy.setVelocity(Phaser.Math.Between(-200, 200), 20);
            
            // membuat supaya efek gravitasi tidak berlaku pada
            // sprite musuh, sehingga bisa bergerak bebas seperti balon
            enemy.allowGravity = false;
        }
    };
    
    // mempersiapkan area bermain untuk pertama kali dengan
    // memanggil fungsi 'prepareWorld'
    prepareWorld();
    
    var enemies = this.physics.add.group();
    this.physics.add.collider(enemies, platforms);
    
    // fungsi untuk mendeteksi ketika terjadi tubrukan antara musuh dengan karakter utama
    var hitEnemy = function(player, enemy)
    {
        // menjeda semua pergerakan yang terjadi karena physics
        this.physics.pause();
    
        // membuat karakater berubah warna menjadi merah
        this.player.setTint(0xff0000);
        
        // animasi untuk memunculkan background gelap-transparan dengan menggunakan tween
        activeScene.tweens.add({
            targets: darkenLayer,
            duration: 250,
            alpha : 0.5,
            onComplete: function(){
                activeScene.snd_lose.play();
                Gameover();
            }
        }); 
    }
    this.physics.add.collider(this.player, enemies, hitEnemy, null, this);
    this.physics.pause();
    },
    update: function () {
        if (!this.gameStarted)
            {
                return;
            }
            
            if (this.gameStarted) {
                
            if (this.cursors.right.isDown)
            {
                this.player.setVelocityX(200);
                this.snd_walk.setVolume(1);
            }
            
            else if (this.cursors.left.isDown)
            {
                this.player.setVelocityX(-200);
                this.snd_walk.setVolume(1);
            }
            
            else
            {
                this.player.setVelocityX(0);
                this.player.anims.play('front');
                this.snd_walk.setVolume(0);
            }
            
            if (this.cursors.up.isDown && this.player.body.touching.down)
            {
                this.player.setVelocityY(-650);
            }
        
            if (this.cursors.right.isDown)
            {
                this.player.anims.play('right', true);
            }
            
            else if (this.cursors.left.isDown)
            {
                this.player.anims.play('left', true);
            }
            if (this.cursors.up.isDown && this.player.body.touching.down)
            {
                this.snd_jump.play();
            }
        }
    }
  });
  