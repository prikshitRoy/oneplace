// Layer 3 Playwright E2E tests covering responsive desktop/mobile layout, navigation, and themes.

import { expect, test } from "@playwright/test";
import { installTauriBrowserMock } from "./tauri-ipc-bridge";

test.describe("One Place E2E — Critical User Flows", () => {
  test("adapts navigation layout to Desktop vs Mobile viewport sizes", async ({
    page,
    isMobile,
  }) => {
    // Arrange
    await installTauriBrowserMock(page, isMobile ? "android" : "windows");

    // Act
    await page.goto("/");
    await expect(page.getByText("Workspaces")).toBeVisible();

    // Assert
    const desktopSidebar = page.getByRole("complementary", {
      name: "Storage locations",
    });
    const mobileBottomBar = page.getByRole("navigation", {
      name: "Mobile storage locations",
    });

    if (isMobile) {
      await expect(mobileBottomBar).toBeVisible();
      await expect(desktopSidebar).toBeHidden();
    } else {
      await expect(desktopSidebar).toBeVisible();
      await expect(mobileBottomBar).toBeHidden();
    }
  });

  test("navigates into a subfolder and creates a new directory end-to-end", async ({
    page,
  }) => {
    // Arrange
    await installTauriBrowserMock(page, "windows");
    await page.goto("/");
    await expect(page.getByText("Workspaces")).toBeVisible();

    // Act: open Workspaces subfolder and return via Back button
    await page.getByRole("button", { name: "Open", exact: true }).first().click();
    await expect(page.getByText("architecture.pdf")).toBeVisible();
    await page.getByRole("button", { name: "Navigate back" }).click();
    await expect(page.getByText("notes.md")).toBeVisible();

    // Act: create a new folder named Releases
    await page.getByRole("button", { name: "New Folder" }).click();
    await page.getByPlaceholder("Enter name...").fill("Releases");
    await page.getByRole("button", { name: "Confirm" }).click();

    // Assert
    await expect(page.getByText("Releases")).toBeVisible();
  });

  test("persists selected Light theme across full page reloads", async ({
    page,
    isMobile,
  }) => {
    // Arrange
    await installTauriBrowserMock(page, isMobile ? "android" : "windows");
    await page.goto("/");
    await expect(page.getByText("Workspaces")).toBeVisible();

    // Act: open Settings from visible navigation bar and select Light theme
    const navContainer = isMobile
      ? page.getByRole("navigation", { name: "Mobile storage locations" })
      : page.getByRole("complementary", { name: "Storage locations" });

    await navContainer.getByRole("button", { name: /Settings/i }).click();
    await page
      .getByRole("dialog", { name: "Settings" })
      .getByRole("button", { name: /Light/i })
      .click();
    await page.getByRole("button", { name: "Done" }).click();

    // Assert: Light theme remains active after reloading the browser page
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});
