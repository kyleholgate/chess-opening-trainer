import "@testing-library/jest-dom";
import React from "react";

// Mock next/image
jest.mock("next/image", () => {
  return function MockedImage(
    props: React.ImgHTMLAttributes<HTMLImageElement>
  ) {
    return React.createElement("img", props);
  };
});

// Mock chess.js for testing
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Ensure Jest exits cleanly
afterAll(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});
