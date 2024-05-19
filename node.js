export default class Node {
    Sessions_to_assign = [];
    Assigned_sessions = [];
    isSolution = false;
    Score;

    constructor(Sessions_to_assign, Assigned_sessions) {
        this.Sessions_to_assign = Sessions_to_assign;
        this.Assigned_sessions = Assigned_sessions;

        this.Score = Node.evaluate_node_violations(this);
    }

    sessions_to_assign_complexity() {
        let mapped_lengths = this.Sessions_to_assign.map(
            (s) => s.gamemasters.length
        );
        if (mapped_lengths.length === 0) {
            return 0;
        }

        let min_complexity = Math.min(...mapped_lengths);
        return min_complexity;
    }

    // define a score for the level of constraints violation with a given data set
    static evaluate_sessions_violations(sessions) {
        let gamemasters = sessions.flatMap((s) => s.gamemasters);

        let aggregate_and_count = gamemasters.reduce(
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

        let score = Object.keys(aggregate_and_count).reduce((sum, key) => {
            return sum + aggregate_and_count[key];
        }, 0);

        return score;
    }

    static evaluate_node_violations(node) {
        let sessions = [...node.Assigned_sessions, ...node.Sessions_to_assign];
        return Node.evaluate_sessions_violations(sessions);
    }
}
