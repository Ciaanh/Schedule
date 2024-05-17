import assert from "node:assert";
import { describe, it, beforeEach, mock } from "node:test";

import solver from "../solver.js";

describe("[trained_gamemasters_by_room] a valid array of gamemasters", () => {
    let gms;

    beforeEach(() => {
        gms = [
            { id: 2, name: "GM2", trained_rooms: [4, 10] },
            { id: 3, name: "GM3", trained_rooms: [10, 4, 6] },
            { id: 1, name: "GM1", trained_rooms: [4] },
        ];
    });

    it("is filtered by roomId", () => {
        // Act
        var result = solver.trained_gamemasters_by_room(6, gms);

        // Assert
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].name, "GM3");
    });

    it("is sorted by trained_rooms asc", () => {
        // Act
        var result = solver.trained_gamemasters_by_room(4, gms);

        // Assert
        assert.strictEqual(result.length, 3);
        assert.strictEqual(result[0].name, "GM1");
        assert.strictEqual(result[1].name, "GM2");
        assert.strictEqual(result[2].name, "GM3");
    });
});
