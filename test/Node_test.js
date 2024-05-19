import assert from "node:assert";
import { describe, it, beforeEach, mock } from "node:test";

import Node from "../node.js";

describe("[Node]", () => {
    describe("with Sessions_to_assign without Assigned_sessions", () => {
        let Sessions_to_assign;
        let Assigned_sessions;

        beforeEach(() => {
            Sessions_to_assign = [
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
            Assigned_sessions = [];
        });

        it("is correctly instantiate with a valid score", () => {
            // Act
            let node = new Node(
                Sessions_to_assign,
                Assigned_sessions
            );

            // Assert
            assert.equal(node.Score, 3);
            assert.equal(node.Sessions_to_assign, Sessions_to_assign);
            assert.equal(node.Assigned_sessions, Assigned_sessions);
        });

        it("has a complexity level for sessions to assign", () => {
            // Act
            let node = new Node(
                Sessions_to_assign,
                Assigned_sessions
            );

            let complexity = node.sessions_to_assign_complexity();

            // Assert
            assert.equal(complexity, 1);
        });
    });

    describe("with Sessions_to_assign and Assigned_sessions", () => {
        let Sessions_to_assign;
        let Assigned_sessions;

        beforeEach(() => {
            Sessions_to_assign = [
                { id: 3, gamemasters: [7, 3] },
                { id: 6, gamemasters: [8, 3] },
                { id: 7, gamemasters: [9] },
                { id: 8, gamemasters: [6] },
                { id: 9, gamemasters: [2] },
            ];
            Assigned_sessions = [
                { id: 0, gamemasters: [2] },
                { id: 1, gamemasters: [6] },
                { id: 2, gamemasters: [4] },
                { id: 4, gamemasters: [5] },
                { id: 5, gamemasters: [6] },
            ];
        });

        it("is correctly instantiate with a valid score", () => {
            // Act
            let node = new Node(
                Sessions_to_assign,
                Assigned_sessions
            );

            // Assert
            assert.equal(node.Score, 4);
            assert.equal(node.Sessions_to_assign, Sessions_to_assign);
            assert.equal(node.Assigned_sessions, Assigned_sessions);
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
                    let score = Node.evaluate_sessions_violations(sessions);

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
                    let score = Node.evaluate_sessions_violations(sessions);

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
                    let score = Node.evaluate_sessions_violations(sessions);

                    // Assert
                    assert.equal(score, 3);
                });
            });
        });

        describe("[evaluate_node_violations]", () => {
            describe("a node with no Assigned_sessions", () => {
                let node;

                beforeEach(() => {
                    node = new Node(
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
                    let score = Node.evaluate_node_violations(node);

                    // Assert
                    assert.equal(score, 3);
                });
            });

            describe("a node with Assigned_sessions", () => {
                let node;

                beforeEach(() => {
                    node = new Node(
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
                    let score = Node.evaluate_node_violations(node);

                    // Assert
                    assert.equal(score, 4);
                });
            });
        });
    });
});
