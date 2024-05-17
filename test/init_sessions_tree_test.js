import assert from "node:assert";
import { describe, it, beforeEach, mock } from "node:test";

import solver from "../solver.js";

describe("[init_sessions_tree] a valid data set", () => {
    let gms;
    let sessions;

    beforeEach(() => {
        gms = [{ id: 2, name: "GM1", trained_rooms: [3] }];
        sessions = [{ room: { id: 3, name: "Room1" } }];
    });

    it("is correctly transformed as a root node", () => {
        // Act
        var root_node = solver.init_sessions_tree(sessions, gms);

        // Assert
        assert.notStrictEqual(root_node.sessions_to_assign, null);
        assert.equal(root_node.sessions_to_assign.length, 1, "Number of sessions");
        assert.equal(root_node.sessions_to_assign[0].id, 3, "Id of first session");
        assert.equal(
            root_node.sessions_to_assign[0].gamemasters.length,
            1,
            "Number of gm for first session"
        );
        assert.equal(root_node.sessions_to_assign[0].gamemasters[0], 2),
            "Id of first gm for first session";
        assert.notStrictEqual(root_node.score, null);

        assert.equal(root_node.assigned_sessions.length, 0, "Number of assigned sessions");
    });
});
