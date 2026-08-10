import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const SAMPLE_RATE = 48_000;
const DURATION_SECONDS = 60;
const FRAME_COUNT = SAMPLE_RATE * DURATION_SECONDS;
const BPM = 60;
const BEAT_SECONDS = 60 / BPM;
const BAR_SECONDS = BEAT_SECONDS * 4;
const OUTPUT_DIRECTORY = resolve("app/opening/assets/audio");

const left = new Float32Array(FRAME_COUNT);
const right = new Float32Array(FRAME_COUNT);
const delaySourceLeft = new Float32Array(FRAME_COUNT);
const delaySourceRight = new Float32Array(FRAME_COUNT);

let randomState = 0x5eedc0de;
const random = () => {
  randomState |= 0;
  randomState = (randomState + 0x6d2b79f5) | 0;
  let value = Math.imul(randomState ^ (randomState >>> 15), 1 | randomState);
  value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
  return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
};

const midiToFrequency = (note) => 440 * 2 ** ((note - 69) / 12);
const clamp = (value, minimum, maximum) =>
  Math.max(minimum, Math.min(maximum, value));

const panGains = (pan) => {
  const angle = ((clamp(pan, -1, 1) + 1) * Math.PI) / 4;
  return [Math.cos(angle), Math.sin(angle)];
};

const addSample = (frame, value, pan = 0) => {
  if (frame < 0 || frame >= FRAME_COUNT) return;
  const [leftGain, rightGain] = panGains(pan);
  left[frame] += value * leftGain;
  right[frame] += value * rightGain;
};

const addPluck = (start, note, amplitude, pan = 0, duration = 0.72) => {
  const startFrame = Math.round(start * SAMPLE_RATE);
  const frames = Math.min(
    Math.round(duration * SAMPLE_RATE),
    FRAME_COUNT - startFrame,
  );
  const frequency = midiToFrequency(note);
  const [leftGain, rightGain] = panGains(pan);

  for (let index = 0; index < frames; index += 1) {
    const time = index / SAMPLE_RATE;
    const attack = Math.min(1, time / 0.006);
    const envelope = attack * Math.exp(-5.4 * time / duration);
    const phase = Math.PI * 2 * frequency * time;
    const modulation = 1.7 * Math.exp(-8 * time) * Math.sin(phase * 2.003);
    const signal =
      Math.sin(phase + modulation) * 0.72 +
      Math.sin(phase * 2.997) * Math.exp(-7 * time) * 0.22 +
      Math.sin(phase * 5.01) * Math.exp(-12 * time) * 0.08;
    const value = signal * envelope * amplitude;
    const frame = startFrame + index;
    left[frame] += value * leftGain;
    right[frame] += value * rightGain;
    delaySourceLeft[frame] += value * leftGain;
    delaySourceRight[frame] += value * rightGain;
  }
};

const addBass = (start, note, amplitude, duration = 0.78) => {
  const startFrame = Math.round(start * SAMPLE_RATE);
  const frames = Math.min(
    Math.round(duration * SAMPLE_RATE),
    FRAME_COUNT - startFrame,
  );
  const frequency = midiToFrequency(note);

  for (let index = 0; index < frames; index += 1) {
    const time = index / SAMPLE_RATE;
    const attack = Math.min(1, time / 0.018);
    const release = clamp((duration - time) / 0.18, 0, 1);
    const envelope = attack * release * Math.exp(-0.72 * time);
    const phase = Math.PI * 2 * frequency * time;
    const signal =
      Math.sin(phase) * 0.84 +
      Math.sin(phase * 2) * 0.12 +
      Math.sin(phase * 3) * 0.04;
    const value = signal * envelope * amplitude;
    const frame = startFrame + index;
    left[frame] += value * 0.707;
    right[frame] += value * 0.707;
    delaySourceLeft[frame] += value * 0.707;
    delaySourceRight[frame] += value * 0.707;
  }
};

const addPad = (start, notes, amplitude, duration = BAR_SECONDS + 0.3) => {
  const startFrame = Math.round(start * SAMPLE_RATE);
  const frames = Math.min(
    Math.round(duration * SAMPLE_RATE),
    FRAME_COUNT - startFrame,
  );

  notes.forEach((note, noteIndex) => {
    const frequency = midiToFrequency(note);
    const pan = notes.length === 1 ? 0 : -0.72 + (noteIndex / (notes.length - 1)) * 1.44;
    const [leftGain, rightGain] = panGains(pan);
    const phaseOffset = random() * Math.PI * 2;
    const detune = noteIndex % 2 === 0 ? 0.9974 : 1.0029;

    for (let index = 0; index < frames; index += 1) {
      const time = index / SAMPLE_RATE;
      const attack = Math.min(1, time / 0.52);
      const release = clamp((duration - time) / 0.82, 0, 1);
      const breathe = 0.9 + Math.sin(Math.PI * 2 * 0.125 * time + noteIndex) * 0.1;
      const envelope = attack * release * breathe;
      const phase = Math.PI * 2 * frequency * time + phaseOffset;
      const signal =
        Math.sin(phase) * 0.55 +
        Math.sin(phase * detune + 0.7) * 0.28 +
        Math.sin(phase * 2.001 + 1.3) * 0.1 +
        Math.sin(phase * 0.501 + 0.2) * 0.07;
      const value = signal * envelope * amplitude;
      const frame = startFrame + index;
      left[frame] += value * leftGain;
      right[frame] += value * rightGain;
      delaySourceLeft[frame] += value * leftGain;
      delaySourceRight[frame] += value * rightGain;
    }
  });
};

const addKick = (start, amplitude = 0.46) => {
  const startFrame = Math.round(start * SAMPLE_RATE);
  const frames = Math.min(Math.round(0.42 * SAMPLE_RATE), FRAME_COUNT - startFrame);
  let phase = 0;

  for (let index = 0; index < frames; index += 1) {
    const time = index / SAMPLE_RATE;
    const frequency = 44 + 105 * Math.exp(-time * 28);
    phase += (Math.PI * 2 * frequency) / SAMPLE_RATE;
    const body = Math.sin(phase) * Math.exp(-time * 9.5);
    const click = (random() * 2 - 1) * Math.exp(-time * 105) * 0.18;
    addSample(startFrame + index, (body + click) * amplitude, 0);
  }
};

const addTick = (start, amplitude = 0.12, pan = 0, pitch = 1_550) => {
  const startFrame = Math.round(start * SAMPLE_RATE);
  const frames = Math.min(Math.round(0.075 * SAMPLE_RATE), FRAME_COUNT - startFrame);
  let previousNoise = 0;

  for (let index = 0; index < frames; index += 1) {
    const time = index / SAMPLE_RATE;
    const noise = random() * 2 - 1;
    const highNoise = noise - previousNoise * 0.82;
    previousNoise = noise;
    const tone = Math.sin(Math.PI * 2 * pitch * time) * 0.5;
    const envelope = Math.exp(-time * 62);
    addSample(startFrame + index, (highNoise * 0.38 + tone) * envelope * amplitude, pan);
  }
};

const addHat = (start, amplitude = 0.075, pan = 0) => {
  const startFrame = Math.round(start * SAMPLE_RATE);
  const frames = Math.min(Math.round(0.115 * SAMPLE_RATE), FRAME_COUNT - startFrame);
  let previousNoise = 0;

  for (let index = 0; index < frames; index += 1) {
    const time = index / SAMPLE_RATE;
    const noise = random() * 2 - 1;
    const highNoise = noise - previousNoise;
    previousNoise = noise;
    const metallic =
      Math.sin(Math.PI * 2 * 6_127 * time) * 0.18 +
      Math.sin(Math.PI * 2 * 8_493 * time) * 0.12;
    const envelope = Math.exp(-time * 38);
    addSample(startFrame + index, (highNoise * 0.58 + metallic) * envelope * amplitude, pan);
  }
};

const addImpact = (start, amplitude = 0.42, brightness = 1) => {
  const startFrame = Math.round(start * SAMPLE_RATE);
  const frames = Math.min(Math.round(1.4 * SAMPLE_RATE), FRAME_COUNT - startFrame);
  let phase = 0;
  let previousNoise = 0;

  for (let index = 0; index < frames; index += 1) {
    const time = index / SAMPLE_RATE;
    const frequency = 56 + 92 * Math.exp(-time * 6.5);
    phase += (Math.PI * 2 * frequency) / SAMPLE_RATE;
    const sub = Math.sin(phase) * Math.exp(-time * 3.4) * 0.62;
    const noise = random() * 2 - 1;
    const highNoise = noise - previousNoise * 0.75;
    previousNoise = noise;
    const air = highNoise * Math.exp(-time * (9 / brightness)) * 0.28;
    addSample(startFrame + index, (sub + air) * amplitude, 0);
  }
};

const addRiser = (start, duration, amplitude = 0.09) => {
  const startFrame = Math.round(start * SAMPLE_RATE);
  const frames = Math.min(
    Math.round(duration * SAMPLE_RATE),
    FRAME_COUNT - startFrame,
  );
  let filteredNoise = 0;

  for (let index = 0; index < frames; index += 1) {
    const time = index / SAMPLE_RATE;
    const progress = time / duration;
    const noise = random() * 2 - 1;
    filteredNoise += (noise - filteredNoise) * (0.015 + progress * 0.18);
    const frequency = 180 + progress ** 2 * 1_340;
    const tone = Math.sin(Math.PI * 2 * frequency * time + progress * 8) * 0.34;
    const envelope = progress ** 1.7 * clamp((duration - time) / 0.08, 0, 1);
    const pan = Math.sin(progress * Math.PI * 3) * 0.55;
    addSample(
      startFrame + index,
      (filteredNoise * 0.66 + tone) * envelope * amplitude,
      pan,
    );
  }
};

const chords = [
  [50, 57, 60, 64],
  [46, 53, 57, 62],
  [41, 48, 55, 57],
  [48, 55, 62, 64],
  [43, 50, 58, 62],
  [46, 53, 57, 62],
  [50, 57, 60, 64],
  [41, 48, 52, 57],
  [48, 55, 62, 64],
  [50, 57, 60, 64],
  [46, 53, 57, 62],
  [43, 50, 58, 62],
  [48, 55, 62, 64],
  [50, 57, 60, 64],
  [41, 48, 53, 57, 60],
];

const padLevels = [
  0.018, 0.022, 0.026, 0.028, 0.032,
  0.036, 0.038, 0.04, 0.042, 0.036,
  0.038, 0.032, 0.024, 0.017, 0.036,
];

chords.forEach((chord, bar) => {
  addPad(bar * BAR_SECONDS, chord, padLevels[bar]);
});

// Bars 1–2: curiosity and restrained momentum.
for (let time = 0; time < 8; time += 1) {
  const bar = Math.floor(time / BAR_SECONDS);
  const chord = chords[bar];
  const note = chord[(Math.round(time) + bar) % chord.length] + 12;
  addPluck(time, note, time === 0 ? 0.1 : 0.065, (time % 4 - 1.5) * 0.24);
  if (time % 2 === 0) addTick(time, 0.055, time % 4 === 0 ? -0.35 : 0.35, 1_280);
}
addImpact(6, 0.19, 0.75);

// Bars 3–4: clockwork editorial sequence with clear one-second accents.
for (let time = 8; time < 16; time += 0.5) {
  const bar = Math.floor(time / BAR_SECONDS);
  const chord = chords[bar];
  const step = Math.round((time % BAR_SECONDS) * 2);
  addTick(time, step % 2 === 0 ? 0.105 : 0.06, step % 2 === 0 ? -0.24 : 0.24);
  addPluck(time, chord[step % chord.length] + 12, 0.05, step % 2 === 0 ? -0.42 : 0.42, 0.48);
}
[10, 11, 12, 13, 14].forEach((time, index) => {
  addImpact(time, index === 4 ? 0.2 : 0.095, 0.8 + index * 0.08);
});

// Bars 5–6: composer focus, restrained offbeats, then space for the rocket lift.
for (let time = 16; time < 21.5; time += 0.5) {
  const bar = Math.floor(time / BAR_SECONDS);
  const chord = chords[bar];
  const step = Math.round((time % BAR_SECONDS) * 2);
  const isReleaseBeat = time >= 21;
  addPluck(
    time,
    chord[step % chord.length] + 12,
    isReleaseBeat ? 0.027 : 0.045,
    step % 2 === 0 ? -0.42 : 0.42,
    0.42,
  );
  if (!isReleaseBeat && step % 2 === 1) {
    addHat(time, 0.032, step % 4 === 1 ? -0.24 : 0.24);
  }
  if (!isReleaseBeat && step % 4 === 0) {
    addBass(time, chord[0] - 12, 0.064, 0.68);
  }
}
[18, 20].forEach((time) => addKick(time, 0.17));
addRiser(21.25, 1.75, 0.1);
addImpact(23, 0.34, 1.15);

// Bars 7–9: a wider, luminous exploration field.
for (let time = 24; time < 36; time += 0.5) {
  const bar = Math.floor(time / BAR_SECONDS);
  const chord = chords[bar];
  const step = Math.round((time % BAR_SECONDS) * 2);
  addPluck(
    time,
    chord[(step + bar) % chord.length] + 24,
    step % 4 === 0 ? 0.047 : 0.028,
    Math.sin(time * 1.7) * 0.72,
    1.25,
  );
  if (step % 4 === 0) addBass(time, chord[0] - 12, 0.038, 1.4);
}
for (let index = 0; index < 18; index += 1) {
  const time = 24.3 + random() * 11.2;
  const bar = Math.floor(time / BAR_SECONDS);
  const chord = chords[bar];
  addPluck(time, chord[index % chord.length] + 24, 0.018 + random() * 0.014, random() * 1.6 - 0.8, 1.6);
}
addImpact(24, 0.11, 1.2);
addImpact(30, 0.18, 1.05);

// Bars 10–11: productive build momentum.
for (let time = 36; time < 44; time += 0.5) {
  const bar = Math.floor(time / BAR_SECONDS);
  const chord = chords[bar];
  const step = Math.round((time % BAR_SECONDS) * 2);
  addPluck(time, chord[step % chord.length] + 12, 0.073, step % 2 === 0 ? -0.5 : 0.5, 0.5);
  addHat(time, step % 2 === 0 ? 0.08 : 0.052, step % 2 === 0 ? 0.32 : -0.32);
  addBass(time, chord[0] - 12, step % 2 === 0 ? 0.105 : 0.065, 0.5);
  if (step % 2 === 0) addKick(time, 0.27);
}
addImpact(36, 0.34, 1.05);
[39, 40.375, 41.75].forEach((time, index) => {
  addTick(time, 0.18, index === 1 ? 0.5 : -0.5, 1_720 + index * 260);
});

// Bars 12–13: architectural sequencer for Plan, then density falls away.
for (let time = 44; time < 50; time += 0.5) {
  const bar = Math.floor(time / BAR_SECONDS);
  const chord = chords[bar];
  const step = Math.round((time - 44) * 2);
  addTick(time, step % 4 === 0 ? 0.12 : 0.068, step % 2 === 0 ? -0.46 : 0.46, 1_350 + (step % 4) * 180);
  addPluck(time, chord[(step * 3) % chord.length] + 12, 0.047, step % 2 === 0 ? -0.58 : 0.58, 0.42);
  if (step % 2 === 0) addBass(time, chord[0] - 12, 0.07, 0.6);
}
addImpact(44, 0.27, 0.85);
addImpact(50, 0.13, 0.65);

// Bar 14: intentional negative space beneath the final spoken statement.
addBass(52, 38, 0.04, 1.6);
addPluck(52, 74, 0.035, -0.25, 1.8);
addPluck(54, 76, 0.027, 0.25, 1.65);

// Bar 15: luminous logo reveal and confident brand resolution.
addRiser(56.35, 0.65, 0.045);
addPluck(57, 81, 0.075, 0, 1.4);
addImpact(58, 0.28, 0.9);
addBass(58, 41, 0.09, 1.9);
[65, 69, 72, 76].forEach((note, index) => {
  addPluck(58 + index * 0.035, note, 0.055, -0.6 + index * 0.4, 1.85);
});

const duckWindows = [
  [6, 7.25],
  [10, 10.65],
  [11, 11.65],
  [12, 12.7],
  [13, 13.55],
  [14, 15.7],
  [52, 53.2],
  [53.5, 55.7],
];

const voiceDuck = (time) => {
  let gain = 1;
  for (const [start, end] of duckWindows) {
    const fadeIn = clamp((time - (start - 0.12)) / 0.12, 0, 1);
    const fadeOut = clamp(((end + 0.2) - time) / 0.2, 0, 1);
    const windowAmount = Math.min(fadeIn, fadeOut);
    gain = Math.min(gain, 1 - windowAmount * 0.28);
  }
  return gain;
};

const applyTempoDelay = () => {
  const taps = [
    [0.25, 0.065],
    [0.5, 0.042],
    [0.75, 0.025],
  ];

  taps.forEach(([delaySeconds, gain], tapIndex) => {
    const delayFrames = Math.round(delaySeconds * SAMPLE_RATE);
    for (let frame = delayFrames; frame < FRAME_COUNT; frame += 1) {
      const sourceLeft = delaySourceLeft[frame - delayFrames];
      const sourceRight = delaySourceRight[frame - delayFrames];
      left[frame] += (tapIndex % 2 === 0 ? sourceRight : sourceLeft) * gain;
      right[frame] += (tapIndex % 2 === 0 ? sourceLeft : sourceRight) * gain;
    }
  });
};

applyTempoDelay();

const masterAudio = () => {
  let peak = 0;
  let sumSquares = 0;
  const fadeFrames = Math.round(0.055 * SAMPLE_RATE);

  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    const time = frame / SAMPLE_RATE;
    const endingFade =
      frame >= FRAME_COUNT - fadeFrames
        ? (FRAME_COUNT - frame - 1) / fadeFrames
        : 1;
    const duck = voiceDuck(time);
    left[frame] = Math.tanh(left[frame] * 1.28) * duck * endingFade;
    right[frame] = Math.tanh(right[frame] * 1.28) * duck * endingFade;
    peak = Math.max(peak, Math.abs(left[frame]), Math.abs(right[frame]));
  }

  const gain = peak > 0 ? 0.91 / peak : 1;
  peak = 0;
  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    left[frame] *= gain;
    right[frame] *= gain;
    peak = Math.max(peak, Math.abs(left[frame]), Math.abs(right[frame]));
    sumSquares += (left[frame] ** 2 + right[frame] ** 2) / 2;
  }

  return {
    peak,
    rms: Math.sqrt(sumSquares / FRAME_COUNT),
  };
};

const encodeWave = (leftChannel, rightChannel) => {
  const bytesPerSample = 2;
  const channelCount = 2;
  const dataSize = FRAME_COUNT * channelCount * bytesPerSample;
  const buffer = Buffer.allocUnsafe(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channelCount, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * channelCount * bytesPerSample, 28);
  buffer.writeUInt16LE(channelCount * bytesPerSample, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    const leftSample = Math.round(clamp(leftChannel[frame], -1, 1) * 32_767);
    const rightSample = Math.round(clamp(rightChannel[frame], -1, 1) * 32_767);
    buffer.writeInt16LE(leftSample, offset);
    buffer.writeInt16LE(rightSample, offset + 2);
    offset += 4;
  }

  return buffer;
};

const addCalibrationClicks = (leftChannel, rightChannel) => {
  for (let beat = 0; beat < DURATION_SECONDS; beat += 1) {
    const isDownbeat = beat % 4 === 0;
    const startFrame = beat * SAMPLE_RATE;
    const frames = Math.round(0.055 * SAMPLE_RATE);
    const frequency = isDownbeat ? 1_760 : 1_120;
    const amplitude = isDownbeat ? 0.32 : 0.2;

    for (let index = 0; index < frames; index += 1) {
      const time = index / SAMPLE_RATE;
      const envelope = Math.exp(-time * 68);
      const click = Math.sin(Math.PI * 2 * frequency * time) * envelope * amplitude;
      const frame = startFrame + index;
      if (frame >= FRAME_COUNT) break;
      leftChannel[frame] = clamp(leftChannel[frame] * 0.84 + click, -0.98, 0.98);
      rightChannel[frame] = clamp(rightChannel[frame] * 0.84 + click, -0.98, 0.98);
    }
  }
};

const stats = masterAudio();
const sectionLevels = [
  ["intro", 0, 8],
  ["editorial", 8, 16],
  ["composer", 16, 24],
  ["orbit", 24, 36],
  ["build", 36, 44],
  ["plan", 44, 52],
  ["statement", 52, 56],
  ["brand", 56, 60],
].map(([name, start, end]) => {
  const startFrame = Number(start) * SAMPLE_RATE;
  const endFrame = Number(end) * SAMPLE_RATE;
  let sumSquares = 0;
  for (let frame = startFrame; frame < endFrame; frame += 1) {
    sumSquares += (left[frame] ** 2 + right[frame] ** 2) / 2;
  }
  const rms = Math.sqrt(sumSquares / (endFrame - startFrame));
  return {
    name,
    rmsDb: Number((20 * Math.log10(Math.max(rms, 1e-9))).toFixed(1)),
  };
});
const clickLeft = new Float32Array(left);
const clickRight = new Float32Array(right);
addCalibrationClicks(clickLeft, clickRight);

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
await Promise.all([
  writeFile(resolve(OUTPUT_DIRECTORY, "opening-bgm.wav"), encodeWave(left, right)),
  writeFile(
    resolve(OUTPUT_DIRECTORY, "opening-bgm-click.wav"),
    encodeWave(clickLeft, clickRight),
  ),
]);

console.log(
  JSON.stringify(
    {
      bpm: BPM,
      durationSeconds: DURATION_SECONDS,
      sampleRate: SAMPLE_RATE,
      peak: Number(stats.peak.toFixed(4)),
      rms: Number(stats.rms.toFixed(4)),
      sectionLevels,
      files: ["opening-bgm.wav", "opening-bgm-click.wav"],
    },
    null,
    2,
  ),
);
