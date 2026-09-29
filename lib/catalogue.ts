import type { TKey } from "./i18n";

export type CategoryId =
  | "switches"
  | "fans"
  | "lighting"
  | "power"
  | "general";

export type Category = {
  id: CategoryId;
  /** Hex livery, sampled from the logo. Drives the container colour. */
  color: string;
  /** ISO 6346-style marking. BBKU = Boideshik Banik, U = freight container. */
  code: string;
  labelKey: TKey;
  noteKey: TKey;
};

/**
 * Order matters — this is the stacking order in the hero, bottom row first.
 * The five liveries are exactly the five colours present in the logo.
 */
export const CATEGORIES: Category[] = [
  {
    id: "switches",
    color: "#1b6dc1",
    code: "BBKU 483921 7",
    labelKey: "cat.switches",
    noteKey: "cat.switches.note",
  },
  {
    id: "fans",
    color: "#f5901e",
    code: "BBKU 552140 3",
    labelKey: "cat.fans",
    noteKey: "cat.fans.note",
  },
  {
    id: "lighting",
    color: "#d6252b",
    code: "BBKU 610877 1",
    labelKey: "cat.lighting",
    noteKey: "cat.lighting.note",
  },
  {
    id: "power",
    color: "#14417f",
    code: "BBKU 729305 9",
    labelKey: "cat.power",
    noteKey: "cat.power.note",
  },
  {
    id: "general",
    color: "#1a7a3c",
    code: "BBKU 804613 5",
    labelKey: "cat.general",
    noteKey: "cat.general.note",
  },
];

/** Real 20ft ISO dimensions in metres — the scene is modelled to scale. */
export const CONTAINER_DIMS = {
  length: 6.06,
  height: 2.59,
  width: 2.44,
} as const;
