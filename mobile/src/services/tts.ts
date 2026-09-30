import Tts from 'react-native-tts';

let isTtsInitialized = false;

export function initTts(): void {
  if (!isTtsInitialized) {
    try {
      Tts.setDefaultRate(0.45); // Slower, clearer speech rate for elderly users
      Tts.setDefaultPitch(1.0);
      isTtsInitialized = true;
    } catch (e) {
      console.warn('TTS initialization warning:', e);
    }
  }
}

export function speakMedicineReminder(medicineTitle: string, dosage: string, instructions?: string): void {
  try {
    initTts();
    Tts.stop();
    const message = `Time to take your ${medicineTitle}, ${dosage}.${instructions ? ` ${instructions}` : ''}`;
    Tts.speak(message);
  } catch (err) {
    console.warn('TTS speak error:', err);
  }
}

export function stopSpeaking(): void {
  try {
    Tts.stop();
  } catch (err) {
    // Ignore
  }
}
