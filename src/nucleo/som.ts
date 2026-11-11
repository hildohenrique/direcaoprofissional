import { lerEstado } from './estado';

/* Sons curtos feitos na hora com o próprio navegador: nenhum arquivo para baixar. */
let ctx: AudioContext | null = null;

function nota(freq: number, inicio: number, dur: number, volume = 0.08, tipo: OscillatorType = 'sine') {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const ganho = ctx.createGain();
  osc.type = tipo;
  osc.frequency.value = freq;
  ganho.gain.setValueAtTime(0, ctx.currentTime + inicio);
  ganho.gain.linearRampToValueAtTime(volume, ctx.currentTime + inicio + 0.015);
  ganho.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + dur);
  osc.connect(ganho).connect(ctx.destination);
  osc.start(ctx.currentTime + inicio);
  osc.stop(ctx.currentTime + inicio + dur + 0.02);
}

export function tocar(qual: 'certo' | 'errado' | 'toque' | 'chegada') {
  if (!lerEstado().ajustes.som) return;
  try {
    const Classe = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Classe) return;
    ctx ??= new Classe();
    if (ctx.state === 'suspended') void ctx.resume();
    if (qual === 'certo') {
      nota(660, 0, 0.14);
      nota(880, 0.09, 0.22);
    } else if (qual === 'errado') {
      nota(220, 0, 0.2, 0.06, 'triangle');
    } else if (qual === 'toque') {
      nota(520, 0, 0.06, 0.04);
    } else {
      [523, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.11, 0.3, 0.07));
    }
  } catch {
    /* sem áudio, sem problema */
  }
}

export function vibrar(ms: number | number[] = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* aparelho sem vibração */
  }
}

/* ---------- leitura em voz alta ---------- */
export function vozDisponivel(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function falar(texto: string) {
  if (!vozDisponivel()) return;
  try {
    window.speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';
    fala.rate = 1;
    const voz = window.speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith('pt-br'));
    if (voz) fala.voice = voz;
    window.speechSynthesis.speak(fala);
  } catch {
    /* navegador sem voz */
  }
}

export function calar() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* nada a fazer */
  }
}
