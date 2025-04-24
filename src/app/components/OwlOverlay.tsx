// OwlOverlay.tsx
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Phaser from 'phaser';
import ViewerCount, { ViewerCountProvider, useViewerCount } from './ViewerCount';

export type OwlAction = 'walk' | 'sleep' | 'dance' | 'fly';

interface SceneWithAction extends Phaser.Scene {
    handleAction: (action: OwlAction) => void;
}

const OwlOverlay = forwardRef((props, ref) => {
    const count = useViewerCount();
    console.log('Current viewer count in OwlOverlay:', count);
    const gameRef = useRef<HTMLDivElement>(null);
    const phaserRef = useRef<SceneWithAction | null>(null);

    useImperativeHandle(ref, () => ({
        triggerAction(action: OwlAction) {
            phaserRef.current?.handleAction(action);
        }
    }));

    useEffect(() => {
        if (count === null) return;
        class OverlayScene extends Phaser.Scene implements SceneWithAction {
            owls: Phaser.Physics.Arcade.Sprite[] = [];

            preload() {
                this.load.spritesheet('owl-walk', '/assets/fly3.webp', { frameWidth: 64, frameHeight: 64 });
                this.load.spritesheet('owl-sleep', '/assets/fly3.webp', { frameWidth: 64, frameHeight: 64 });
                this.load.spritesheet('owl-dance', '/assets/fly3.webp', { frameWidth: 64, frameHeight: 64 });
                this.load.spritesheet('owl-fly', '/assets/fly3.webp', { frameWidth: 80, frameHeight: 64 });
                this.load.image('sparkle', '/assets/sparkle.png');
            }

            create() {
                this.physics.world.setBounds(0, 0, window.innerWidth, window.innerHeight);

                this.anims.create({ key: 'walk', frames: this.anims.generateFrameNumbers('owl-walk', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
                this.anims.create({ key: 'sleep', frames: this.anims.generateFrameNumbers('owl-sleep', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
                this.anims.create({ key: 'dance', frames: this.anims.generateFrameNumbers('owl-dance', { start: 0, end: 5 }), frameRate: 6, repeat: -1 });
                this.anims.create({ key: 'fly', frames: this.anims.generateFrameNumbers('owl-fly', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });

                const pastelColors = [0xffc1cc, 0xc1ffd7, 0xc1d8ff, 0xf6ffc1, 0xe0c1ff];

                const owlCount = count !== null ? (Math.min(200, Math.floor(count)) + 10): 50;
                for (let i = 0; i < owlCount; i++) {
                    const owl = this.physics.add.sprite(
                        Phaser.Math.Between(100, window.innerWidth - 100),
                        Phaser.Math.Between(100, window.innerHeight - 200),
                        'owl-fly'
                    );
                    owl.setScale(Phaser.Math.Between(1, 5)/5);
                    owl.play('fly');
                    owl.setTint(Phaser.Utils.Array.GetRandom(pastelColors));
                    const body = owl.body as Phaser.Physics.Arcade.Body | null;
                    if (body) {
                        body.setCollideWorldBounds(true);
                    }
                    this.owls.push(owl);
                }

                phaserRef.current = this;
                this.flyAllOwls();
            }

            handleAction(action: OwlAction) {
                if (action === 'fly') {
                    this.flyAllOwls();
                }
            }

            flyAllOwls() {
                this.owls.forEach(owl => {
                    const flyLoop = () => {
                        const newX = Phaser.Math.Between(50, window.innerWidth - 50);
                        const newY = Phaser.Math.Between(50, window.innerHeight - 150);

                        owl.setFlipX(newX < owl.x);

                        this.tweens.add({
                            targets: owl,
                            x: newX,
                            y: newY,
                            duration: Phaser.Math.Between(1000, 2500),
                            ease: 'Sine.easeInOut',
                            onComplete: () => {
                                flyLoop();
                                this.spawnSparkle(owl.x, owl.y);
                            }
                        });
                    };

                    flyLoop();
                });

                this.owls.forEach(owl => {
                    const body = owl.body as Phaser.Physics.Arcade.Body | null;
                    if (body) {
                        body.setBounce(1);
                        body.setVelocity(
                            Phaser.Math.Between(-100, 100),
                            Phaser.Math.Between(-100, 100)
                        );
                    }
                });

                this.owls.forEach((owl1, i) => {
                    for (let j = i + 1; j < this.owls.length; j++) {
                        const owl2 = this.owls[j];
                        // eslint-disable-next-line @typescript-eslint/no-this-alias
                        const scene = this;
                        this.physics.add.collider(owl1, owl2, () => {
                            const b1 = owl1.body as Phaser.Physics.Arcade.Body;
                            const b2 = owl2.body as Phaser.Physics.Arcade.Body;
                            const angle = Phaser.Math.Angle.Between(b1.x, b1.y, b2.x, b2.y);
                            b1.velocity.setToPolar(angle + Math.PI, b1.speed || 100);
                            b2.velocity.setToPolar(angle, b2.speed || 100);
                            scene.spawnSparkle((b1.x + b2.x) / 2, (b1.y + b2.y) / 2);
                        });
                    }
                });
            }

            spawnSparkle(x: number, y: number) {
                const sparkle = this.add.image(x, y, 'sparkle').setAlpha(0.7).setScale(0.1);
                this.tweens.add({
                    targets: sparkle,
                    alpha: 0,
                    duration: 800,
                    scale: 0.2,
                    ease: 'Cubic.easeOut',
                    onComplete: () => sparkle.destroy()
                });
            }
        }

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: gameRef.current!,
            transparent: true,
            physics: {
                default: 'arcade',
                arcade: { debug: false }
            },
            scene: OverlayScene
        };

        const game = new Phaser.Game(config);

        return () => {
            game.destroy(true);
        };
    }, [count]);

    return (
        <>
            <div ref={gameRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
        </>
    );
});

export default OwlOverlay;
