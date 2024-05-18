export default class TreeNode {
    Data;
    Processed = false;
    Children = [];

    constructor(node_data) {
        this.Data = node_data;
    }
}
