import assert from "node:assert";
import { describe, it, beforeEach, mock } from "node:test";

import Solver from "../solver.js";
import NodeData from "../tree/NodeData.js";

describe("[Solver]", () => {
    describe("an inconclusive data set", () => {
        let solver;
        let gms;
        let rooms;
        let sessions;

        beforeEach(() => {
            rooms = [{ id: 1, name: "Room1" }];
            gms = [{ id: 1, name: "GM1", trained_rooms: [0] }];
            sessions = [{ room: rooms[0] }];

            solver = new Solver(sessions, gms, rooms);
        });

        it("fails to resolve", () => {
            // Act
            var result = solver.solve();

            // Assert
            assert.equal(result.success, false);
            assert.strictEqual(result.solution, null);
        });
    });

    describe("a valid data set", () => {
        let solver;
        let gms;
        let rooms;
        let sessions;

        beforeEach(() => {
            rooms = [{ id: 1, name: "Room1" }];
            gms = [{ id: 1, name: "GM1", trained_rooms: [1] }];
            sessions = [{ room: rooms[0] }];

            solver = new Solver(sessions, gms, rooms);
        });

        it("is resolved with a solution", () => {
            // Act
            var result = solver.solve();

            // Assert
            assert.equal(result.success, true);
            assert.notStrictEqual(result.solution, null);
        });
    });

    describe("Static methods", () => {
        describe("[init_sessions_tree]", () => {
            describe("a valid data set", () => {
                let gms;
                let sessions;

                beforeEach(() => {
                    gms = [{ id: 2, name: "GM1", trained_rooms: [3] }];
                    sessions = [{ room: { id: 3, name: "Room1" } }];
                });

                it("is correctly transformed as a root node", () => {
                    // Act
                    var root_node = Solver.init_sessions_tree(sessions, gms);

                    // Assert
                    assert.notStrictEqual(root_node.sessions_to_assign, null);
                    assert.equal(root_node.sessions_to_assign.length, 1);
                    assert.equal(root_node.sessions_to_assign[0].id, 3);
                    assert.equal(
                        root_node.sessions_to_assign[0].gamemasters.length,
                        1
                    );
                    assert.equal(
                        root_node.sessions_to_assign[0].gamemasters[0],
                        2
                    );
                    assert.notStrictEqual(root_node.score, null);

                    assert.equal(root_node.assigned_sessions.length, 0);
                });
            });
        });

        describe("[prune_level_1]", () => {
            describe("a node", () => {
                let node;

                beforeEach(() => {
                    let root_data = [
                        { id: 0, gamemasters: [2, 3] },
                        { id: 1, gamemasters: [1] },
                        { id: 2, gamemasters: [4] },
                        { id: 3, gamemasters: [4, 3] },
                    ];
                    node = new NodeData(0, root_data, []);
                });

                it("is correctly cleansed from sessions with only one gamemaster", () => {
                    // Act
                    var result = Solver.prune_level_1(node);

                    // Assert
                    var filtered_sessions = result.sessions_to_assign.filter(
                        (session) => session.gamemasters.length === 1
                    );

                    assert.equal(filtered_sessions.length, 1);
                    assert.equal(filtered_sessions[0].id, 3);
                });

                it("is not modified and a new node is returned", () => {
                    // Act
                    var result = Solver.prune_level_1(node);

                    // Assert
                    assert.notEqual(node.score, result.score);
                    assert.notEqual(
                        node.assigned_sessions,
                        result.assigned_sessions
                    );
                    assert.notEqual(
                        node.sessions_to_assign,
                        result.sessions_to_assign
                    );
                });

                it("is flagged as solution if there is no session left to assign", () => {
                    // Act
                    var node_iteration_1 = Solver.prune_level_1(node);
                    var node_iteration_2 =
                        Solver.prune_level_1(node_iteration_1);
                    var node_iteration_3 =
                        Solver.prune_level_1(node_iteration_2);

                    // Assert
                    assert.strictEqual(
                        node_iteration_3.sessions_to_assign.length,
                        0
                    );
                    assert.strictEqual(node_iteration_3.isSolution, true);
                });
            });
        });

        describe("[trained_gamemasters_by_room]", () => {
            describe("a valid array of gamemasters", () => {
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
                    var result = Solver.trained_gamemasters_by_room(6, gms);

                    // Assert
                    assert.strictEqual(result.length, 1);
                    assert.strictEqual(result[0].name, "GM3");
                });

                it("is sorted by trained_rooms asc", () => {
                    // Act
                    var result = Solver.trained_gamemasters_by_room(4, gms);

                    // Assert
                    assert.strictEqual(result.length, 3);
                    assert.strictEqual(result[0].name, "GM1");
                    assert.strictEqual(result[1].name, "GM2");
                    assert.strictEqual(result[2].name, "GM3");
                });
            });
        });
    });
});
