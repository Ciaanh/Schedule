import assert from "node:assert";
import test from "node:test";

import solver from "./solver.js";

test("that trained_gamemasters_by_room filters by roomId", () => {
    // Arrange
    const roomId = 4;
    const gms = [
        { id: 1, name: "GM1", trained_rooms: [2, 3] },
        { id: 2, name: "GM2", trained_rooms: [4, 10] },
    ];

    // Act
    var result = solver.trained_gamemasters_by_room(roomId, gms);

    // Assert
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, "GM2");
});

