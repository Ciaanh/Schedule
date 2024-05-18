import NodeData from "./tree/NodeData.js";

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
        var root_node_data = Solver.init_sessions_tree(this.sessions, this.gamemasters);

        let children = process_node(root_node_data);

        // we build/explore the tree of possible solutions
        while (explore_tree) {
            try {
                let new_node = Solver.prune_level_1(root_node_data);
            } catch (e) {
                if (e instanceof UnassignedSessionError) {
                }
                if (e instanceof InconclusiveError) {
                }
                if (e instanceof AssignementViolationError) {
                }
            }
        }

        var result = {
            solution: null,
            success: false,
        };

        return result;
    }

    static init_sessions_tree(sessions, gamemasters) {
        // build the array of session ids
        var mapped_sessions = sessions.map((session) => {
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

        var sessions_to_assign = structuredClone(sorted_sessions); // deep copy of the array

        // root node
        return new NodeData(0, sessions_to_assign, []);
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
        let new_node = structuredClone(node);
        var lonely_sessions = new_node.sessions_to_assign.filter(
            (session) => session.gamemasters.length === 1
        );

        new_node.assigned_sessions.push(...structuredClone(lonely_sessions));
        // TODO check sessions unicity in assigned_sessions

        lonely_sessions.forEach((session) => {
            // search lonely sessions to remove them
            let session_index = new_node.sessions_to_assign.indexOf(session);

            if (session_index > -1) {
                new_node.sessions_to_assign.splice(session_index, 1);
            }

            // search if session to assign has trained gamemaster
            new_node.sessions_to_assign.forEach((s) => {
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
        let assigned_session_score = NodeData.evaluate_sessions_violations(
            new_node.assigned_sessions
        );
        if (assigned_session_score > 0) {
            throw new AssignementViolationError();
        }

        // reject solutions where score not decreasing while still having sessions to assign
        new_node.score = NodeData.evaluate_node_violations(new_node);
        if (
            node.score <= new_node.score &&
            new_node.sessions_to_assign.length > 0
        ) {
            throw new InconclusiveError();
        }

        if (new_node.sessions_to_assign.length === 0 && new_node.score === 0) {
            new_node.isSolution = true;
        }
        return new_node;
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
