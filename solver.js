import Node from "./node.js";

// main idea :
//   array of sessions with available GM for each session
//   order by nb of available gms
//   iterate to prune the obvious choices (only one GM available)
//   assign room to gms
//   remove assigned rooms from gms available rooms
//   iterate with children having more than one GM, create branches for each case
//   for each iteration evaluate rules violations (just sum 1 for each rule violation, target is to minimize value)
//   abandon branch if session has no GM

export default class Solver {
    constructor(sessions, gamemasters, rooms) {
        this.sessions = sessions;
        this.gamemasters = gamemasters;
        this.rooms = rooms;
    }

    solve() {
        let all_trained_rooms = this.gamemasters
            .flatMap((gm) => gm.trained_rooms)
            .sort();
        let all_session_rooms = this.sessions.map((s) => s.room.id).sort();

        let room_not_trained = all_session_rooms.filter(
            (room_id) => !all_trained_rooms.includes(room_id)
        );

        if (room_not_trained.length > 0) {
            return {
                solution: null,
                success: false,
                reason: `Rooms will never be staffed [${room_not_trained.join()}]`,
            };
        }

        let root = Solver.init_sessions_tree(this.sessions, this.gamemasters);
        let result = Solver.process_node(root);
        let solution = null;
        if (result !== null) {
            solution = result.Assigned_sessions.map((session) => {
                let room = this.rooms.filter((r) => r.id === session.id)[0];
                let gamemaster = this.gamemasters.filter(
                    (g) => g.id === session.gamemasters[0]
                )[0];
                return {
                    room_id: room.id,
                    room_name: room.name,
                    gamemaster_id: gamemaster.id,
                    gamemaster_name: gamemaster.name,
                };
            });
        }
        return {
            solution: solution,
            success: solution !== null,
            reason: null,
        };
    }

    static process_node(node) {
        let node_complexity = node.sessions_to_assign_complexity();
        let children = [];

        if (node_complexity == 1) {
            let pruned = Solver.prune_level_1(node);
            if (pruned !== null) {
                children.push(pruned);
            }
        } else if (node_complexity > 1) {
            let pruned = Solver.prune_level_n(node, node_complexity);
            children.push(...pruned.filter((c) => c !== null));
        } else if (node_complexity < 1) {
            // sessions with 0 trained GMs
        }

        for (let index = 0; index < children.length; index++) {
            const next_node = children[index];

            if (Solver.is_solution(next_node)) {
                return next_node;
            }

            let next_node_solution = Solver.process_node(next_node);
            if (Solver.is_solution(next_node_solution)) {
                return next_node_solution;
            }
        }

        return null;
    }

    static is_solution(node) {
        return node !== null && typeof node !== "undefined" && node.isSolution;
    }

    static init_sessions_tree(sessions, gamemasters) {
        // build the array of session ids
        let mapped_sessions = sessions.map((session) => {
            return { id: session.room.id, gamemasters: [] };
        });

        // add available gamemasters for each session id
        mapped_sessions.forEach((session) => {
            session.gamemasters = Solver.trained_gamemasters_by_room(
                session.id,
                gamemasters
            ).map((gm) => gm.id);
        });

        let sorted_sessions = mapped_sessions.sort((sa, sb) => {
            return sa.gamemasters.length - sb.gamemasters.length;
        }); // order by number of available gamemasters

        let Sessions_to_assign = structuredClone(sorted_sessions); // deep copy of the array

        // root node
        return new Node(Sessions_to_assign, []);
    }

    static trained_gamemasters_by_room(roomId, gamemasters) {
        return gamemasters
            .filter((gm) => gm.trained_rooms.includes(roomId))
            .sort(
                (gma, gmb) =>
                    gma.trained_rooms.length - gmb.trained_rooms.length
            );
    }

    static prune_level_1(node) {
        let Sessions_to_assign = structuredClone(node.Sessions_to_assign);
        let Assigned_sessions = structuredClone(node.Assigned_sessions);

        let staged_sessions = Sessions_to_assign.filter(
            (session) => session.gamemasters.length === 1
        );

        Assigned_sessions.push(...structuredClone(staged_sessions));
        // Maybe check sessions unicity in Assigned_sessions

        try {
            staged_sessions.forEach((session) => {
                // search sessions with only one trained GM to assign them
                let session_index = Sessions_to_assign.indexOf(session);

                if (session_index > -1) {
                    Sessions_to_assign.splice(session_index, 1);
                }

                // search if session to assign has trained gamemaster
                Sessions_to_assign.forEach((s) => {
                    let index = s.gamemasters.indexOf(session.gamemasters[0]);
                    if (index > -1) {
                        s.gamemasters.splice(index, 1);
                        if (s.gamemasters.length < 1) {
                            throw new UnassignedSessionError(s.id);
                        }
                    }
                });
            });
        } catch (e) {
            console.log("--   " + e.message);
            return null;
        }
        // reject solutions with violations in assigned sessions
        let assigned_session_score =
            Node.evaluate_sessions_violations(Assigned_sessions);
        if (assigned_session_score > 0) {
            return null; // AssignementViolation
        }

        // reject solutions where score not decreasing while still having sessions to assign
        let new_node = new Node(Sessions_to_assign, Assigned_sessions);
        if (
            node.Score <= new_node.Score &&
            new_node.Sessions_to_assign.length > 0
        ) {
            return null; // Inconclusive
        }

        if (new_node.Sessions_to_assign.length === 0 && new_node.Score === 0) {
            new_node.isSolution = true;
        }
        return new_node;
    }

    static prune_level_n(node, node_complexity) {
        let reference_Sessions_to_assign = structuredClone(
            node.Sessions_to_assign
        );
        let reference_Assigned_sessions = structuredClone(
            node.Assigned_sessions
        );

        // check for complexity level
        let lower_complexity_sessions = reference_Sessions_to_assign.filter(
            (session) => session.gamemasters.length < node_complexity
        );
        if (lower_complexity_sessions.length > 0) {
            return null; // Inconclusive
        }

        let staged_sessions = reference_Sessions_to_assign.filter(
            (session) => session.gamemasters.length === node_complexity
        );

        let children = [];
        staged_sessions.forEach((staged_session) => {
            staged_session.gamemasters.forEach((candidate_gm) => {
                let candidate_session = structuredClone(staged_session);
                let candidate_Sessions_to_assign = structuredClone(
                    reference_Sessions_to_assign
                );
                let candidate_Assigned_sessions = structuredClone(
                    reference_Assigned_sessions
                );

                candidate_session.gamemasters = [candidate_gm];
                candidate_Assigned_sessions.push(candidate_session);

                // search lonely sessions to remove them
                let candidate_session_index =
                    candidate_Sessions_to_assign.indexOf(staged_session);

                if (candidate_session_index > -1) {
                    candidate_Sessions_to_assign.splice(
                        candidate_session_index,
                        1
                    );
                }

                // search if session to assign has trained gamemaster
                candidate_Sessions_to_assign.forEach((s) => {
                    let index = s.gamemasters.indexOf(candidate_gm);
                    if (index > -1) {
                        s.gamemasters.splice(index, 1);
                        if (s.gamemasters.length < 1) {
                            return; // UnassignedSession
                        }
                    }
                });

                // reject solutions with violations in assigned sessions
                let assigned_session_score = Node.evaluate_sessions_violations(
                    candidate_Assigned_sessions
                );
                if (assigned_session_score > 0) {
                    return; // Assignement Violation, other sessions can provide a solution
                }

                // reject solutions where score not decreasing while still having sessions to assign
                let new_node = new Node(
                    candidate_Sessions_to_assign,
                    candidate_Assigned_sessions
                );
                if (
                    node.Score <= new_node.Score &&
                    new_node.Sessions_to_assign.length > 0
                ) {
                    return; // Inconclusive, other sessions can provide a solution
                }

                if (
                    new_node.Sessions_to_assign.length === 0 &&
                    new_node.Score === 0
                ) {
                    new_node.isSolution = true;
                }
                children.push(new_node);
            });
        });

        if (children.length > 0) {
            return children;
        }
        return null;
    }
}

// Error types
class UnassignedSessionError extends Error {
    constructor(session_id) {
        super(`Room with no gamemaster ${session_id} during solving`);
        this.name = "UnassignedSessionError";
    }
}
