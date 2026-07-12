// /**
//  * JaundiCare — useAudio hook
//  * Plays welcome audio in the user's selected language.
//  * Works fully offline — audio files bundled with the app.
//  */

// import { useCallback } from "react";
// import { Audio } from "expo-audio";

// const AUDIO_FILES: Record<string, any> = {
//   en:  require("../assets/audio/welcome_en.m4a"),
//   yo:  require("../assets/audio/welcome_yo.m4a"),
//   ha:  require("../assets/audio/welcome_ha.m4a"),
//   ig:  require("../assets/audio/welcome_ig.opus"),
//   pcm: require("../assets/audio/welcome_pcm.m4a"),
// };

// let currentSound: any = null;

// export function useWelcomeAudio() {

//   const playWelcome = useCallback(async (language: string) => {
//     try {
//       // Stop any currently playing audio first
//       if (currentSound) {
//         await currentSound.stopAsync();
//         await currentSound.unloadAsync();
//         currentSound = null;
//       }

//       const source = AUDIO_FILES[language] ?? AUDIO_FILES.en;
//       const { sound } = await Audio.Sound.createAsync(source);
//       currentSound = sound;
//       await sound.playAsync();

//       // Auto-unload when finished
//       sound.setOnPlaybackStatusUpdate((status: any) => {
//         if (status.didJustFinish) {
//           sound.unloadAsync();
//           currentSound = null;
//         }
//       });
//     } catch (err) {
//       console.log("Audio playback error (non-critical):", err);
//     }
//   }, []);

//   const stopAudio = useCallback(async () => {
//     try {
//       if (currentSound) {
//         await currentSound.stopAsync();
//         await currentSound.unloadAsync();
//         currentSound = null;
//       }
//     } catch (err) {
//       console.log("Audio stop error (non-critical):", err);
//     }
//   }, []);

//   return { playWelcome, stopAudio };
// }




/**
 * JaundiCare — useAudio hook
 * Plays welcome audio in the user's selected language.
 * Works fully offline — audio files bundled with the app.
 */

// import { useCallback, useRef } from "react";
// import { createAudioPlayer } from "expo-audio";

// const AUDIO_FILES: Record<string, any> = {
//   en:  require("../assets/audio/welcome_en.m4a"),
//   yo:  require("../assets/audio/welcome_yo.m4a"),
//   ha:  require("../assets/audio/welcome_ha.m4a"),
//   ig:  require("../assets/audio/welcome_ig.opus"),
//   pcm: require("../assets/audio/welcome_pcm.m4a"),
// };

// // Keep tracking the active player natively across hook evaluations
// let globalActivePlayer: any = null;

// export function useWelcomeAudio() {
//   const playWelcome = useCallback((language: string) => {
//     try {
//       // 1. Immediately kill any background voice track that is currently running
//       if (globalActivePlayer) {
//         globalActivePlayer.terminate(); // Modern way to clear memory instantly
//         globalActivePlayer = null;
//       }

//       // 2. Fall back cleanly if an unexpected string comes in
//       const source = AUDIO_FILES[language] ?? AUDIO_FILES.en;

//       // 3. Instantiate the modern player engine directly with the static asset
//       const player = createAudioPlayer(source);
//       globalActivePlayer = player;

//       // 4. Fire the audio track off instantly
//       player.play();
//     } catch (err) {
//       console.log("Audio playback error (non-critical):", err);
//     }
//   }, []);

//   const stopAudio = useCallback(() => {
//     try {
//       if (globalActivePlayer) {
//         globalActivePlayer.terminate();
//         globalActivePlayer = null;
//       }
//     } catch (err) {
//       console.log("Audio stop error (non-critical):", err);
//     }
//   }, []);

//   return { playWelcome, stopAudio };
// }



// /**
//  * JaundiCare — useAudio hook
//  * Plays welcome audio in the user's selected language.
//  * Works fully offline — audio files bundled with the app.
//  */

// import { useCallback } from "react";
// import { createAudioPlayer } from "expo-audio";

// const AUDIO_FILES: Record<string, any> = {
//   en:  require("../assets/audio/welcome_en.m4a"),
//   yo:  require("../assets/audio/welcome_yo.m4a"),
//   ha:  require("../assets/audio/welcome_ha.m4a"),
//   ig:  require("../assets/audio/welcome_ig.opus"),
//   pcm: require("../assets/audio/welcome_pcm.m4a"), // Nigerian Pidgin track
// };

// // Tracks the single active imperative player across components safely
// let globalActivePlayer: any = null;

// export function useWelcomeAudio() {
  
//   const stopAudio = useCallback(() => {
//     try {
//       if (globalActivePlayer) {
//         // Correct lifecycle sequence for expo-audio to prevent native hardware leaks
//         globalActivePlayer.remove();
//         globalActivePlayer.release();
//         globalActivePlayer = null;
//       }
//     } catch (err) {
//       console.log("[useWelcomeAudio] Audio stop tracking error:", err);
//     }
//   }, []);

//   const playWelcome = useCallback((language: string) => {
//     try {
//       // 1. Immediately drop and release previous audio slots
//       stopAudio();

//       // 2. Clear unexpected locale inputs using clean English fallback bounds
//       const source = AUDIO_FILES[language] ?? AUDIO_FILES.en;

//       // 3. Create instance and save to our memory-managed tracker variable
//       const player = createAudioPlayer(source);
//       globalActivePlayer = player;

//       // 4. Fire playback
//       player.play();
//     } catch (err) {
//       console.log("[useWelcomeAudio] Audio playback initialization failed:", err);
//     }
//   }, [stopAudio]);

//   return { playWelcome, stopAudio };
// }



/**
 * JaundiCare — useAudio hook (Production-Hardened)
 * Plays welcome audio in the user's selected language fully offline.
 */

import { useCallback } from "react";
import { createAudioPlayer, AudioPlayer } from "expo-audio";

const AUDIO_FILES: Record<string, any> = {
  en:  require("../assets/audio/welcome_en.m4a"),
  yo:  require("../assets/audio/welcome_yo.m4a"),
  ha:  require("../assets/audio/welcome_ha.m4a"),
  ig:  require("../assets/audio/welcome_ig.m4a"), // 🎧 Re-encode .opus to .m4a for unified iOS/Android cross-compat
  pcm: require("../assets/audio/welcome_pcm.m4a"),
};

// ── Production Scaling Win: Initialize players EXACTLY ONCE at boot ──────────
// This completely eliminates native allocation runtime memory leaks.
const players: Record<string, AudioPlayer> = {};
try {
  Object.keys(AUDIO_FILES).forEach((lang) => {
    players[lang] = createAudioPlayer(AUDIO_FILES[lang]);
  });
} catch (err) {
  console.log("[useWelcomeAudio] Static player pre-allocation failed:", err);
}

export function useWelcomeAudio() {
  
  const stopAllAudio = useCallback(() => {
    try {
      // Safely pause every pre-allocated player channel and reset tracks to start
      Object.values(players).forEach((player) => {
        if (player.playing) {
          player.pause();
        }
        // Modern expo-audio utilizes standard seek parameters to rewind playback safely
        player.seekTo(0);
      });
    } catch (err) {
      console.log("[useWelcomeAudio] Audio stop sequence error:", err);
    }
  }, []);

  const playWelcome = useCallback((language: string) => {
    try {
      // 1. Instantly silence any active audio tracks running anywhere in the application
      stopAllAudio();

      // 2. Resolve language key with clean fallback bounds
      const targetLanguage = players[language] ? language : "en";
      const activePlayer = players[targetLanguage];

      if (activePlayer) {
        // 3. Fire playback on the pre-allocated native layer channel cleanly
        activePlayer.play();
      }
    } catch (err) {
      console.log("[useWelcomeAudio] Audio playback initialization failed:", err);
    }
  }, [stopAllAudio]);

  return { playWelcome, stopAudio: stopAllAudio };
}