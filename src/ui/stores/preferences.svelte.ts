type Theme = "light" | "dark" | "system";

let themeValue = $state<Theme>("system");
let expandedCardsValue = $state<Set<string>>(new Set());
let expandedSectionsValue = $state<Set<string>>(new Set());

/**
 * UI Preferences store for managing theme and component expansion state.
 * Uses Svelte 5 runes for reactivity and persists theme to localStorage.
 */
export const preferences = {
  // Getters
  get theme() { return themeValue; },
  get expandedCards() { return expandedCardsValue; },
  get expandedSections() { return expandedSectionsValue; },

  // Initialization
  init(): void {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      this.setTheme(savedTheme);
    } else {
      this.applyTheme("system");
    }

    // Listen for system theme changes if we're in 'system' mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
      if (themeValue === "system") {
        this.applyTheme("system");
      }
    });
  },

  // Actions
  setTheme(newTheme: Theme): void {
    themeValue = newTheme;
    localStorage.setItem("theme", newTheme);
    this.applyTheme(newTheme);
  },

  toggleTheme(): void {
    const cycle: Theme[] = ["system", "light", "dark"];
    const currentIndex = cycle.indexOf(themeValue);
    const nextIndex = (currentIndex + 1) % cycle.length;
    this.setTheme(cycle[nextIndex]);
  },

  applyTheme(theme: Theme): void {
    let effectiveTheme: "light" | "dark";
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      effectiveTheme = theme;
    }
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  },

  toggleCard(collectorId: string): void {
    if (expandedCardsValue.has(collectorId)) {
      expandedCardsValue.delete(collectorId);
    } else {
      expandedCardsValue.add(collectorId);
    }
  },

  isCardExpanded(collectorId: string): boolean {
    return expandedCardsValue.has(collectorId);
  },

  toggleSection(sectionId: string): void {
    if (expandedSectionsValue.has(sectionId)) {
      expandedSectionsValue.delete(sectionId);
    } else {
      expandedSectionsValue.add(sectionId);
    }
  },

  isSectionExpanded(sectionId: string): boolean {
    return expandedSectionsValue.has(sectionId);
  }
};
