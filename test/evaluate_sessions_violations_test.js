import assert from "node:assert";
import { describe, it, beforeEach, mock } from "node:test";

import solver from "../solver.js";

describe("[evaluate_sessions_violations] a node with no sessions", () => {
    let sessions;

    beforeEach(() => {
        sessions = [];
    });

    it("has a valid score", () => {
        // Act
        var score = solver.evaluate_sessions_violations(sessions);

        // Assert
        assert.equal(score, 0);
    });
});

describe("[evaluate_sessions_violations] a node with sessions but no gamemaster", () => {
    let sessions;

    beforeEach(() => {
        sessions = [
            { id: 0, gamemasters: [] },
            { id: 1, gamemasters: [] },
        ];
    });

    it("has a valid score", () => {
        // Act
        var score = solver.evaluate_sessions_violations(sessions);

        // Assert
        assert.equal(score, 0);
    });
});

describe("[evaluate_sessions_violations] a valid node", () => {
    let sessions;

    beforeEach(() => {
        sessions = [
            { id: 0, gamemasters: [2] },
            { id: 1, gamemasters: [1] },
            { id: 2, gamemasters: [4] },
            { id: 3, gamemasters: [7, 3] },
            { id: 4, gamemasters: [5] },
            { id: 5, gamemasters: [6] },
            { id: 6, gamemasters: [8, 3] },
            { id: 7, gamemasters: [9] },
            { id: 8, gamemasters: [6] },
            { id: 9, gamemasters: [2] },
        ];
    });

    it("has a valid score", () => {
        // Act
        var score = solver.evaluate_sessions_violations(sessions);

        // Assert
        assert.equal(score, 3);
    });
});
