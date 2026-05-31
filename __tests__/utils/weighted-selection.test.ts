import {
  getMovesProbabilities,
  selectWeightedMove,
} from "../../utils/weighted-selection";
import { OpeningNode } from "../../types/opening";

describe("weighted selection", () => {
  const children: Record<string, OpeningNode> = {
    enabled: { move: "enabled", frequency: 1, children: {} },
    disabled: { move: "disabled", frequency: 0, children: {} },
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does not treat zero frequency as the default weight", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.99);

    expect(selectWeightedMove(children)).toBe("enabled");
  });

  it("reports zero probability for zero-frequency moves", () => {
    expect(getMovesProbabilities(children)).toEqual({
      enabled: 1,
      disabled: 0,
    });
  });

  it("falls back to equal probabilities if all moves are zero weight", () => {
    const zeroWeightChildren: Record<string, OpeningNode> = {
      first: { move: "first", frequency: 0, children: {} },
      second: { move: "second", frequency: 0, children: {} },
    };

    expect(getMovesProbabilities(zeroWeightChildren)).toEqual({
      first: 0.5,
      second: 0.5,
    });
  });
});
