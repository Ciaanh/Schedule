import assert from "node:assert";
import { describe, it, beforeEach, mock } from "node:test";

import Solver from "../solver.js";
import Node from "../node.js";

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
            let result = solver.solve();

            // Assert
            assert.equal(result.success, false);
            assert.strictEqual(result.solution, null);
            assert.strictEqual(
                result.reason,
                "Rooms will never be staffed [1]"
            );
        });
    });

    describe("a simple data set", () => {
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
            let result = solver.solve();

            // Assert
            assert.equal(result.success, true);
            assert.notStrictEqual(result.solution, null);
        });
    });

    describe("a normal data set", () => {
        let solver;
        let gms;
        let rooms;
        let sessions;

        beforeEach(() => {
            sessions = [
                { room: { id: 1, name: "Le Braquage à la francaise" } },
                { room: { id: 2, name: "Le Braquage de casino" } },
                { room: { id: 3, name: "L'Enlèvement" } },
                { room: { id: 4, name: "Le Métro" } },
                { room: { id: 5, name: "Les Catacombes" } },
                { room: { id: 6, name: "Assassin's Creed" } },
                { room: { id: 7, name: "L'Avion" } },
                { room: { id: 8, name: "La Mission spatiale" } },
                { room: { id: 9, name: "Le Tremblement de terre" } },
                { room: { id: 10, name: "Le Cinéma hanté" } },
                { room: { id: 11, name: "Le Farwest" } },
                { room: { id: 12, name: "Mission secrète" } },
            ];
            gms = [
                { id: 12, name: "Isabella", trained_rooms: [7, 4, 12] },
                { id: 2, name: "Alice", trained_rooms: [4, 10] },
                { id: 6, name: "Sophia", trained_rooms: [7, 10] },
                { id: 4, name: "Emily", trained_rooms: [8, 6, 2, 7] },
                { id: 10, name: "Emma", trained_rooms: [5, 4] },
                { id: 3, name: "David", trained_rooms: [5] },
                { id: 15, name: "Benjamin", trained_rooms: [8, 4] },
                { id: 19, name: "Alexandre", trained_rooms: [9, 2, 8] },
                { id: 8, name: "Olivia", trained_rooms: [3, 9] },
                { id: 1, name: "John", trained_rooms: [2, 3] },
                { id: 16, name: "Mia", trained_rooms: [1, 3, 7, 5, 8] },
                { id: 14, name: "Ava", trained_rooms: [9] },
                { id: 11, name: "James", trained_rooms: [11] },
            ];
            rooms = [
                { id: 1, name: "Le Braquage à la francaise" },
                { id: 2, name: "Le Braquage de casino" },
                { id: 3, name: "L'Enlèvement" },
                { id: 4, name: "Le Métro" },
                { id: 5, name: "Les Catacombes" },
                { id: 6, name: "Assassin's Creed" },
                { id: 7, name: "L'Avion" },
                { id: 8, name: "La Mission spatiale" },
                { id: 9, name: "Le Tremblement de terre" },
                { id: 10, name: "Le Cinéma hanté" },
                { id: 11, name: "Le Farwest" },
                { id: 12, name: "Mission secrète" },
            ];
            solver = new Solver(sessions, gms, rooms);
        });

        it("is resolved with a solution", () => {
            // Act
            let result = solver.solve();

            // Assert
            assert.equal(result.success, true);
            assert.notStrictEqual(result.solution, null);
        });
    });

    describe("a failing data set", () => {
        let solver;
        let gms;
        let rooms;
        let sessions;

        beforeEach(() => {
            sessions = [
                { room: { id: 1, name: "Le Braquage à la francaise" } },
                { room: { id: 2, name: "Le Braquage de casino" } },
                { room: { id: 3, name: "L'Enlèvement" } },
                { room: { id: 4, name: "Le Métro" } },
                { room: { id: 5, name: "Les Catacombes" } },
                { room: { id: 6, name: "Assassin's Creed" } },
                { room: { id: 7, name: "L'Avion" } },
                { room: { id: 8, name: "La Mission spatiale" } },
                { room: { id: 9, name: "Le Tremblement de terre" } },
                { room: { id: 10, name: "Le Cinéma hanté" } },
                { room: { id: 11, name: "Le Farwest" } },
                { room: { id: 12, name: "Mission secrète" } },
            ];
            gms = [
                { id: 13, name: "William", trained_rooms: [11] },
                { id: 10, name: "Emma", trained_rooms: [5, 4] },
                { id: 15, name: "Benjamin", trained_rooms: [8, 4] },
                { id: 11, name: "James", trained_rooms: [11] },
                { id: 12, name: "Isabella", trained_rooms: [7, 4, 12] },
                { id: 7, name: "Daniel", trained_rooms: [8] },
                { id: 16, name: "Mia", trained_rooms: [1, 3, 7, 5, 8] },
                { id: 4, name: "Emily", trained_rooms: [8, 6, 2, 7] },
                { id: 18, name: "Charlotte", trained_rooms: [10] },
                { id: 8, name: "Olivia", trained_rooms: [3, 9] },
                { id: 6, name: "Sophia", trained_rooms: [7, 10] },
                { id: 1, name: "John", trained_rooms: [2, 3] },
            ];
            rooms = [
                { id: 1, name: "Le Braquage à la francaise" },
                { id: 2, name: "Le Braquage de casino" },
                { id: 3, name: "L'Enlèvement" },
                { id: 4, name: "Le Métro" },
                { id: 5, name: "Les Catacombes" },
                { id: 6, name: "Assassin's Creed" },
                { id: 7, name: "L'Avion" },
                { id: 8, name: "La Mission spatiale" },
                { id: 9, name: "Le Tremblement de terre" },
                { id: 10, name: "Le Cinéma hanté" },
                { id: 11, name: "Le Farwest" },
                { id: 12, name: "Mission secrète" },
            ];
            solver = new Solver(sessions, gms, rooms);
        });

        it("fails to resolve", () => {
            // Act
            let result = solver.solve();

            // Assert
            assert.equal(result.success, false);
            assert.strictEqual(result.solution, null);
            assert.strictEqual(result.reason, null);
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
                    let root_node = Solver.init_sessions_tree(sessions, gms);

                    // Assert
                    assert.notStrictEqual(root_node.Sessions_to_assign, null);
                    assert.equal(root_node.Sessions_to_assign.length, 1);
                    assert.equal(root_node.Sessions_to_assign[0].id, 3);
                    assert.equal(
                        root_node.Sessions_to_assign[0].gamemasters.length,
                        1
                    );
                    assert.equal(
                        root_node.Sessions_to_assign[0].gamemasters[0],
                        2
                    );
                    assert.notStrictEqual(root_node.Score, null);

                    assert.equal(root_node.Assigned_sessions.length, 0);
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
                    node = new Node(root_data, []);
                });

                it("is correctly cleansed from sessions with only one gamemaster", () => {
                    // Act
                    let result = Solver.prune_level_1(node);

                    // Assert
                    let filtered_sessions = result.Sessions_to_assign.filter(
                        (session) => session.gamemasters.length === 1
                    );

                    assert.equal(filtered_sessions.length, 1);
                    assert.equal(filtered_sessions[0].id, 3);
                });

                it("is not modified and a new node is returned", () => {
                    // Act
                    let result = Solver.prune_level_1(node);

                    // Assert
                    assert.notEqual(node.Score, result.Score);
                    assert.notEqual(
                        node.Assigned_sessions,
                        result.Assigned_sessions
                    );
                    assert.notEqual(
                        node.Sessions_to_assign,
                        result.Sessions_to_assign
                    );
                });

                it("is flagged as solution if there is no session left to assign", () => {
                    // Act
                    let node_iteration_1 = Solver.prune_level_1(node);
                    let node_iteration_2 =
                        Solver.prune_level_1(node_iteration_1);
                    let node_iteration_3 =
                        Solver.prune_level_1(node_iteration_2);

                    // Assert
                    assert.strictEqual(
                        node_iteration_3.Sessions_to_assign.length,
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
                    let result = Solver.trained_gamemasters_by_room(6, gms);

                    // Assert
                    assert.strictEqual(result.length, 1);
                    assert.strictEqual(result[0].name, "GM3");
                });

                it("is sorted by trained_rooms asc", () => {
                    // Act
                    let result = Solver.trained_gamemasters_by_room(4, gms);

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
