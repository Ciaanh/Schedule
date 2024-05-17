import assert from "node:assert";
import { describe, it, beforeEach, mock } from "node:test";

import solver from "../solver.js";

describe("[prune_level_1] a node", () => {
    let node;

    beforeEach(() => {
        let root_data = [
            { id: 0, gamemasters: [2, 3] },
            { id: 1, gamemasters: [1] },
            { id: 2, gamemasters: [4] },
            { id: 3, gamemasters: [4, 3] },
        ];
        node = {
            node_id: 0,
            sessions_to_assign: root_data,
            assigned_sessions: [],
            score: solver.evaluate_sessions_violations(root_data),
            processed: false,
            isSolution: false,
        };
    });

    it("is correctly cleansed from sessions with only one gamemaster", () => {
        // Act
        var result = solver.prune_level_1(node);

        // Assert
        var filtered_sessions = result.sessions.filter(
            (session) => session.gamemasters.length === 1
        );

        assert.equal(filtered_sessions.length, 1);
        assert.equal(filtered_sessions[0].id, 3);
    });

    it("is node modified and a new node is returned", () => {
        // Act
        var result = solver.prune_level_1(node);

        // Assert
        assert.equal(0, true);
    });

    it("is flagged as solution if there is no session left to assign", () => {
        // Act
        var node_iteration_1 = solver.prune_level_1(node);
        var node_iteration_2 = solver.prune_level_1(node_iteration_1);
        var node_iteration_3 = solver.prune_level_1(node_iteration_2);

        // Assert
        assert.strictEqual(node_iteration_3.sessions_to_assign.length, 0);
        assert.strictEqual(node_iteration_3.isSolution, true);
    });
});
