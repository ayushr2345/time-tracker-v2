import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";
import App from "./App";

test("Smoke Test: App renders without crashing", () => {
  // 1. "Plug it in" - This mounts the entire React component tree in memory
  render(<App />);

  // 2. "Check for smoke" - Look for a core element that should ALWAYS be on the screen
  // Change 'Activity Tracker' to whatever your main header or title actually says
  const mainHeader = screen.getByText(/Activity Tracker/i);

  // 3. The Assertion - If it finds the text, the app didn't crash.
  expect(mainHeader).toBeInTheDocument();
});
