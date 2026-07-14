/**
 * One-screen welcome narration.
 *
 * A single Expo-managed player is deliberately reused for every language.
 * Creating one player per language allowed old narration to continue after a
 * language change or after leaving onboarding.
 */
import { useCallback, useEffect, useRef } from "react";
import { useAudioPlayer } from "expo-audio";

const AUDIO_FILES = {
  en: require("../assets/audio/welcome_en.m4a"),
  yo: require("../assets/audio/welcome_yo.m4a"),
  ha: require("../assets/audio/welcome_ha.m4a"),
  ig: require("../assets/audio/welcome_ig.m4a"),
  pcm: require("../assets/audio/welcome_pcm.m4a"),
} as const;

type WelcomeLanguage = keyof typeof AUDIO_FILES;

function resolveLanguage(language: string): WelcomeLanguage {
  return language in AUDIO_FILES ? (language as WelcomeLanguage) : "en";
}

export function useWelcomeAudio() {
  const player = useAudioPlayer(AUDIO_FILES.en);
  const loadedLanguage = useRef<WelcomeLanguage>("en");

  const stopAudio = useCallback(() => {
    try {
      player.pause();
      void player.seekTo(0).catch(() => undefined);
    } catch {
      // The player may already have been released during screen teardown.
    }
  }, [player]);

  const playWelcome = useCallback((language: string) => {
    const targetLanguage = resolveLanguage(language);

    try {
      // Pause first, before replacing the source, so two narrations can never
      // be audible at once.
      player.pause();
      if (loadedLanguage.current !== targetLanguage) {
        player.replace(AUDIO_FILES[targetLanguage]);
        loadedLanguage.current = targetLanguage;
      }
      void player.seekTo(0).catch(() => undefined);
      player.play();
    } catch (error) {
      console.warn("Welcome narration could not start.", error);
    }
  }, [player]);

  useEffect(() => stopAudio, [stopAudio]);

  return { playWelcome, stopAudio };
}
