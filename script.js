enchant();

window.onload = function () {
    const game = new Game(400, 500); //画面サイズを400*500にする。（このサイズだとスマホでも快適なのでおススメ）

    /////////////////////////////////////////////////
    //ゲーム開始前に必要な画像・音を読み込む部分

    const imgUrls = [];
    imgUrls.push("");
    for (let i = 1; i <= 6; i++) {
        const imgUrl = `image/image${i}.png`;
        imgUrls.push(imgUrl);
    }
    game.preload(imgUrls);

    //読み込み終わり
    /////////////////////////////////////////////////

    game.onload = function () {
        //ロードが終わった後にこの関数が呼び出されるので、この関数内にゲームのプログラムを書こう

        /////////////////////////////////////////////////
        //グローバルで値が変更しうる変数群
        let score = 0; //スコア
        let monsters = []; //モンスタースプライトを管理する配列

        //グローバル変数終わり
        /////////////////////////////////////////////////

        // mainSceneを画面にセットする関数
        const setMainScene = function () {
            const mainScene = new Scene(); //シーン作成
            game.pushScene(mainScene); //mainSceneシーンオブジェクトを画面に設置
            mainScene.backgroundColor = "grey"; //mainSceneシーンの背景は黒くした

            // グローバル変数の初期化
            score = 0; // スコアの初期化を行う
            monsters = []; //登場しているモンスター配列を空にする

            //テキスト
            const scoreText = new Label(); //テキストはLabelクラス
            scoreText.font = "20px Meiryo"; //フォントはメイリオ 20px 変えたかったらググってくれ
            scoreText.color = "rgba(255,255,255,1)"; //色　RGB+透明度　今回は白
            scoreText.width = 400; //横幅指定　今回画面サイズ400pxなので、width:400pxだと折り返して二行目表示してくれる
            scoreText.moveTo(0, 30); //移動位置指定
            mainScene.addChild(scoreText); //mainSceneシーンにこの画像を埋め込む

            scoreText.text = "現在：" + score; //テキストに文字表示 scoreは変数なので、ここの数字が増える
            ///////////////////////////////////////////////////
            //メインループ　ここに主要な処理をまとめて書こう
            mainScene.time = 0; //mainScene内で使用するカウント用変数
            mainScene.onenterframe = function () {
                scoreText.text = "現在：" + score; //テキストに文字表示 scoreは変数なので、ここの数字が増える
                this.time++; //毎フレームカウントを１増やす
                if (this.time >= 60 - score) {
                    //カウントが６０-scoreを超えたら
                    this.time = 0;

                    const monster = new Sprite(32, 32); //スライムを配置
                    monster.image = game.assets[imgUrls[5]]; //スライム画像
                    monster.y = 0; //出現Y座標
                    monster.x = Math.random() * 380; //出現X座標
                    monster.id = new Date().getTime().toString(16) + Math.random().toString(16); // bombに乱数と時刻を用いたユニークな固有idを代入する(uuidといいます)
                    mainScene.addChild(monster); //mainSceneシーンに追加
                    monster.number = monsters.length; //自分がmonstersのどこにいるか覚えておく(削除するときに使う)
                    monsters.push(monster); //monsters（モンスター管理用配列）に格納
                    monster.onenterframe = function () {
                        //モンスターの動作
                        this.y += 2; //下に降りる
                        if (this.y >= 500) {
                            //画面下に入ったら
                            game.popScene(); //mainSceneシーンを外して
                            setEndScene(); // endSceneを呼び出す
                        }
                        if (this.frame == 2) this.frame = 0;
                        //フレームを動かす処理
                        else this.frame++; //もし3フレーム以内なら次のフレームを表示
                    };
                }
            };

            ///////////////////////////////////////////////////
            //クリックで球を発射
            mainScene.ontouchend = function () {
                const bomb = new Sprite(16, 16); //爆弾画像のspriteを宣言（数字は縦横サイズ）
                bomb.image = game.assets[imgUrls[4]]; //爆弾画像
                bomb.moveTo(hero.x, hero.y); //自機の位置に持ってくる
                mainScene.addChild(bomb); //mainSceneシーンに貼る
                bomb.onenterframe = function () {
                    //毎フレーム毎に実行
                    this.y -= 5; //上に進む
                    for (const monster of monsters) {
                        // この爆弾と全モンスターで円衝突の当たり判定を行う
                        // 円衝突は、二円の中心の距離が一定以下かどうかで判定する
                        // 爆弾、モンスターは正方形、この正方形の内接円で当たり判定を行う
                        const hitDistance = this.width / 2 + monster.width / 2; // ２円の半径を足した値を衝突チェックに使用する
                        const bombCenter = { x: this.x + 8, y: this.y + 8 }; // 爆弾の中心点
                        const monsterCenter = { x: monster.x + 8, y: monster.y + 8 }; // モンスターの中心点
                        const distance = Math.sqrt((bombCenter.x - monsterCenter.x) ** 2 + (bombCenter.y - monsterCenter.y) ** 2); // 二点の距離を三平方の定理から求めている
                        if (distance < hitDistance) {
                            // 当たり判定  二点の距離が二円の半径の和より短ければその円は衝突している
                            const effect = new Sprite(16, 16); //爆発エフェクト
                            effect.moveTo(monster.x, monster.y); //スライム画像と同じ位置に爆発エフェクトを設置
                            mainScene.addChild(effect); //mainSceneシーンに表示
                            effect.image = game.assets[imgUrls[6]]; //爆発画像
                            effect.onenterframe = function () {
                                // 爆発は毎フレームで画像を切り替えるの絵処理している
                                if (this.frame >= 5) this.parentNode.removeChild(this);
                                // 最後フレームまで表示したら画面から消滅する
                                else this.frame++; //そうでなかったら、フレームを１増やす
                            };
                            score++; //スコアを１足す
                            monster.parentNode.removeChild(monster); //スライムをmainSceneから外す
                            this.parentNode.removeChild(this); //thisは爆弾なので、爆弾を消す
                            monsters = monsters.filter((m) => m.id !== monster.id); // monstersという配列に今回削除したmonsterを消した配列を再代入する
                            return;
                        }
                    }
                    if (this.y < -50) this.parentNode.removeChild(this); //画面外に出たら、mainSceneシーンから外す。
                };
            };

            //自機
            const hero = new Sprite(32, 32); //自機のサイズのspriteを宣言（数字は縦横サイズ）
            hero.image = game.assets[imgUrls[3]]; //自機画像
            hero.moveTo(180, 400); //自機の位置
            mainScene.addChild(hero); //mainSceneシーンに貼る
            hero.time = 0; //Sin波で自機を左右に移動させるので、カウントが必要
            hero.onenterframe = function () {
                this.time++; //カウントを１増やす
                this.x = Math.sin(this.time / 10) * 180 + 180; //Sin波で自機を左右に移動させる
            };
            game.pushScene(mainScene); //mainSceneを画面に貼り付ける
        };

        // endSceneを画面にセットする関数
        const setEndScene = function () {
            ////////////////////////////////////////////////////////////////
            //結果画面
            const endScene = new Scene(); //endScene定義
            endScene.backgroundColor = "blue"; // 背景は青
            endScene.onenterframe = function () {
                gameoverText.text = score + "個スライムを倒した！";
            };

            //GAMEOVERというテキスト
            const gameoverText = new Label(); //テキストはLabelクラス
            gameoverText.font = "20px Meiryo"; //フォントはメイリオ 20px 変えたかったらググってくれ
            gameoverText.color = "rgba(255,255,255,1)"; //色　RGB+透明度　今回は白
            gameoverText.width = 400; //横幅指定　今回画面サイズ400pxなので、width:400pxだと折り返して二行目表示してくれる
            gameoverText.moveTo(0, 30); //移動位置指定
            endScene.addChild(gameoverText); //S_ENDシーンにこの画像を埋め込む

            //リトライボタン
            const retryBtn = new Sprite(120, 60); //画像サイズをここに書く。使う予定の画像サイズはプロパティで見ておくこと
            retryBtn.moveTo(50, 300); //コインボタンの位置
            retryBtn.image = game.assets[imgUrls[2]]; //読み込む画像の相対パスを指定。　事前にgame.preloadしてないと呼び出せない
            endScene.addChild(retryBtn); //mainSceneにこのコイン画像を貼り付ける

            retryBtn.ontouchend = function () {
                //retryBtnをタッチした（タッチして離した）時にこの中の内容を実行する
                game.popScene(); //現在セットしているシーンを外す
                setMainScene(); //メインシーンに移行する
            };

            //ツイートボタン
            const tweetBtn = new Sprite(120, 60); //画像サイズをここに書く。使う予定の画像サイズはプロパティで見ておくこと
            tweetBtn.moveTo(230, 300); //コインボタンの位置
            tweetBtn.image = game.assets[imgUrls[1]]; //読み込む画像の相対パスを指定。　事前にgame.preloadしてないと呼び出せない
            endScene.addChild(tweetBtn); //mainSceneにこのコイン画像を貼り付ける

            tweetBtn.ontouchend = function () {
                //tweetBtnボタンをタッチした（タッチして離した）時にこの中の内容を実行する
                //ツイートＡＰＩに送信
                //結果ツイート時にURLを貼るため、このゲームのURLをここに記入
                const url = encodeURI("https://twitter.com/hothukurou"); //きちんとURLがツイート画面に反映されるようにエンコードする
                window.open("http://twitter.com/intent/tweet?text=頑張って" + score + "個壊した&hashtags=ahoge&url=" + url); //ハッシュタグにahogeタグ付くようにした。
            };

            game.pushScene(endScene); // endSceneを画面に貼り付ける
        };

        // ゲーム最初はmainSceneを表示させたいので、setMainScene関数を呼び出す
        setMainScene();
    };
    game.start();
};
