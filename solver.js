import Node from "./node.js";

// main idea
// array of sessions with available GM for each session
// order by nb of available gms
// iterate to prune the obvious choices (only one GM available)
// assign room to gms
// remove assigned rooms from gms available rooms
// iterate with choices, handle session in order of available GM
// for each iteration evaluate rules violations (just sum 1 for each rule violation target is to minimize value)
// abandon branch if session has no GM

export default class Solver {
    constructor(sessions, gamemasters, rooms) {
        this.sessions = sessions;
        this.gamemasters = gamemasters;
        this.rooms = rooms;
    }

    solve() {
        let root = Solver.init_sessions_tree(this.sessions, this.gamemasters);

        let solution = Solver.process_node(root);

        // we build/explore the tree of possible solutions

        let result = {
            solution: solution,
            success: solution !== null,
        };

        return result;
    }

    generatePermutation(arr) {
        let resultArr = [];
        if (arr.length === 0) return [];
        if (arr.length === 1) return [arr];

        for (let i = 0; i < arr.length; i++) {
            const currentElement = arr[i];

            const otherElements = arr.slice(0, i).concat(arr.slice(i + 1));
            const swappedPermutation = generatePermutation(otherElements);

            for (let j = 0; j < swappedPermutation.length; j++) {
                const finalSwappedPermutation = [currentElement].concat(
                    swappedPermutation[j]
                );

                resultArr.push(finalSwappedPermutation);
            }
        }

        return resultArr;
    }

    static process_node(node) {
        let node_complexity = node.sessions_to_assign_complexity();

        let children = [];
        if (node_complexity == 1) {
            try {
                let pruned = Solver.prune_level_1(node);
                children = [pruned];
            } catch (e) {
                if (e instanceof UnassignedSessionError) {
                    children = [];
                }
                if (e instanceof InconclusiveError) {
                    children = [];
                }
                if (e instanceof AssignementViolationError) {
                    children = [];
                }
            }
        } else if (node_complexity > 1) {
            // prune_level_n
            // get min complexity and prune them => may be impacted by the order
            // should provide several children ?
            try {
                let pruned = Solver.prune_level_n(node, node_complexity);
                children = [...pruned];
            } catch (e) {
                if (e instanceof UnassignedSessionError) {
                    children = [];
                }
                if (e instanceof InconclusiveError) {
                    children = [];
                }
                if (e instanceof AssignementViolationError) {
                    children = [];
                }
            }
        } else if (node_complexity < 1) {
            // session with 0 trained GMs ?
            children = [];
        }

        children.forEach((next_node) => {
            let next_node_solution = Solver.process_node(next_node);
            if (
                next_node_solution !== null &&
                typeof next_node_solution !== "undefined" &&
                next_node_solution.isSolution
            ) {
                return next_node_solution;
            }
        });

        return null;
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

        let lonely_sessions = Sessions_to_assign.filter(
            (session) => session.gamemasters.length === 1
        );

        Assigned_sessions.push(...structuredClone(lonely_sessions));
        // TODO check sessions unicity in Assigned_sessions

        lonely_sessions.forEach((session) => {
            // search lonely sessions to remove them
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

        // reject solutions with violations in assigned sessions
        let assigned_session_score =
            Node.evaluate_sessions_violations(Assigned_sessions);
        if (assigned_session_score > 0) {
            throw new AssignementViolationError();
        }

        // reject solutions where score not decreasing while still having sessions to assign
        let new_node = new Node(Sessions_to_assign, Assigned_sessions);
        if (
            node.score <= new_node.score &&
            new_node.Sessions_to_assign.length > 0
        ) {
            throw new InconclusiveError();
        }

        if (new_node.Sessions_to_assign.length === 0 && new_node.score === 0) {
            new_node.isSolution = true;
        }
        return new_node;
    }

    static prune_level_n(node, node_complexity) {
        let Sessions_to_assign = structuredClone(node.Sessions_to_assign);
        let Assigned_sessions = structuredClone(node.Assigned_sessions);

        // check for complexity level
        let lower_complexity_sessions = Sessions_to_assign.filter(
            (session) => session.gamemasters.length < node_complexity
        );
        if (lower_complexity_sessions.length > 0) {
            throw new InconclusiveError();
        }

        let staged_sessions = Sessions_to_assign.filter(
            (session) => session.gamemasters.length === node_complexity
        );

// recurcive 
// for each staged session
// take the session, for each GM prune and build node
// should generate node_complexity * staged_sessions.length nodes


        Assigned_sessions.push(...structuredClone(staged_sessions));
        // TODO check sessions unicity in Assigned_sessions

        staged_sessions.forEach((session) => {
            // search lonely sessions to remove them
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

        // reject solutions with violations in assigned sessions
        let assigned_session_score =
            Node.evaluate_sessions_violations(Assigned_sessions);
        if (assigned_session_score > 0) {
            throw new AssignementViolationError();
        }

        // reject solutions where score not decreasing while still having sessions to assign
        let new_node = new Node(Sessions_to_assign, Assigned_sessions);
        if (
            node.score <= new_node.score &&
            new_node.Sessions_to_assign.length > 0
        ) {
            throw new InconclusiveError();
        }

        if (new_node.Sessions_to_assign.length === 0 && new_node.score === 0) {
            new_node.isSolution = true;
        }
        return [new_node];
    }
}

// Error types
class UnassignedSessionError extends Error {
    constructor(session_id) {
        super(`Session with no gamemaster ${session_id}`);
        this.name = "UnassignedSessionError";
    }
}

class InconclusiveError extends Error {
    constructor() {
        super("Inconclusive pruning");
        this.name = "InconclusiveError";
    }
}

class AssignementViolationError extends Error {
    constructor() {
        super("Assigned session with violations");
        this.name = "AssignementViolationError";
    }
}
