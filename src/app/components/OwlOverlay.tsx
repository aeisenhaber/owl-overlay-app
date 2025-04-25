// OwlOverlay.tsx
import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import Phaser from 'phaser';
import {useViewerCount} from '@/app/context/ViewerCount.context';
import {useTwitchChat} from "@/app/hooks/useTwitchChat";
import {useChatterColor} from "@/app/context/ChatColorContext";

export type OwlAction = 'walk' | 'sleep' | 'dance' | 'fly';

interface SceneWithAction extends Phaser.Scene {
    handleAction: (action: OwlAction) => void;
}

interface Chatter {
    user_id: number;
    user_name: string;
}

const OwlOverlay = forwardRef((props, ref) => {
    const count = useViewerCount();
    const { getColor } = useChatterColor();

    const gameRef = useRef<HTMLDivElement>(null);
    const phaserRef = useRef<SceneWithAction | null>(null);
    const messages = useTwitchChat();

    useImperativeHandle(ref, () => ({
        triggerAction(action: OwlAction) {
            phaserRef.current?.handleAction(action);
        }
    }));

    const [chatters, setChatters] = useState<Chatter[]>([]);

    useEffect(() => {
        const fetchChatters = async () => {
            const res = await fetch('/api/chatters');
            const data = await res.json();
            console.log('chatter data', data)
            setChatters(data.chatters);
        };

        fetchChatters();
        const interval = setInterval(fetchChatters, 30000);

        return () => clearInterval(interval);
    }, []);



    useEffect(() => {
        if (!chatters || chatters.length === 0) {
            return;
        }
        class OverlayScene extends Phaser.Scene implements SceneWithAction {
            owls: { sprite: Phaser.Physics.Arcade.Sprite, name: Phaser.GameObjects.Text }[] = [];
            preload() {
                this.load.spritesheet('owl-walk', '/assets/fly3.webp', { frameWidth: 64, frameHeight: 64 });
                this.load.spritesheet('owl-sleep', '/assets/fly3.webp', { frameWidth: 64, frameHeight: 64 });
                this.load.spritesheet('owl-dance', '/assets/fly3.webp', { frameWidth: 64, frameHeight: 64 });
                this.load.spritesheet('owl-fly', '/assets/fly3.webp', { frameWidth: 80, frameHeight: 64 });
                this.load.image('sparkle', '/assets/sparkle.png');
            }

            async create() {
                console.log('create');
                this.physics.world.setBounds(0, 0, window.innerWidth, window.innerHeight);

                this.anims.create({ key: 'walk', frames: this.anims.generateFrameNumbers('owl-walk', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
                this.anims.create({ key: 'sleep', frames: this.anims.generateFrameNumbers('owl-sleep', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
                this.anims.create({ key: 'dance', frames: this.anims.generateFrameNumbers('owl-dance', { start: 0, end: 5 }), frameRate: 6, repeat: -1 });
                this.anims.create({ key: 'fly', frames: this.anims.generateFrameNumbers('owl-fly', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });

                const owlCount = count !== null ? Math.min(200, Math.floor(count)) : 50;

                // 🛠 await all owl spawns
                await Promise.all(chatters.map(async (chatter) => {
                    const owl = this.physics.add.sprite(
                        Phaser.Math.Between(100, window.innerWidth - 100),
                        Phaser.Math.Between(100, window.innerHeight - 200),
                        'owl-fly'
                    );
                   // owl.setScale(Phaser.Math.Between(1, 5) / 5);

                    const color = await getColor(chatter.user_id);
                    owl.setTint(Phaser.Display.Color.HexStringToColor(color).color);

                    const nameText = this.add.text(owl.x, owl.y - 30, chatter.user_name, {
                        font: '12px Arial',
                        color: '#ffffff',
                        backgroundColor: '#00000088',
                        padding: { left: 4, right: 4, top: 2, bottom: 2 },
                        align: 'center'
                    }).setOrigin(0.5)
                        .setShadow(1, 1, '#000000', 2, true, true); ;

                    const body = owl.body as Phaser.Physics.Arcade.Body | null;
                    if (body) {
                        body.setCollideWorldBounds(true);
                    }
                    owl.play('fly');
                    this.owls.push({ sprite: owl, name: nameText });
                }));

                phaserRef.current = this;

                this.flyAllOwls();
            }
            update() {
                this.owls.forEach(({ sprite, name }) => {
                    name.x = sprite.x;
                    name.y = sprite.y - 40;
                });
            }
            handleAction(action: OwlAction) {
                if (action === 'fly') {
                    this.flyAllOwls();
                }
            }

            flyAllOwls() {
                this.owls.forEach(({ sprite, name }) => {
                    const flyLoop = () => {
                        const newX = Phaser.Math.Between(50, window.innerWidth - 50);
                        const newY = Phaser.Math.Between(50, window.innerHeight - 150);

                        sprite.setFlipX(newX < sprite.x);

                        // Move the sprite
                        this.tweens.add({
                            targets: sprite,
                            x: newX,
                            y: newY,
                            duration: Phaser.Math.Between(1000, 2500),
                            ease: 'Sine.easeInOut',
                            onComplete: () => {
                                flyLoop();
                                this.spawnSparkle(sprite.x, sprite.y);
                            }
                        });

                        // Move the name label separately
                        this.tweens.add({
                            targets: name,
                            x: newX,
                            y: newY - 40, // ✅ 40px ABOVE the owl
                            duration: Phaser.Math.Between(1000, 2500),
                            ease: 'Sine.easeInOut',
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
                const sparkle = this.add.image(x, y, 'sparkle').setAlpha(0.7).setScale(0.01);
                this.tweens.add({
                    targets: sparkle,
                    alpha: 0,
                    duration: 800,
                    scale: 0.05,
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
    }, [chatters]);

    return (
        <>
            <div className="absolute bottom-4 left-4 bg-black/70 rounded p-2 max-w-md text-white text-sm space-y-1">
                {messages.map((m, i) => (
                    <div key={i}><strong>{m.user}:</strong> {m.message}</div>
                ))}

            </div>

            <div ref={gameRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
        </>
    );
});

export default OwlOverlay;
