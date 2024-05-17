// main idea
// array of sessions with available GM for each session
// order by nb of available gms
// iterate to prune the obvious choices (only one GM available)
// assign room to gms
// remove assigned rooms from gms available rooms
// iterate with choices, handle session in order of available GM
// for each iteration evaluate rules violations (just sum 1 for each rule violation target is to minimize value)
// abandon branch if session has no GM

function solve(sessions, gamemasters, rooms) {
    var root_node = init_sessions_tree(sessions, gamemasters);

    var result = {
        solution: null,
        success: false,
    };

    return result;
}

function init_sessions_tree(sessions, gamemasters) {
    // build the array of session ids
    var mapped_sessions = sessions.map((session) => {
        return { id: session.room.id, gamemasters: [] };
    });

    // add available gamemasters for each session id
    mapped_sessions.forEach((session) => {
        session.gamemasters = trained_gamemasters_by_room(
            session.id,
            gamemasters
        ).map((gm) => gm.id);
    });

    let sorted_sessions = mapped_sessions.sort((sa, sb) => {
        return sa.gamemasters.length - sb.gamemasters.length;
    }); // order by number of available gamemasters

    var sessions_to_assign = structuredClone(sorted_sessions); // deep copy of the array

    // root node
    return {
        node_id: 0,
        sessions_to_assign: sessions_to_assign,
        assigned_sessions: [],
        score: evaluate_sessions_violations(sessions_to_assign),
        processed: false,
        isSolution: false,
    };
}

function trained_gamemasters_by_room(roomId, gamemasters) {
    return gamemasters
        .filter((gm) => gm.trained_rooms.includes(roomId))
        .sort(
            (gma, gmb) => gma.trained_rooms.length - gmb.trained_rooms.length
        );
}

function prune_level_1(node) {
    let new_node = structuredClone(node);
    var lonely_sessions = new_node.sessions_to_assign.filter(
        (session) => session.gamemasters.length === 1
    );

    new_node.assigned_sessions.push(structuredClone(lonely_sessions));
    // TODO check sessions unicity in assigned_sessions

    lonely_sessions.forEach((session) => {
        // search lonely sessions to remove them
        let session_index = new_node.sessions_to_assign.indexOf(session);

        if (session_index > -1) {
            new_node.sessions_to_assign.splice(session_index, 1);
            if (new_node.sessions_to_assign.length < 1) {
                new_node.isSolution = true;
                return new_node; // no session left to assign
            }
        }

        // search if session to assign has trained gamemaster
        new_node.sessions_to_assign.forEach((s) => {
            let index = s.gamemasters.indexOf(session.gamemasters[0]);
            if (index > -1) {
                s.gamemasters.splice(index, 1);
                if (s.gamemasters.length < 1) {
                    throw new Error(`Session with no gamemaster ${s.id}`);
                }
            }
        });
    });

    let assigned_session_score = evaluate_sessions_violations(
        new_node.assigned_sessions
    );
    if (assigned_session_score > 0) {
        console.log(new_node.assigned_sessions.flatMap((s) => s.gamemasters));
        throw new Error("Assigned session with violations");
    }

    new_node.score = evaluate_node_violations(new_node);
    if (node.score <= new_node.score) {
        throw new Error("Inconclusive pruning");
    }

    return new_node;
}

// define a score for the level of constraints violation with a given data set
function evaluate_sessions_violations(sessions) {
    var gamemasters = sessions.flatMap((s) => s.gamemasters);

    var aggregate_and_count = gamemasters.reduce((aggregate, current_id) => {
        if (!aggregate.hasOwnProperty(current_id)) {
            aggregate[current_id] = 0;
        } else {
            aggregate[current_id]++;
        }

        return aggregate;
    }, {});

    var score = Object.keys(aggregate_and_count).reduce((sum, key) => {
        return sum + aggregate_and_count[key];
    }, 0);

    return score;
}

function evaluate_node_violations(node) {
    let sessions = [...node.assigned_sessions, ...node.sessions_to_assign];
    return evaluate_sessions_violations(sessions);
}

export default {
    solve,
    init_sessions_tree,
    trained_gamemasters_by_room,
    evaluate_sessions_violations,
    evaluate_node_violations,
    prune_level_1,
};
