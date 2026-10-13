"""Records the app's voice with Kokoro (local and free): every word, sentence, story line, number,
letter name and praise line the app says out loud. The phonics letter sounds are real recordings and
are left alone.

    py -3.12 scripts/make-voice.py           # voice anything new: run after adding words, sentences or stories
    py -3.12 scripts/make-voice.py --force   # re-voice everything
    py -3.12 scripts/make-voice.py --check   # run the clips voiced this time through Whisper and flag mismatches
    py -3.12 scripts/make-voice.py --prune   # delete clips nothing says any more

Lines come from the app's own data (vocabData, sentencesData, storyData, signsData and the praise
lists), plus the numbers 0-10 and the letter names. Each clip is saved as
client/public/sounds/Voice/<slug>.mp3 (the same slug rule as clipSlug() in
client/src/lib/voicePlayer.ts), and client/src/data/voiceClips.ts is rewritten to list them so the
app knows which lines are recorded. Anything without a clip is spoken by the device's voice instead.

Needs the Kokoro model HyperFrames downloads (~/.cache/hyperframes/tts), a Python with kokoro_onnx and
soundfile (py -3.12 on this PC), ffmpeg on PATH, and faster-whisper for --check.
"""
import argparse
import re
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

VOICE = 'af_bella'  # clearest Kokoro voice on single words: 24/30 heard right by Whisper, af_heart 12/30
SPEED = 1.0         # slower stretches the "s" in "stop" until it sounds like "is stop"

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'client' / 'src'
OUT = ROOT / 'client' / 'public' / 'sounds' / 'Voice'
MANIFEST = SRC / 'data' / 'voiceClips.ts'
TTS = Path.home() / '.cache' / 'hyperframes' / 'tts'

NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
LETTER_PROMPT = 'Spelling out letters one at a time: A. B. C. D. E. F. G. H. I. J. K. L. M. N. O. P. Q. R. S. T. U. V. W. X. Y. Z.'


def slug(text):
    """Same rule as clipSlug() in client/src/lib/voicePlayer.ts."""
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def read(rel):
    return (SRC / rel).read_text(encoding='utf-8')


def lines_to_voice():
    """{clip name: words to say} for everything the app speaks."""
    lines = {}

    def add(text, name=None):
        lines.setdefault(name or slug(text), text)

    # Praise, wherever a game keeps its list
    for path in sorted(SRC.rglob('*.ts*')):
        for block in re.findall(r'PRAISE_LINES\s*=\s*\[(.*?)\]', path.read_text(encoding='utf-8'), re.S):
            for line in re.findall(r"'([^']+)'", block):
                add(line)
    # Words and Signs (a vocab item's tts, when it has one, is what gets spoken)
    for item in re.findall(r"\{[^{}]*\bname:\s*'[^']+'[^{}]*\}", read('data/vocabData.ts')):
        tts = re.search(r"tts:\s*'([^']+)'", item)
        add(tts.group(1) if tts else re.search(r"name:\s*'([^']+)'", item).group(1))
    for word in re.findall(r"word:\s*'([^']+)'", read('data/signsData.ts')):
        add(word.capitalize())
    # Sentences and story lines are read whole, and word by word as the child taps along
    texts = re.findall(r'text:\s*"([^"]+)"', read('data/sentencesData.ts'))
    texts += re.findall(r"^\s*\d+:\s*'([^']+)'", read('data/storyData.ts'), re.M)
    for text in texts:
        add(text)
    for text in texts:
        for word in text.split():
            add(re.sub(r'[.,!?]', '', word))
    # Numbers: Numbers counts 1-10, Doodle traces 0-9
    for n, word in enumerate(NUMBER_WORDS):
        add(word, str(n))
    # Letter names: the name tap in Phonics, and Doodle
    for letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
        add('Zee' if letter == 'Z' else letter, f'letter-{letter.lower()}')
    return lines


def tidy(samples, rate):
    """Trim the silence Kokoro leaves around a line, soften the cut edges, and level the peak."""
    x = np.asarray(samples, dtype=np.float32)
    loud = np.flatnonzero(np.abs(x) > 0.02 * np.abs(x).max())
    x = x[max(0, loud[0] - int(0.025 * rate)): loud[-1] + int(0.15 * rate)]
    fade_in, fade_out = int(0.005 * rate), int(0.04 * rate)
    x[:fade_in] *= np.linspace(0, 1, fade_in)
    x[-fade_out:] *= np.linspace(1, 0, fade_out)
    return x * (10 ** (-1.5 / 20) / np.abs(x).max())  # peak at -1.5 dBFS, like the phonics clips


def voice(todo):
    import kokoro_onnx

    OUT.mkdir(parents=True, exist_ok=True)
    kokoro = kokoro_onnx.Kokoro(str(TTS / 'models' / 'kokoro-v1.0.onnx'), str(TTS / 'voices' / 'voices-v1.0.bin'))
    with tempfile.TemporaryDirectory() as tmp:
        for name, text in todo:
            samples, rate = kokoro.create(text, voice=VOICE, speed=SPEED, lang='en-us')
            wav = Path(tmp) / f'{name}.wav'
            sf.write(str(wav), tidy(samples, rate), rate)
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(wav), '-ar', '44100', '-ac', '1',
                            '-codec:a', 'libmp3lame', '-b:a', '64k', str(OUT / f'{name}.mp3')], check=True)


def write_manifest(names):
    body = ''.join(f'  "{name}",\n' for name in sorted(names))
    MANIFEST.write_text(
        '// Generated by scripts/make-voice.py: every line with a recorded clip in public/sounds/Voice.\n'
        "// Don't edit by hand. Re-run the script after adding words, sentences or stories.\n"
        f'export const voiceClips: string[] = [\n{body}];\n',
        encoding='utf-8',
    )


def words(text):
    """Comparable words: lowercase, no punctuation, number words as digits."""
    out = []
    for w in re.findall(r"[a-z0-9']+", text.lower()):
        out.append(str(NUMBER_WORDS.index(w.capitalize())) if w.capitalize() in NUMBER_WORDS else w)
    return out


def check(todo):
    """Whisper is shaky on one-word clips, so pad each with silence, prime letter names, and treat
    the result as a list of clips to listen to, not a verdict."""
    from faster_whisper import WhisperModel

    model = WhisperModel('small', device='cpu', compute_type='int8')
    flagged = []
    for name, text in todo:
        raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', str(OUT / f'{name}.mp3'),
                              '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
        pad = np.zeros(8000, dtype=np.float32)
        audio = np.concatenate([pad, np.frombuffer(raw, dtype=np.float32), pad])
        letter = name.startswith('letter-')
        segs, _ = model.transcribe(audio, language='en', beam_size=5, initial_prompt=LETTER_PROMPT if letter else None)
        heard = ' '.join(s.text.strip() for s in segs)
        expected = [name[-1]] if letter else words(text)
        if words(heard)[: len(expected)] != expected:
            flagged.append(f'  {name}.mp3  said "{text}"  heard "{heard}"')
    print(f'checked {len(todo)} clips; {len(flagged)} to listen to:' if flagged else f'checked {len(todo)} clips: all match')
    print('\n'.join(flagged))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--force', action='store_true', help='re-voice clips that already exist')
    ap.add_argument('--check', action='store_true', help='transcribe the clips voiced this run and flag mismatches')
    ap.add_argument('--prune', action='store_true', help='delete clips no line uses any more')
    args = ap.parse_args()

    lines = lines_to_voice()
    todo = [(name, text) for name, text in lines.items() if args.force or not (OUT / f'{name}.mp3').exists()]
    if todo:
        voice(todo)
    stale = sorted(p for p in OUT.glob('*.mp3') if p.stem not in lines)
    if args.prune:
        for p in stale:
            p.unlink()
    write_manifest(name for name in lines if (OUT / f'{name}.mp3').exists())

    print(f'{len(lines)} lines, {len(todo)} voiced now, {len(lines) - len(todo)} already recorded')
    if stale and not args.prune:
        print(f'{len(stale)} clips no longer used (--prune deletes them): ' + ', '.join(p.stem for p in stale))
    if args.check and todo:
        check(todo)


if __name__ == '__main__':
    main()
