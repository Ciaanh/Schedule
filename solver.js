function trained_gamemasters_by_room(roomId, gamemasters) {
    return gamemasters.filter((gm) => gm.trained_rooms.includes(roomId));
}

// a node is made of a list of staffed sessions (session with GM), a list of sessions to staff, a list of unstaffed GM
// the graph is initialised with all sessions having an available GM only trained with one room
// we then iterate for each session and create a new branch for each available GM
// for each node we remove the roomId from the available trained room of the unstaffed GM
function init_sessions_tree(sessions, gamemasters) {
    var node = {
        staffed_sessions: [],
        sessions_to_staff: [],
        gms_to_staff: [],
    };
    
    var sessions_to_staff = sessions.slice();
    var available_GMs = gamemasters.map((gm) => {
        return { ...gm, remaining_trained_rooms: gm.trained_rooms };
    });

    // check if a GM has only one room trained then assign them to the room

    sessions.forEach((session) => {
        var trained_GMs = trained_gamemasters_by_room(
            session.room.id,
            available_GMs
        );

        if (trained_GMs.length === 1) {
            node.staffed_sessions.push({
                session: session,
                gm: trained_GMs[0],
            });
            // remove gm:trained_GMs[0] from available_GMs
            // edit available_GMs to remove roomId
            // check if a GM has no room left
        }
    });
}

export default { trained_gamemasters_by_room };
