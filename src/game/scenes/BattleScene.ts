import Phaser from 'phaser';
import {
  ATB_MAX,
  Battler,
  applyDefensiveMultiplier,
  computeBasicAttack,
  computeSpellDamage,
  ATBEngine,
  SPELLBOOK,
  type Spell,
  type CombatStats,
} from '@core/index.js';
import { GameEvents, RegistryKeys, SceneKeys, TextureKeys } from '../keys.js';
import { makeButton } from '../ui/Button.js';
import { StatBar } from '../ui/StatBar.js';
import { ProjectilePool } from '../objects/ProjectilePool.js';
import type {
  SaveData,
  SaveRepository,
} from '@infra/persistence/SaveRepository.js';
import type {
  NBackResolvedPayload,
  StroopResolvedPayload,
  NBackRequestPayload,
  StroopRequestPayload,
} from '../events.js';

interface BattlerView {
  readonly battler: Battler;
  readonly sprite: Phaser.GameObjects.Image;
  readonly hpBar: StatBar;
  readonly atbBar: StatBar;
  readonly nameLabel: Phaser.GameObjects.Text;
}

/**
 * BattleScene — the core combat arena.
 *
 *  - Owns the ATBEngine (pure domain).
 *  - Renders ATB and HP bars for player and enemy.
 *  - On player turn: shows action menu. Spell → emits RequestNBack to
 *    the UI overlay; awaits ResolvedNBack; applies damage.
 *  - On enemy turn: emits RequestStroop; awaits ResolvedStroop; applies
 *    mitigated damage.
 *  - Pauses the ATB engine while a cognitive overlay is active so the
 *    science is preserved (no time pressure during the assessment).
 */
export class BattleScene extends Phaser.Scene {
  private engine!: ATBEngine;
  private player!: BattlerView;
  private enemy!: BattlerView;
  private pool!: ProjectilePool;
  private actionMenu: Phaser.GameObjects.Container | null = null;
  private bannerText!: Phaser.GameObjects.Text;
  /** Whether a cognitive overlay is currently consuming input. */
  private overlayActive = false;
  /** Per-spell n-back accuracy history for adaptive load scaling. */
  private nBackHistory: number[] = [];
  private uiScene!: Phaser.Scene;

  constructor() {
    super({ key: SceneKeys.Battle });
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0x070b14);
    this.drawArena();

    const save = this.registry.get(RegistryKeys.Save) as SaveData;
    const playerStats = save.stats;
    const enemyStats = this.scaleEnemyStats(save.level);

    const playerBattler = new Battler({
      id: 'player',
      name: save.playerName,
      side: 'player',
      stats: playerStats,
    });
    const enemyBattler = new Battler({
      id: 'enemy',
      name: 'Voidshade',
      side: 'enemy',
      stats: enemyStats,
    });

    this.player = this.makeView(playerBattler, width / 2, height - 380, false);
    this.enemy = this.makeView(enemyBattler, width / 2, 360, true);

    this.engine = new ATBEngine([playerBattler, enemyBattler]);
    this.pool = new ProjectilePool(this, 16);

    // Banner for status messages.
    this.bannerText = this.add
      .text(width / 2, height / 2, '', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '32px',
        color: '#ffd166',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Launch the parallel UI overlay scene.
    if (!this.scene.isActive(SceneKeys.UIOverlay)) {
      this.scene.launch(SceneKeys.UIOverlay);
    }
    this.uiScene = this.scene.get(SceneKeys.UIOverlay);
    this.uiScene.events.on(GameEvents.ResolvedNBack, this.onNBackResolved, this);
    this.uiScene.events.on(GameEvents.ResolvedStroop, this.onStroopResolved, this);

    // Defensive cleanup if the scene is shut down mid-overlay.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.uiScene.events.off(GameEvents.ResolvedNBack, this.onNBackResolved, this);
      this.uiScene.events.off(
        GameEvents.ResolvedStroop,
        this.onStroopResolved,
        this,
      );
    });
  }

  // ─── Per-frame ATB advancement and turn dispatch ────────────────────
  override update(_time: number, deltaMs: number): void {
    if (!this.engine) return;
    this.engine.tick(deltaMs);
    this.refreshBars();

    if (!this.overlayActive && !this.actionMenu) {
      const turn = this.engine.peekTurn();
      if (turn === 'player') {
        this.openPlayerActionMenu();
      } else if (turn === 'enemy') {
        this.beginEnemyTurn();
      }
    }
  }

  // ─── Visual setup ──────────────────────────────────────────────────
  private drawArena(): void {
    const { width, height } = this.scale;
    // Floor band.
    this.add.rectangle(width / 2, height - 160, width, 280, 0x0a1322);
    // Horizon glow.
    this.add
      .rectangle(width / 2, height - 300, width * 0.7, 6, 0x4cc9f0, 0.5)
      .setOrigin(0.5);
  }

  private makeView(
    battler: Battler,
    x: number,
    y: number,
    isEnemy: boolean,
  ): BattlerView {
    const tex = isEnemy ? TextureKeys.EnemyIdle : TextureKeys.HeroIdle;
    const sprite = this.add.image(x, y, tex).setOrigin(0.5, 1);
    sprite.y = y + sprite.height / 2; // anchor on baseline

    // Idle bob.
    this.tweens.add({
      targets: sprite,
      y: sprite.y - 6,
      duration: isEnemy ? 1400 : 1100,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    const labelY = sprite.y - sprite.displayHeight - 80;
    const nameLabel = this.add
      .text(x, labelY, battler.name, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '22px',
        color: isEnemy ? '#ff8c9d' : '#9bd9ff',
      })
      .setOrigin(0.5);

    const hpY = labelY + 28;
    const hpBar = new StatBar(this, x - 140, hpY, 280, 14, isEnemy ? 0xff4d6d : 0x52d273);
    const atbY = hpY + 22;
    const atbBar = new StatBar(this, x - 140, atbY, 280, 8, 0xffd166);

    return { battler, sprite, hpBar, atbBar, nameLabel };
  }

  private refreshBars(): void {
    this.player.hpBar.setRatio(this.player.battler.hpRatio);
    this.player.atbBar.setRatio(this.player.battler.atb / ATB_MAX);
    this.enemy.hpBar.setRatio(this.enemy.battler.hpRatio);
    this.enemy.atbBar.setRatio(this.enemy.battler.atb / ATB_MAX);
  }

  private scaleEnemyStats(level: number): CombatStats {
    const tier = Math.max(1, level);
    return {
      maxHp: 90 + tier * 25,
      maxMana: 40,
      agility: 45 + tier * 4,
      attack: 14 + tier * 3,
      defense: 8 + tier * 2,
      precision: 80,
      magic: 12 + tier * 2,
      luck: 5,
    };
  }

  // ─── Player turn ───────────────────────────────────────────────────
  private openPlayerActionMenu(): void {
    if (this.actionMenu) return;
    const { width, height } = this.scale;
    const c = this.add.container(width / 2, height - 110);

    const bg = this.add
      .rectangle(0, 0, width - 40, 180, 0x0c1322, 0.92)
      .setStrokeStyle(2, 0x223a5e, 0.9);
    c.add(bg);

    const heading = this.add
      .text(0, -64, 'Your turn — choose an action', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color: '#9bd9ff',
      })
      .setOrigin(0.5);
    c.add(heading);

    const attackBtn = makeButton(this, -180, 16, {
      label: 'Attack',
      width: 160,
      height: 64,
      onClick: () => this.executeBasicAttack(),
    });
    c.add(attackBtn);

    // Show top spells the player can cast — disable if mana too low.
    const affordable = SPELLBOOK.filter(
      (s) => this.player.battler.mana >= s.cost,
    );
    const choice = affordable[Math.min(2, affordable.length - 1)];
    const spell = choice ?? SPELLBOOK[0]!;
    const canCast = this.player.battler.mana >= spell.cost;

    const spellBtn = makeButton(this, 0, 16, {
      label: `${spell.name}\n(${spell.nBack}-back · ${spell.cost} MP)`,
      width: 220,
      height: 64,
      fontSize: 16,
      disabled: !canCast,
      fill: 0x223a5e,
      hoverFill: 0x2f4f80,
      onClick: () => canCast && this.executeSpell(spell),
    });
    c.add(spellBtn);

    const fleeBtn = makeButton(this, 200, 16, {
      label: 'Wait',
      width: 140,
      height: 64,
      fill: 0x1b2740,
      onClick: () => this.skipTurn(),
    });
    c.add(fleeBtn);

    this.actionMenu = c;
  }

  private closeActionMenu(): void {
    this.actionMenu?.destroy(true);
    this.actionMenu = null;
  }

  private executeBasicAttack(): void {
    if (this.engine.peekTurn() !== 'player') return;
    this.closeActionMenu();
    const result = computeBasicAttack(this.player.battler, this.enemy.battler);
    this.flashHit(this.enemy.sprite, result.didHit);
    if (result.didHit) {
      const dealt = this.enemy.battler.takeDamage(result.damage);
      this.popDamage(this.enemy.sprite.x, this.enemy.sprite.y - 200, dealt, result.isCritical);
    } else {
      this.popText(this.enemy.sprite.x, this.enemy.sprite.y - 200, 'MISS', '#9bd9ff');
    }
    this.engine.consumeTurn();
    this.checkBattleEnd();
  }

  private skipTurn(): void {
    if (this.engine.peekTurn() !== 'player') return;
    this.closeActionMenu();
    this.player.battler.restoreMana(8);
    this.popText(this.player.sprite.x, this.player.sprite.y - 200, '+MP', '#4cc9f0');
    this.engine.consumeTurn();
  }

  private executeSpell(spell: Spell): void {
    if (this.engine.peekTurn() !== 'player') return;
    if (!this.player.battler.spendMana(spell.cost)) return;
    this.closeActionMenu();

    // Pause ATB while the cognitive overlay runs.
    this.overlayActive = true;
    this.engine.pause();

    const payload: NBackRequestPayload = {
      spellId: spell.id,
      spellName: spell.name,
      n: spell.nBack,
      trials: spell.trials,
      tint: spell.tint,
      stimulusDurationMs: 1100,
      interStimulusMs: 350,
    };
    this.uiScene.events.emit(GameEvents.RequestNBack, payload);
  }

  private onNBackResolved(payload: NBackResolvedPayload): void {
    if (!this.overlayActive) return;
    const spell = SPELLBOOK.find((s) => s.id === payload.spellId);
    this.overlayActive = false;
    this.engine.resume();
    if (!spell) {
      this.engine.consumeTurn();
      return;
    }

    // Track adaptive history.
    this.nBackHistory.push(payload.score.accuracy);

    const result = computeSpellDamage(
      this.player.battler,
      this.enemy.battler,
      spell,
      payload.damageMultiplier,
    );

    this.fireProjectile(spell.tint, this.enemy.sprite.x, this.enemy.sprite.y - 100, () => {
      this.flashHit(this.enemy.sprite, result.didHit);
      if (result.didHit) {
        const dealt = this.enemy.battler.takeDamage(result.damage);
        this.popDamage(this.enemy.sprite.x, this.enemy.sprite.y - 200, dealt, result.isCritical);
      } else {
        this.popText(this.enemy.sprite.x, this.enemy.sprite.y - 200, 'MISS', '#9bd9ff');
      }
      this.engine.consumeTurn();
      this.checkBattleEnd();
    });

    this.popText(
      this.player.sprite.x,
      this.player.sprite.y - 240,
      `${Math.round(payload.score.accuracy * 100)}% acc`,
      '#9bd9ff',
    );
  }

  // ─── Enemy turn ────────────────────────────────────────────────────
  private beginEnemyTurn(): void {
    this.overlayActive = true;
    this.engine.pause();
    const payload: StroopRequestPayload = {
      windowMs: 2400,
    };
    this.uiScene.events.emit(GameEvents.RequestStroop, payload);
  }

  private onStroopResolved(payload: StroopResolvedPayload): void {
    if (!this.overlayActive) return;
    this.overlayActive = false;
    this.engine.resume();

    const incoming = computeBasicAttack(this.enemy.battler, this.player.battler);
    const final = applyDefensiveMultiplier(incoming, payload.damageMultiplier);
    this.flashHit(this.player.sprite, final.didHit);
    if (final.didHit && final.damage > 0) {
      const dealt = this.player.battler.takeDamage(final.damage);
      this.popDamage(this.player.sprite.x, this.player.sprite.y - 200, dealt, final.isCritical);
    } else if (payload.quality === 'perfect-parry') {
      this.popText(this.player.sprite.x, this.player.sprite.y - 200, 'PARRY!', '#52d273');
    } else if (payload.quality === 'block') {
      this.popText(this.player.sprite.x, this.player.sprite.y - 200, 'block', '#9bd9ff');
    } else {
      this.popText(this.player.sprite.x, this.player.sprite.y - 200, 'MISS', '#9bd9ff');
    }

    this.engine.consumeTurn();
    this.checkBattleEnd();
  }

  // ─── End-of-battle ────────────────────────────────────────────────
  private checkBattleEnd(): void {
    if (!this.enemy.battler.isAlive) {
      this.endBattle('victory');
      return;
    }
    if (!this.player.battler.isAlive) {
      this.endBattle('defeat');
    }
  }

  private async endBattle(outcome: 'victory' | 'defeat'): Promise<void> {
    this.engine.pause();
    this.overlayActive = true; // suppress further turn handling
    this.closeActionMenu();

    const repo = this.registry.get(RegistryKeys.SaveRepo) as SaveRepository | undefined;
    const save = this.registry.get(RegistryKeys.Save) as SaveData | undefined;
    if (repo && save && outcome === 'victory') {
      const xpGain = 25 + save.level * 10;
      const updated: SaveData = {
        ...save,
        xp: save.xp + xpGain,
        level: 1 + Math.floor((save.xp + xpGain) / 100),
        battlesWon: save.battlesWon + 1,
        cognitive: this.updatedCognitive(save),
      };
      this.registry.set(RegistryKeys.Save, updated);
      await repo.save(updated);
    }

    this.bannerText.setText(outcome === 'victory' ? 'Victory!' : 'Defeat');
    this.bannerText.setColor(outcome === 'victory' ? '#52d273' : '#ff4d6d');
    this.tweens.add({
      targets: this.bannerText,
      alpha: 1,
      duration: 400,
      ease: 'sine.out',
    });

    this.time.delayedCall(1600, () => {
      this.scene.stop(SceneKeys.UIOverlay);
      this.scene.start(SceneKeys.MainMenu);
    });
  }

  private updatedCognitive(save: SaveData) {
    if (this.nBackHistory.length === 0) return save.cognitive;
    const avg =
      this.nBackHistory.reduce((a, b) => a + b, 0) / this.nBackHistory.length;
    const newAcc =
      save.cognitive.totalTrials === 0
        ? avg
        : save.cognitive.nBackAccuracy * 0.7 + avg * 0.3;
    return {
      ...save.cognitive,
      nBackAccuracy: clamp01(newAcc),
      totalTrials: save.cognitive.totalTrials + this.nBackHistory.length,
    };
  }

  // ─── FX helpers (object-pooled) ───────────────────────────────────
  private fireProjectile(
    tint: number,
    targetX: number,
    targetY: number,
    onImpact: () => void,
  ): void {
    const sprite = this.pool.acquire();
    if (!sprite) {
      onImpact();
      return;
    }
    sprite.setTint(tint);
    sprite.setPosition(this.player.sprite.x, this.player.sprite.y - 200);
    sprite.setScale(1.2);
    this.tweens.add({
      targets: sprite,
      x: targetX,
      y: targetY,
      duration: 380,
      ease: 'cubic.in',
      onComplete: () => {
        this.pool.release(sprite);
        onImpact();
      },
    });
  }

  private flashHit(sprite: Phaser.GameObjects.Image, hit: boolean): void {
    if (!hit) return;
    sprite.setTint(0xffffff);
    this.time.delayedCall(80, () => sprite.clearTint());
    this.cameras.main.shake(120, 0.005);
  }

  private popDamage(x: number, y: number, amount: number, crit: boolean): void {
    this.popText(x, y, crit ? `-${amount}!` : `-${amount}`, crit ? '#ffd166' : '#ff4d6d');
  }

  private popText(x: number, y: number, text: string, color: string): void {
    const t = this.add
      .text(x, y, text, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '28px',
        color,
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: t,
      y: y - 50,
      alpha: 0,
      duration: 700,
      ease: 'sine.out',
      onComplete: () => t.destroy(),
    });
  }
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
