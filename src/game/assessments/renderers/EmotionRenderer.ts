/**
 * EmotionRenderer - Renders emotional identification tasks.
 *
 * This renderer serves the Emotional developmental line. It presents stimuli
 * (face descriptions or emotional scenarios) and asks the player to identify
 * the emotion present, optionally with an intensity rating.
 *
 * Domain context by stage:
 * - Infrared: Binary emotion (happy / not-happy) from simple face descriptions
 * - Magenta: Basic emotions (happy, sad, angry, scared) from faces
 * - Red: Emotion in self and basic empathy (identify what you feel)
 * - Amber: Emotions in social situations, norm-awareness
 * - Orange: Mixed/complex emotions, regulation strategy awareness
 * - Green: Contradictory emotions (both happy AND sad), empathy for outgroup
 * - Turquoise: Emotion-as-signal, non-reactivity, witness stance
 * - White: Equanimity, non-attachment measures
 *
 * The renderer presents:
 * 1. A stimulus (face description or scenario text)
 * 2. Emotion label buttons to choose from
 * 3. Optional intensity slider (1-5 scale)
 *
 * Parameters from task.parameters:
 *   stimulusType: 'face' | 'scenario' - what kind of stimulus to show
 *   emotionSet: string[] - the emotion labels to present as options
 *   trials: number - how many stimuli to present
 *   includeIntensity?: boolean - whether to show intensity rating
 *   soloMode?: boolean - agency drive probe
 */
import Phaser from 'phaser';
import type { AssessmentTask, TrialResult, MeasureDimension } from '@core/assessments/types.js';

// Default face descriptions for different emotions (since we don't use actual images)
const FACE_STIMULI: Record<string, string[]> = {
  'happy': [
    'The corners of the mouth are turned up. Eyes are crinkled slightly.',
    'A wide smile with visible teeth. Bright, open eyes.',
    'Soft upturned lips. Relaxed forehead. Eyes seem warm.',
  ],
  'not-happy': [
    'The corners of the mouth are flat or turned down. Eyes look heavy.',
    'Tight lips pressed together. Brow slightly furrowed.',
    'Neutral expression with no upward curve at mouth.',
  ],
  'sad': [
    'Downturned mouth. Eyes look heavy and slightly moist.',
    'Drooping eyebrows pulled together. Chin quivering slightly.',
    'Face seems to sag downward. Lower lip pushed out slightly.',
  ],
  'angry': [
    'Eyebrows pulled down and together. Lips pressed tight. Nostrils flared.',
    'Intense stare with narrowed eyes. Jaw clenched.',
    'Forehead deeply furrowed. Mouth in a hard line.',
  ],
  'scared': [
    'Wide eyes with visible whites. Mouth slightly open.',
    'Eyebrows raised high and pulled together. Chin pulled back.',
    'Tense face with frozen expression. Eyes darting.',
  ],
  'surprised': [
    'Eyebrows raised high. Mouth open in an O shape.',
    'Wide eyes, raised forehead. Jaw dropped.',
    'Both eyebrows up, creating horizontal forehead wrinkles.',
  ],
  'disgusted': [
    'Nose wrinkled. Upper lip raised. Eyes squinting.',
    'Head pulled back slightly. Mouth twisted to one side.',
    'Brow lowered on one side. Nostril pulled up.',
  ],
};

// Scenario stimuli for emotional situations
const SCENARIO_STIMULI: Record<string, string[]> = {
  'happy': [
    'A child receives exactly the gift they wished for.',
    'Two old friends reunite after many years apart.',
  ],
  'sad': [
    'A person sits alone in an empty room that used to be full.',
    'Someone watches a departing train carrying a loved one away.',
  ],
  'angry': [
    'A person discovers someone took credit for their work.',
    'Rules were broken that hurt someone who was vulnerable.',
  ],
  'scared': [
    'A figure stands at the edge of something vast and unknown.',
    'Unexpected sounds in a dark, unfamiliar place.',
  ],
};

interface EmotionTrialData {
  readonly trialIndex: number;
  readonly stimulusText: string;
  readonly correctEmotion: string;
  readonly chosenEmotion: string;
  readonly correct: boolean;
  readonly intensity: number | null;
  readonly responseTimeMs: number;
  readonly intensityTimeMs: number | null;
  readonly timestamp: number;
}

export class EmotionRenderer {
  private scene: Phaser.Scene;
  private task: AssessmentTask;
  private onComplete: (trials: TrialResult[]) => void;

  // Parameters
  private stimulusType: 'face' | 'scenario';
  private emotionSet: string[];
  private totalTrials: number;
  private includeIntensity: boolean;

  // State
  private trialData: EmotionTrialData[] = [];
  private currentTrial = 0;
  private currentCorrectEmotion = '';
  private currentStimulusText = '';
  private stimulusShownAt = 0;
  private chosenEmotion = '';
  private waitingForIntensity = false;
  private intensityStartTime = 0;

  // Game objects
  private container!: Phaser.GameObjects.Container;
  private stimulusDisplay!: Phaser.GameObjects.Text;
  private emotionButtons: Phaser.GameObjects.Container[] = [];
  private intensitySlider!: Phaser.GameObjects.Container;
  private intensityDots: Phaser.GameObjects.Ellipse[] = [];
  private intensityLabel!: Phaser.GameObjects.Text;
  private trialCounter!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    task: AssessmentTask,
    onComplete: (trials: TrialResult[]) => void,
  ) {
    this.scene = scene;
    this.task = task;
    this.onComplete = onComplete;

    const params = task.parameters;
    this.stimulusType = (params.stimulusType as 'face' | 'scenario') ?? 'face';
    this.emotionSet = (params.emotionSet as string[]) ?? ['happy', 'sad', 'angry', 'scared'];
    this.totalTrials = (params.trials as number) ?? 6;
    this.includeIntensity = (params.includeIntensity as boolean) ?? false;
  }

  create(): void {
    const { width, height } = this.scene.scale;
    this.container = this.scene.add.container(0, 0);
    this.currentTrial = 0;
    this.trialData = [];

    // Trial counter
    this.trialCounter = this.scene.add.text(width / 2, 90, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#667788',
    }).setOrigin(0.5);
    this.container.add(this.trialCounter);

    // Stimulus display area
    this.stimulusDisplay = this.scene.add.text(width / 2, 220, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#dddde8',
      align: 'center',
      wordWrap: { width: width - 80 },
      lineSpacing: 8,
    }).setOrigin(0.5, 0);
    this.container.add(this.stimulusDisplay);

    // Feedback text
    this.feedbackText = this.scene.add.text(width / 2, height / 2 - 30, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#44cc66',
    }).setOrigin(0.5).setAlpha(0);
    this.container.add(this.feedbackText);

    // Intensity slider (hidden until needed)
    this.intensitySlider = this.scene.add.container(width / 2, height - 280);
    this.intensitySlider.setAlpha(0);
    this.container.add(this.intensitySlider);

    this.intensityLabel = this.scene.add.text(0, -30, 'How strong is this emotion?', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: '#8899aa',
    }).setOrigin(0.5);
    this.intensitySlider.add(this.intensityLabel);

    // Create 5 intensity dots
    const dotSpacing = 60;
    const startX = -dotSpacing * 2;
    for (let i = 0; i < 5; i++) {
      const dot = this.scene.add.ellipse(startX + i * dotSpacing, 10, 36, 36, 0x1b2740)
        .setStrokeStyle(2, 0x4cc9f0, 0.6);
      dot.setInteractive({ useHandCursor: true });
      dot.on('pointerdown', () => this.onIntensitySelected(i + 1));
      this.intensitySlider.add(dot);
      this.intensityDots.push(dot);

      // Label
      const dotLabel = this.scene.add.text(startX + i * dotSpacing, 10, `${i + 1}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#667788',
      }).setOrigin(0.5);
      this.intensitySlider.add(dotLabel);
    }

    // Scale labels
    const lowLabel = this.scene.add.text(startX, 40, 'Mild', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#556677',
    }).setOrigin(0.5);
    const highLabel = this.scene.add.text(startX + 4 * dotSpacing, 40, 'Intense', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#556677',
    }).setOrigin(0.5);
    this.intensitySlider.add(lowLabel);
    this.intensitySlider.add(highLabel);

    this.presentStimulus();
  }

  destroy(): void {
    this.container.destroy(true);
  }

  private presentStimulus(): void {
    if (this.currentTrial >= this.totalTrials) {
      this.completeTask();
      return;
    }

    this.trialCounter.setText(`${this.currentTrial + 1} / ${this.totalTrials}`);
    this.waitingForIntensity = false;

    // Pick a random emotion from the set
    this.currentCorrectEmotion = this.emotionSet[Math.floor(Math.random() * this.emotionSet.length)];

    // Get stimulus text
    this.currentStimulusText = this.getStimulusForEmotion(this.currentCorrectEmotion);
    this.stimulusDisplay.setText(this.currentStimulusText);
    this.stimulusShownAt = Date.now();

    // Clear and recreate emotion buttons
    for (const btn of this.emotionButtons) btn.destroy(true);
    this.emotionButtons = [];

    const { width, height } = this.scene.scale;
    this.createEmotionGrid(width, height);

    // Hide intensity slider
    this.intensitySlider.setAlpha(0);
  }

  private createEmotionGrid(width: number, height: number): void {
    const cols = Math.min(this.emotionSet.length, 3);
    const rows = Math.ceil(this.emotionSet.length / cols);
    const btnWidth = 180;
    const btnHeight = 52;
    const hSpacing = btnWidth + 16;
    const vSpacing = btnHeight + 12;
    const startY = height - 140 - (rows - 1) * vSpacing;
    const startX = width / 2 - ((cols - 1) * hSpacing) / 2;

    for (let i = 0; i < this.emotionSet.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * hSpacing;
      const y = startY + row * vSpacing;

      const btn = this.createEmotionButton(x, y, this.emotionSet[i]);
      this.emotionButtons.push(btn);
      this.container.add(btn);
    }
  }

  private onEmotionSelected(emotion: string): void {
    if (this.waitingForIntensity) return;

    const responseTime = Date.now() - this.stimulusShownAt;
    this.chosenEmotion = emotion;

    // Highlight selected button
    for (const btn of this.emotionButtons) {
      const btnEmotion = (btn as unknown as { emotionLabel: string }).emotionLabel;
      btn.setAlpha(btnEmotion === emotion ? 1.0 : 0.4);
    }

    if (this.includeIntensity) {
      // Show intensity slider
      this.waitingForIntensity = true;
      this.intensityStartTime = Date.now();
      this.intensitySlider.setAlpha(1);
      // Reset dots
      for (const dot of this.intensityDots) {
        dot.setFillStyle(0x1b2740);
      }
    } else {
      // Record trial without intensity
      this.recordTrial(emotion, null, responseTime, null);
    }
  }

  private onIntensitySelected(level: number): void {
    if (!this.waitingForIntensity) return;
    this.waitingForIntensity = false;

    const intensityTime = Date.now() - this.intensityStartTime;
    const responseTime = this.intensityStartTime - this.stimulusShownAt;

    // Highlight selected dot
    for (let i = 0; i < this.intensityDots.length; i++) {
      this.intensityDots[i].setFillStyle(i < level ? 0x4cc9f0 : 0x1b2740);
    }

    this.recordTrial(this.chosenEmotion, level, responseTime, intensityTime);
  }

  private recordTrial(
    chosenEmotion: string,
    intensity: number | null,
    responseTimeMs: number,
    intensityTimeMs: number | null,
  ): void {
    const correct = chosenEmotion === this.currentCorrectEmotion;

    // Brief feedback
    this.feedbackText.setText(correct ? 'Correct' : `Was: ${this.currentCorrectEmotion}`);
    this.feedbackText.setColor(correct ? '#44cc66' : '#ff8844');
    this.feedbackText.setAlpha(1);
    this.scene.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      duration: 600,
      delay: 300,
    });

    this.trialData.push({
      trialIndex: this.currentTrial,
      stimulusText: this.currentStimulusText,
      correctEmotion: this.currentCorrectEmotion,
      chosenEmotion,
      correct,
      intensity,
      responseTimeMs,
      intensityTimeMs,
      timestamp: this.stimulusShownAt,
    });

    this.currentTrial++;

    // Advance after brief pause
    this.scene.time.delayedCall(500, () => this.presentStimulus());
  }

  private completeTask(): void {
    const results: TrialResult[] = this.trialData.map((trial) => {
      const dimensions: Partial<Record<MeasureDimension, number>> = {};

      // Accuracy: correct emotion identification
      dimensions.accuracy = trial.correct ? 1.0 : 0.0;

      // Response time: normalized
      dimensions.response_time = Math.max(0, Math.min(1, 1 - (trial.responseTimeMs - 500) / 4500));

      return {
        taskId: this.task.id,
        timestamp: trial.timestamp,
        dimensions,
        rawResponse: {
          stimulusText: trial.stimulusText,
          stimulusType: this.stimulusType,
          correctEmotion: trial.correctEmotion,
          chosenEmotion: trial.chosenEmotion,
          correct: trial.correct,
          intensity: trial.intensity,
          responseTimeMs: trial.responseTimeMs,
          intensityTimeMs: trial.intensityTimeMs,
        },
        durationMs: trial.responseTimeMs + (trial.intensityTimeMs ?? 0),
      };
    });

    // Consistency: across all trials
    const correctTrials = this.trialData.filter(t => t.correct);
    if (correctTrials.length > 1) {
      const rts = correctTrials.map(t => t.responseTimeMs);
      const mean = rts.reduce((a, b) => a + b, 0) / rts.length;
      const variance = rts.reduce((sum, rt) => sum + (rt - mean) ** 2, 0) / rts.length;
      const cv = Math.sqrt(variance) / mean;
      const consistencyScore = Math.max(0, Math.min(1, 1 - cv));

      for (const r of results) {
        (r.dimensions as Record<string, number>).consistency = consistencyScore;
      }
    }

    this.onComplete(results);
  }

  private getStimulusForEmotion(emotion: string): string {
    const source = this.stimulusType === 'face' ? FACE_STIMULI : SCENARIO_STIMULI;
    const stimuli = source[emotion];
    if (!stimuli || stimuli.length === 0) {
      // Fallback: generic description
      return this.stimulusType === 'face'
        ? `A face showing signs of being ${emotion}.`
        : `A person is experiencing something that makes them feel ${emotion}.`;
    }
    return stimuli[Math.floor(Math.random() * stimuli.length)];
  }

  // --- UI Helpers ---

  private createEmotionButton(x: number, y: number, emotion: string): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(x, y);
    const bg = this.scene.add.rectangle(0, 0, 180, 52, 0x1b2740)
      .setStrokeStyle(1, 0x4cc9f0, 0.5)
      .setOrigin(0.5);
    const label = this.scene.add.text(0, 0, emotion.charAt(0).toUpperCase() + emotion.slice(1), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      color: '#e7eaf2',
    }).setOrigin(0.5);
    btn.add([bg, label]);
    btn.setSize(180, 52);
    btn.setInteractive({ useHandCursor: true });

    // Store emotion label on container for identification
    (btn as unknown as { emotionLabel: string }).emotionLabel = emotion;

    btn.on('pointerover', () => bg.setFillStyle(0x2a3b5e));
    btn.on('pointerout', () => bg.setFillStyle(0x1b2740));
    btn.on('pointerdown', () => this.onEmotionSelected(emotion));

    return btn;
  }
}
