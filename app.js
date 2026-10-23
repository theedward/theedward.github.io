"use strict";
// Featured selection approved by João. Descriptions grounded in public READMEs (2026-10-23).
const PROJECTS = [
  {
    title: "Voltorb Lab",
    category: "01 / PUZZLE TOOL · REACT + TYPESCRIPT",
    description: "A Voltorb Flip companion for Pokémon HeartGold & SoulSilver. Enter the clues and revealed tiles to find guaranteed-safe flips or compare the remaining risks.",
    contribution: "Exact enumeration of clue-compatible boards, with dynamic programming and pruning. Probabilities treat compatible layouts equally; the game’s level-dependent generation can change the true prior odds.",
    note: "Unofficial fan utility. This board is illustrative, not a product screenshot. Final showcase media and personal contribution notes are still being selected.",
    url: "https://github.com/theedward/voltorb-flip",
    link: "Explore the repository",
  },
  {
    title: "Heimdall",
    category: "02 / NATIVE MACOS · SWIFTUI",
    description: "A quiet menu bar companion for disk space. It shows occupancy and available storage at a glance, with clear low-space states and a native panel for a closer look.",
    contribution: "Internal and external disk monitoring, configurable low-space notifications, and explicitly initiated storage reviews. Disk measurements stay local; cleanup actions require review rather than running silently in the background.",
    note: "Final app screenshots and personal contribution notes are pending. The repository documents installation, release status and limitations.",
    url: "https://github.com/theedward/heimdall",
    link: "Explore the repository",
  },
  {
    title: "Argus VLC SDK",
    category: "03 / IOS INFRASTRUCTURE · VLC + VLCKIT",
    description: "Pinned VLC/VLCKit source builds and packaging for an iOS media stack. This is the SDK dependency repository—not the Argus app or a released player showcase.",
    contribution: "Reproducible source preparation, verified patches, component notices and an automatic picture-in-picture policy overlay. The policy checks cover dispatch and teardown; real-device PiP still needs separate SDK and app validation.",
    note: "Build success is not App Store approval. Final technical showcase media and personal contribution notes are pending.",
    url: "https://github.com/theedward/argus-vlc-sdk",
    link: "Explore the SDK repository",
  },
  {
    title: "PokéLens 3DS",category:"04 / GAMEPLAY ASSISTANCE · NINTENDO 3DS",
    description:"A gameplay-assistance overlay bringing contextual battle information, exploration checklists and Pokémon guidance directly into Pokémon Omega Ruby on Nintendo 3DS.",
    contribution:"Battle-damage guidance for supported wild single-player encounters, hidden-item markers, acquisition advice with requirements and confidence, spoiler-aware area checklists, and puzzle hints with limited coverage.",
    note:"Usable development build. Currently targeting Pokémon Omega Ruby (USA, Rev 2) on original Nintendo 3DS.",
  },
];
const $ = (selector) => document.querySelector(selector);
const projectDialog = $("#project-dialog"),
  aboutDialog = $("#about-dialog"), collectionDialog = $("#collection-dialog");
const dialogState = new WeakMap();
let dialogGeneration = 0;
function announce(message) {
  $("#announcement").textContent = message;
}
function originTransform(dialog, opener) {
  const source = opener.getBoundingClientRect(),
    target = dialog.getBoundingClientRect();
  return `translate(${source.left + source.width / 2 - target.left - target.width / 2}px,${source.top + source.height / 2 - target.top - target.height / 2}px) scale(.12)`;
}
function openDialog(dialog, opener, isProject = false) {
  const previous = dialogState.get(dialog);
  previous?.animation?.cancel();
  previous?.hinge?.cancel();
  const state = {
    opener,
    generation: ++dialogGeneration,
    closing: false,
    animation: null,
    hinge: null,
  };
  dialogState.set(dialog, state);
  if (!dialog.open) dialog.showModal();
  document.body.style.overflow = "hidden";
  window.playroom.setPaused(true); // Focus the work; preserve the user's preference separately.
  dialog.querySelector(".close").focus();
  if (isProject) window.caseTransition.open(dialog, Number(opener.dataset.project), motionPreference, opener);
}
function requestClose(dialog) {
  const state = dialogState.get(dialog);
  if (!dialog.open || !state || state.closing) return;
  state.closing = true;
  state.animation?.cancel();
  const generation = state.generation;
  const finish = () => {
    if (dialogState.get(dialog)?.generation !== generation || !state.closing)
      return;
    state.animation?.cancel();
    state.hinge?.cancel();
    window.caseTransition.reset();
    dialog.close();
  };
  if(dialog===collectionDialog){window.collectionTransition.close(motionPreference,finish);return;}
  if (motionPreference || dialog !== projectDialog) {
    finish();
    return;
  }
  window.caseTransition.close(dialog, motionPreference, finish);
}
function openProject(index, trigger) {
  if (projectDialog.open) return;
  const p = PROJECTS[index];
  if (!p) return;
  $("#project-title").textContent = p.title;
  $("#project-category").textContent = p.category;
  $("#project-description").textContent = p.description;
  $("#project-contribution").textContent = p.contribution;
  $("#project-note").textContent = p.note;
  $("#case-number").textContent = `JOÃO SEIXAS / PLAYROOM / 0${index + 1}`;
  const visual = $("#project-visual");
  const cover=document.createElement("span");cover.className="case-art";
  const coverImage=document.createElement("img");coverImage.src="assets/room/case1.png";coverImage.alt="Provisional purple project cover";cover.append(coverImage);visual.replaceChildren(cover);
  visual.className = ["voltorb", "heimdall", "argus", "pokelens"][index];
  if(index>0){
    const title=document.createElement("strong");title.className="project-cover-title";title.textContent=p.title;visual.append(title);
  }
  if (index === 0) {
    const board = document.createElement("div");
    board.className = "board-illustration";
    board.setAttribute("role", "img");
    board.setAttribute(
      "aria-label",
      "Illustrative five-by-five puzzle board, not an actual game state or product screenshot",
    );
    const label = document.createElement("strong");
    label.textContent = "VOLTORB // LAB";
    board.append(label);
    const grid = document.createElement("div");
    grid.className = "puzzle-grid";
    const values = [
      "?",
      "1",
      "?",
      "2",
      "?",
      "1",
      "?",
      "?",
      "?",
      "3",
      "?",
      "?",
      "2",
      "?",
      "?",
      "?",
      "1",
      "?",
      "?",
      "?",
      "2",
      "?",
      "?",
      "3",
      "?",
    ];
    values.forEach((value, i) => {
      const tile = document.createElement("span");
      tile.textContent = value;
      tile.className = value === "?" ? "unknown" : "revealed";
      tile.setAttribute("aria-hidden", "true");
      grid.append(tile);
    });
    board.append(grid);
    const caption = document.createElement("p");
    caption.textContent = "A little logic. A little less luck.";
    board.append(caption);
    visual.replaceChildren(board);
  }
  document.querySelector(".art-disclaimer").textContent =
    index === 0
      ? "ILLUSTRATIVE BOARD · NOT A PRODUCT SCREENSHOT"
      : "PROVISIONAL COVER · SHOWCASE MEDIA PENDING";
  const actions = $("#project-actions");
  actions.replaceChildren();
  if (p.url) {
    const a = document.createElement("a");
    a.href = p.url;
    a.textContent = p.link;
    a.className = "action";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    actions.append(a);
  }
  projectDialog.querySelector('.close').setAttribute('aria-label',collectionDialog.open?'Back to collection':'Close project');
  openDialog(projectDialog, trigger, true);
}
document
  .querySelectorAll("[data-project]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      openProject(Number(button.dataset.project), button),
    ),
  );
$("#about").addEventListener("click", (e) =>
  openDialog(aboutDialog, e.currentTarget),
);
function openCollection(trigger){
  if(collectionDialog.open||projectDialog.open)return;
  openDialog(collectionDialog,trigger);
  window.collectionTransition.open(collectionDialog, motionPreference);
}
$("#collection-box").addEventListener("click",e=>openCollection(e.currentTarget));
$("#collection-access").addEventListener("click",e=>openCollection(e.currentTarget));
for (const dialog of [projectDialog, aboutDialog, collectionDialog]) {
  dialog
    .querySelector(".close")
    .addEventListener("click", () => requestClose(dialog));
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    requestClose(dialog);
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      requestClose(dialog);
  });
  dialog.addEventListener("close", () => {
    if(dialog.open)return;
    if(dialog===projectDialog)window.caseTransition.reset();
    if(dialog===collectionDialog)window.collectionTransition.reset();
    if(document.querySelector("dialog[open]")){dialogState.get(dialog)?.opener?.focus();return;}
    window.caseTransition.reset();
    document.body.style.overflow = "";
    window.playroom.setPaused(motionPreference);
    const active = document.activeElement;
    if (
      active === document.body ||
      active === dialog ||
      dialog.contains(active)
    )
      dialogState.get(dialog)?.opener?.focus();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const nodes = [...dialog.querySelectorAll('button,a[href],[tabindex="0"]')];
    const first = nodes[0],
      last = nodes.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}
const media = matchMedia("(prefers-reduced-motion: reduce)");
let manualMotion = false;
let motionPreference = media.matches;
function setMotion(paused) {
  motionPreference = paused;
  window.playroom.setPaused(paused || !!document.querySelector("dialog[open]"));
  document.documentElement.classList.toggle("no-motion", paused);
  if(paused && projectDialog.open) window.caseTransition.reset();
  if(paused && collectionDialog.open) window.collectionTransition.reset();
  $("#motion").setAttribute("aria-pressed", String(paused));
  $("#motion span").textContent = paused ? "Resume motion" : "Pause motion";
}
setMotion(media.matches);
media.addEventListener("change", (e) => {
  if (!manualMotion) setMotion(e.matches);
});
$("#motion").addEventListener("click", () => {
  manualMotion = true;
  setMotion(!motionPreference);
});
$("#monitor").addEventListener("click", () => {
  const index=window.playroom.cycleScreen();
  announce(["A tiny pixel landscape on the monitor.","The monitor switches to a build preview.","The monitor switches to a puzzle grid."][index]);
});
$("#cat").addEventListener("click", () => {
  announce(window.playroom.petCat() ? "Ahri gives a sleepy yawn." : "Ahri is resting. Hello, sleepy friend.");
});
$("#lamp-egg").addEventListener("click", () => {
  announce(window.playroom.dipLamp() ? "The desk lamp gently dips and warms back up." : "The desk lamp stays warm and steady.");
});
$("#ball-egg").addEventListener("click", () => {
  announce(window.playroom.bounceBall() ? "One little keepy-uppy. Back in its spot." : "The Total 90 is ready for the next match.");
});
// Original no-sample synthwave draft. Never fetch/play or remember opt-in before a click.
const ambience = $("#ambience");
ambience.volume = 0.12;
let audioWanted = false;
let audioGeneration = 0;
function updateAudioUI() {
  $("#audio").setAttribute("aria-pressed", String(audioWanted));
  $("#audio span").textContent = audioWanted ? "Sound on" : "Sound off";
}
async function startAmbience(generation) {
  try {
    await ambience.play();
    if (!audioWanted || document.hidden) ambience.pause();
    return true;
  } catch (error) {
    if (generation !== audioGeneration) return;
    audioWanted = false;
    ambience.pause();
    updateAudioUI();
    announce(
      "Audio could not start. The room still works without sound; you can try the sound button again.",
    );
    return false;
  }
}
$("#audio").addEventListener("click", async () => {
  $("#audio").disabled = true;
  const generation = ++audioGeneration;
  audioWanted = !audioWanted;
  updateAudioUI();
  try {
    if (audioWanted) {
      const started = await startAmbience(generation);
      if (started && audioWanted)
        announce(
          "Afterglow, an original draft synthwave loop, is playing quietly.",
        );
    } else {
      ambience.pause();
      announce("Sound muted.");
    }
  } finally {
    $("#audio").disabled = false;
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) ambience.pause();
  else if (audioWanted) startAmbience(audioGeneration);
});
