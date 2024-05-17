import assert from "node:assert";
import { describe, it, beforeEach, mock } from "node:test";

import solver from "../solver.js";

describe("[solve] an inconclusive data set", () => {
    let gms;
    let rooms;
    let sessions;

    beforeEach(() => {
        rooms = [{ id: 1, name: "Room1" }];
        gms = [{ id: 1, name: "GM1", trained_rooms: [0] }];
        sessions = [{ room: rooms[0] }];
    });

    it("fails to resolve", () => {
        // Act
        var result = solver.solve(sessions, gms, rooms);

        // Assert
        assert.equal(result.success, false);
        assert.strictEqual(result.solution, null);
    });
});

describe("[solve] a valid data set", () => {
    let gms;
    let rooms;
    let sessions;

    beforeEach(() => {
        rooms = [{ id: 1, name: "Room1" }];
        gms = [{ id: 1, name: "GM1", trained_rooms: [1] }];
        sessions = [{ room: rooms[0] }];
    });

    it("is resolved with a solution", () => {
        // Act
        var result = solver.solve(sessions, gms, rooms);

        // Assert
        assert.equal(result.success, true);
        assert.notStrictEqual(result.solution, null);
    });
});
