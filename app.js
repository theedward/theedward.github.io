"use strict";
// Edit this collection to add verified projects. Placeholder copy is deliberately explicit.
const PROJECTS = [
  {
    title: "Voltorb Lab",
    category: "01 / PUZZLE TOOL · REACT + TYPESCRIPT",
    description:
      "An exact-enumeration solver for Voltorb Flip. Enter the row and column clues, reveal tiles, and see guaranteed-safe moves or ranked risks. Built for a phone beside your DS.",
    contribution:
      "Project details and João’s exact contribution are awaiting confirmation. No role, results, or achievements have been assumed.",
    note: "Work-in-progress portfolio entry. Final screenshots and case study still to be added.",
    url: "https://github.com/theedward/voltorb-flip",
    link: "Explore the repository",
  },
  {
    title: "The next chapter",
    category: "02 / PROJECT SELECTION TBD",
    description:
      "A place reserved for a project worth sharing. For now, this case is a prototype of how the story will feel.",
    contribution:
      "To be filled in once the project is selected: the challenge, what I owned, and what I learned.",
    note: "Placeholder — not a shipped project. The cover is original concept art.",
  },
  {
    title: "A good side quest",
    category: "03 / PROJECT SELECTION TBD",
    description:
      "The unexpected experiments deserve a place on the shelf, too. The project for this slot has not been selected yet.",
    contribution:
      "Project selection, contribution, screenshots, and links are all to be confirmed.",
    note: "Placeholder — not a shipped project. The cover is original concept art.",
  },
];
const $ = (selector) => document.querySelector(selector);
const projectDialog = $("#project-dialog"),
  aboutDialog = $("#about-dialog");
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
  if (isProject && !motionPreference) {
    state.animation = dialog.animate(
      [
        { transform: originTransform(dialog, opener), opacity: 0.35 },
        { transform: "translate(0,0) scale(1)", opacity: 1 },
      ],
      { duration: 480, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
  }
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
    dialog.close();
  };
  if (motionPreference || dialog !== projectDialog) {
    finish();
    return;
  }
  state.hinge = dialog
    .querySelector(".case-inside")
    .animate([{ transform: "rotateY(0)" }, { transform: "rotateY(74deg)" }], {
      duration: 260,
      easing: "ease-in",
      fill: "forwards",
    });
  state.animation = dialog.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1, offset: 0 },
      { transform: "translate(0,0) scale(.94)", opacity: 1, offset: 0.3 },
      {
        transform: originTransform(dialog, state.opener),
        opacity: 0,
        offset: 1,
      },
    ],
    { duration: 420, easing: "cubic-bezier(.6,0,.8,.3)", fill: "forwards" },
  );
  state.animation.finished.then(finish, () => {});
}
function openProject(index, trigger) {
  const p = PROJECTS[index];
  if (!p) return;
  $("#project-title").textContent = p.title;
  $("#project-category").textContent = p.category;
  $("#project-description").textContent = p.description;
  $("#project-contribution").textContent = p.contribution;
  $("#project-note").textContent = p.note;
  $("#case-number").textContent = `JOÃO SEIXAS / PLAYROOM / 0${index + 1}`;
  const visual = $("#project-visual");
  visual.replaceChildren(
    document
      .querySelector(`.game-case[data-project="${index}"] .case-art`)
      .cloneNode(true),
  );
  visual.className = ["voltorb", "garden", "moon"][index];
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
      : "CONCEPT ART · NOT A PRODUCT SCREENSHOT";
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
for (const dialog of [projectDialog, aboutDialog]) {
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
    if (dialog.open || document.querySelector("dialog[open]")) return; // Ignore stale close events.
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
  const index = window.playroom.cycleScreen();
  announce(
    [
      "The monitor shows a code editor.",
      "The monitor shows a puzzle concept.",
      "The monitor shows a drifting planet.",
    ][index],
  );
});
$("#cat").addEventListener("click", () => {
  window.playroom.petCat();
  announce("Ahri opens her blue eyes. Hello, sleepy friend.");
});
$("#headphones").addEventListener("click", () => {
  window.playroom.hum();
  announce("A little tune appears above João’s headphones. Visual only.");
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
