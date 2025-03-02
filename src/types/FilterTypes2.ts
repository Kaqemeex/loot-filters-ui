// Needs to match the display config in the plugin. All display features should be supported.

import { ArgbHexColor } from "./hexcolor";

// https://github.com/riktenx/loot-filters/blob/main/src/main/java/com/lootfilters/DisplayConfig.java
type DisplayConfig = {
  textColor: ArgbHexColor;
  backgroundColor: ArgbHexColor;
  borderColor: ArgbHexColor;
  hidden: boolean;
  showLootbeam: boolean;
  showValue: boolean;
  showDespawn: boolean;
  notify: boolean;
  textAccent: TextAccent;
  textAccentColor: ArgbHexColor;
  lootbeamColor: ArgbHexColor;
  fontType: FontType;
  menuTextColor: ArgbHexColor;
  hideOverlay: boolean;
  highlightTile: boolean;
  tileStrokeColor: ArgbHexColor;
  tileFillColor: ArgbHexColor;
};

enum TextAccent {
  USE_FILTER = "use filter",
  SHADOW = "shadow",
  OUTLINE = "outline",
  NONE = "none",
}

enum FontType {
  USE_FILTER = "use filter",
  NORMAL = "normal",
  LARGER = "larger",
}

type LootFilter = {
  name: string;
  displayConfig: Partial<DisplayConfig> & {
    textColor: ArgbHexColor;
    fontType: FontType;
  };
  groups: LootGroup[];
};

type LootGroup = {
  name: string;
  description?: string;
  displayConfig: Partial<DisplayConfig>;
  targets: LootTarget[];
};

type LootTarget = {
  name: string;
  description?: string;
  displayConfig: Partial<DisplayConfig>;
  examples?: string[];
  rules: LootRule[];
};

export type LootRuleType = (typeof lootRuleTypes)[number];
export const lootRuleTypes = [
  "name",
  "id",
  "value",
  "noted",
  "stackable",
  "tradeable",
  "boolean",
];

type LootRule =
  | ItemNameRule
  | ItemIdRule
  | ItemValueRule
  | ItemNotedRule
  | ItemStackableRule
  | ItemTradeableRule
  | BooleanRule;

type BooleanRule = {
  type: "boolean";
  operator: "not" | "and" | "or";
  rules: LootRule[];
};

type ItemNameRule = {
  type: "name";
  pattern: string;
};

type ItemIdRule = {
  type: "id";
  id: number;
};

type ItemValueRule = {
  type: "value";
  operator: ">" | "<" | "=" | ">=" | "<=";
  value: number;
};

type ItemNotedRule = {
  type: "noted";
  noted: boolean;
};

type ItemStackableRule = {
  type: "stackable";
  stackable: boolean;
};

type ItemTradeableRule = {
  type: "tradeable";
  tradeable: boolean;
};

export { FontType, TextAccent };

export type {
  BooleanRule,
  DisplayConfig,
  ItemIdRule,
  ItemNameRule,
  ItemNotedRule,
  ItemStackableRule,
  ItemTradeableRule,
  ItemValueRule,
  LootFilter,
  LootGroup,
  LootRule,
  LootTarget,
};

// Customizations

type LootFilterCustomization = {
  filterName: string;
  displayConfigCustomizations: Partial<DisplayConfig>;
  lootGroupCustomizations: LootGroupCustomization[];
};

type LootGroupCustomization = {
  groupName: string;
  displayConfig: Partial<DisplayConfig>;
  lootTargets: LootTargetCustomization[];
};

type LootTargetCustomization = {
  targetName: string;
  displayConfigCustomizations: Partial<DisplayConfig>;
  lootRules: LootRuleCustomization[];
};

type LootRuleCustomization = {
  lootRule: LootRule;
  operation: "add" | "remove" | "replace";
};

export type {
  LootFilterCustomization,
  LootGroupCustomization,
  LootTargetCustomization,
  LootRuleCustomization,
};

const applyLootGroupCustomization = (
  group: LootGroup,
  customization: LootGroupCustomization
): LootGroup => {
  const updated = { ...group };
  updated.targets = group.targets.map((target) => {
    const targetCustomization = customization.lootTargets.find(
      (customization) => customization.targetName === target.name
    );
    if (targetCustomization) {
      return applyLootTargetCustomization(target, targetCustomization);
    }
    return target;
  });
  return updated;
};

const applyLootTargetCustomization = (
  target: LootTarget,
  customization: LootTargetCustomization
): LootTarget => {
  let rules = [...target.rules];

  customization.lootRules.forEach((ruleCustomization) => {
    switch (ruleCustomization.operation) {
      case "add":
        rules.push(ruleCustomization.lootRule);
        break;
      case "remove":
        rules = rules.filter((rule) => rule !== ruleCustomization.lootRule);
        break;
    }
  });

  return {
    ...target,
    rules,
    displayConfig: {
      ...target.displayConfig,
      ...customization.displayConfigCustomizations,
    },
  };
};

export const applyCustomizations = (
  filter: LootFilter,
  customizations: LootFilterCustomization
): LootFilter => {
  const updated = { ...filter };
  updated.displayConfig = {
    ...filter.displayConfig,
    ...customizations.displayConfigCustomizations,
  };
  updated.groups = filter.groups.map((group) => {
    const groupCustomization = customizations.lootGroupCustomizations.find(
      (customization) => customization.groupName === group.name
    );
    if (groupCustomization) {
      return applyLootGroupCustomization(group, groupCustomization);
    }
    return group;
  });

  return filter;
};
