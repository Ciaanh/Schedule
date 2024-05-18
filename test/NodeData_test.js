import assert from "node:assert";
import { describe, it, beforeEach, mock } from "node:test";

import NodeData from "../tree/NodeData.js";

describe("[NodeData]", () => {
    describe("with sessions_to_assign without assigned_sessions", () => {
        let node_id;
        let sessions_to_assign;
        let assigned_sessions;

        beforeEach(() => {
            node_id = 0;
            sessions_to_assign = [
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
            assigned_sessions = [];
        });

        it("is correctly instantiate with a valid score", () => {
            // Act
            let node = new NodeData(
                node_id,
                sessions_to_assign,
                assigned_sessions
            );

            // Assert
            assert.equal(node.Score, 3);
            assert.equal(node.Node_id, node_id);
            assert.equal(node.Sessions_to_assign, sessions_to_assign);
            assert.equal(node.Assigned_sessions, assigned_sessions);
        });

        it("has a complexity level", () => {
            // Act
            let node = new NodeData(
                node_id,
                sessions_to_assign,
                assigned_sessions
            );

            let complexity = node.sessions_to_assign_complexity();

            // Assert
            assert.equal(complexity, 1);
        });
    });

    describe("with sessions_to_assign and assigned_sessions", () => {
        let node_id;
        let sessions_to_assign;
        let assigned_sessions;

        beforeEach(() => {
            node_id = 0;
            sessions_to_assign = [
                { id: 3, gamemasters: [7, 3] },
                { id: 6, gamemasters: [8, 3] },
                { id: 7, gamemasters: [9] },
                { id: 8, gamemasters: [6] },
                { id: 9, gamemasters: [2] },
            ];
            assigned_sessions = [
                { id: 0, gamemasters: [2] },
                { id: 1, gamemasters: [6] },
                { id: 2, gamemasters: [4] },
                { id: 4, gamemasters: [5] },
                { id: 5, gamemasters: [6] },
            ];
        });

        it("is correctly instantiate with a valid score", () => {
            // Act
            let node = new NodeData(
                node_id,
                sessions_to_assign,
                assigned_sessions
            );

            // Assert
            assert.equal(node.Score, 4);
            assert.equal(node.Node_id, node_id);
            assert.equal(node.Sessions_to_assign, sessions_to_assign);
            assert.equal(node.Assigned_sessions, assigned_sessions);
        });
    });

    describe("Static methods", () => {
        describe("[evaluate_sessions_violations]", () => {
            describe("an empty session array", () => {
                let sessions;

                beforeEach(() => {
                    sessions = [];
                });

                it("has a valid score", () => {
                    // Act
                    var score = NodeData.evaluate_sessions_violations(sessions);

                    // Assert
                    assert.equal(score, 0);
                });
            });

            describe("a session array but no gamemaster", () => {
                let sessions;

                beforeEach(() => {
                    sessions = [
                        { id: 0, gamemasters: [] },
                        { id: 1, gamemasters: [] },
                    ];
                });

                it("has a valid score", () => {
                    // Act
                    var score = NodeData.evaluate_sessions_violations(sessions);

                    // Assert
                    assert.equal(score, 0);
                });
            });

            describe("a valid session array", () => {
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
                    var score = NodeData.evaluate_sessions_violations(sessions);

                    // Assert
                    assert.equal(score, 3);
                });
            });
        });

        describe("[evaluate_node_violations]", () => {
            describe("a node with no assigned_sessions", () => {
                let node;

                beforeEach(() => {
                    node = new NodeData(
                        0,
                        [
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
                        ],
                        []
                    );
                });

                it("has a valid score", () => {
                    // Act
                    var score = NodeData.evaluate_node_violations(node);

                    // Assert
                    assert.equal(score, 3);
                });
            });

            describe("a node with assigned_sessions", () => {
                let node;

                beforeEach(() => {
                    node = new NodeData(
                        0,
                        [
                            { id: 3, gamemasters: [7, 3] },

                            { id: 6, gamemasters: [8, 3] },
                            { id: 7, gamemasters: [9] },
                            { id: 8, gamemasters: [6] },
                            { id: 9, gamemasters: [2] },
                        ],
                        [
                            { id: 0, gamemasters: [2] },
                            { id: 1, gamemasters: [6] },
                            { id: 2, gamemasters: [4] },
                            { id: 4, gamemasters: [5] },
                            { id: 5, gamemasters: [6] },
                        ]
                    );
                });

                it("has a valid score", () => {
                    // Act
                    var score = NodeData.evaluate_node_violations(node);

                    // Assert
                    assert.equal(score, 4);
                });
            });
        });
    });
});
