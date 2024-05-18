export default class NodeData {
    Node_id;
    Sessions_to_assign = [];
    Assigned_sessions = [];
    isSolution = false;
    Score;

    constructor(node_id, sessions_to_assign, assigned_sessions) {
        this.Node_id = node_id;
        this.sessions_to_assign = sessions_to_assign;
        this.assigned_sessions = assigned_sessions;

        this.Score = NodeData.evaluate_node_violations(this);
    }

    sessions_to_assign_complexity() {
        var min_complexity = Math.min(
            this.Sessions_to_assign.map((s) => s.gamemasters.length)
        );
    }

    // define a score for the level of constraints violation with a given data set
    static evaluate_sessions_violations(sessions) {
        var gamemasters = sessions.flatMap((s) => s.gamemasters);

        var aggregate_and_count = gamemasters.reduce(
            (aggregate, current_id) => {
                if (!aggregate.hasOwnProperty(current_id)) {
                    aggregate[current_id] = 0;
                } else {
                    aggregate[current_id]++;
                }

                return aggregate;
            },
            {}
        );

        var score = Object.keys(aggregate_and_count).reduce((sum, key) => {
            return sum + aggregate_and_count[key];
        }, 0);

        return score;
    }

    static evaluate_node_violations(node) {
        let sessions = [...node.assigned_sessions, ...node.sessions_to_assign];
        return NodeData.evaluate_sessions_violations(sessions);
    }
}
