// Keep the website's approved narrations in the web bundle. Importing them
// from the mobile folder made a Vercel deployment depend on files outside its
// configured root directory and left some browsers on the old two-file setup.
import welcomeEnglish from "../assets/audio/welcome_en.m4a";
import welcomeYoruba from "../assets/audio/welcome_yo.m4a";
import welcomeHausa from "../assets/audio/welcome_ha.m4a";
import welcomeIgbo from "../assets/audio/welcome_ig.m4a";
import welcomePidgin from "../assets/audio/welcome_pcm.m4a";

const sources = {
  en: welcomeEnglish,
  yo: welcomeYoruba,
  ha: welcomeHausa,
  ig: welcomeIgbo,
  pcm: welcomePidgin,
};

let activeAudio = null;

/**
 * The browser can only start sound after a user gesture. Reusing one Audio
 * instance and stopping it before every new language prevents overlapping
 * narration when someone changes languages quickly.
 */
export function stopWelcomeAudio() {
  if (!activeAudio) return;
  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio = null;
}

export async function playWelcomeAudio(language) {
  stopWelcomeAudio();
  const audio = new Audio(sources[language] || sources.en);
  audio.preload = "auto";
  activeAudio = audio;
  audio.addEventListener("ended", () => {
    if (activeAudio === audio) activeAudio = null;
  }, { once: true });

  try {
    await audio.play();
  } catch (error) {
    if (activeAudio === audio) activeAudio = null;
    throw error;
  }
}
