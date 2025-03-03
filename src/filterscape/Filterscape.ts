import { Rs2fModule } from "../types/Rs2fModule";

const cluesModule: Rs2fModule = {
  name: "Clues",
  input: [
    {
      name: "VAR_CLUE_HIDE",
      label: "Hide clue tiers",
      type: "itemlist",
      enum: [
        "clue scroll (beginner)",
        "clue scroll (easy)",
        "clue scroll (medium)",
        "clue scroll (hard)",
        "clue scroll (elite)",
        "clue scroll (master)",
      ],
    },
    {
      name: "VAR_CLUE_BEGINNER_CUSTOMSTYLE",
      label: "Display: beginner clue",
      type: "style",
    },
    {
      name: "VAR_CLUE_EASY_CUSTOMSTYLE",
      label: "Display: easy clue",
      type: "style",
    },
    {
      name: "VAR_CLUE_MEDIUM_CUSTOMSTYLE",
      label: "Display: medium clue",
      type: "style",
    },
    {
      name: "VAR_CLUE_HARD_CUSTOMSTYLE",
      label: "Display: hard clue",
      type: "style",
    },
    {
      name: "VAR_CLUE_ELITE_CUSTOMSTYLE",
      label: "Display: elite clue",
      type: "style",
    },
    {
      name: "VAR_CLUE_MASTER_CUSTOMSTYLE",
      label: "Display: master clue",
      type: "style",
    },
  ],
};

const filterscapeModules = [cluesModule];

export const filterscape = {
  name: "Filterscape",
  modules: filterscapeModules,
};
