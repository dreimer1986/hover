#!/usr/bin/env python3
"""Create optional PCM engine loops from preserved AAC samples. Requires ffmpeg.

No source assets are modified. Equal-power overlap joins the tail to the head;
the output wraps from head[M-1] to head[M], with no fade to silence each cycle.
"""
import array
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys
import wave

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'modifications/engine-loops'
OUT.mkdir(exist_ok=True)
records = []
for name in ('ENG_IDLE', 'ENG_NORM', 'ENG_LOW', 'ENG_HIGH'):
    source, = (ROOT / 'web/assets/sounds/Retro').glob(name + '.*.m4a')
    info = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'stream=sample_rate,channels', '-of', 'json', str(source)]))['streams'][0]
    rate, channels = int(info['sample_rate']), info['channels']
    samples = array.array('f', subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(source), '-f', 'f32le', '-']))
    if sys.byteorder != 'little': samples.byteswap()
    frames = len(samples) // channels
    overlap = round(rate * .030)
    result = array.array('f', samples[overlap * channels:(frames-overlap) * channels])
    for i in range(overlap):
        theta = i / (overlap - 1) * math.pi / 2
        for ch in range(channels):
            result.append(samples[(frames-overlap+i)*channels+ch]*math.cos(theta) + samples[i*channels+ch]*math.sin(theta))
    assert max(abs(x) for x in result) < 1, 'Crossfade would clip'
    pcm = array.array('h', (round(max(-1, min(1, x)) * 32767) for x in result))
    if sys.byteorder != 'little': pcm.byteswap()
    target = OUT / (name + '.pcm-v1.wav')
    with wave.open(str(target), 'wb') as out:
        out.setnchannels(channels); out.setsampwidth(2); out.setframerate(rate); out.writeframes(pcm.tobytes())
    records.append({'source': str(source.relative_to(ROOT)), 'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                    'output': str(target.relative_to(ROOT)), 'output_sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                    'sample_rate': rate, 'channels': channels, 'source_frames': frames, 'output_frames': frames-overlap,
                    'overlap_frames': overlap, 'duration_seconds': (frames-overlap)/rate})
(ROOT / 'verification/engine-loop-provenance.json').write_text(json.dumps({'method': 'Decode AAC to native-rate stereo PCM; 30 ms equal-power tail/head overlap; PCM16 WAV. Optional edition only.', 'files': records}, indent=2)+'\n')
print('Prepared',len(records),'PCM loops;',sum(p.stat().st_size for p in OUT.glob('*.wav')),'bytes')
