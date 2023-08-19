"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalkController = void 0;
const prioritizedTaskExecutor_1 = require("../prioritizedTaskExecutor");
const trieNode_1 = require("../trieNode");
/**
 * WalkController is an interface to control how the trie is being traversed.
 */
class WalkController {
    /**
     * Creates a new WalkController
     * @param onNode - The `FoundNodeFunction` to call if a node is found.
     * @param trie - The `Trie` to walk on.
     * @param poolSize - The size of the task queue.
     */
    constructor(onNode, trie, poolSize) {
        this.onNode = onNode;
        this.taskExecutor = new prioritizedTaskExecutor_1.PrioritizedTaskExecutor(poolSize);
        this.trie = trie;
        this.resolve = () => { };
        this.reject = () => { };
    }
    /**
     * Async function to create and start a new walk over a trie.
     * @param onNode - The `FoundNodeFunction to call if a node is found.
     * @param trie - The trie to walk on.
     * @param root - The root key to walk on.
     * @param poolSize - Task execution pool size to prevent OOM errors. Defaults to 500.
     */
    static async newWalk(onNode, trie, root, poolSize) {
        const strategy = new WalkController(onNode, trie, poolSize !== null && poolSize !== void 0 ? poolSize : 500);
        await strategy.startWalk(root);
    }
    async startWalk(root) {
        // eslint-disable-next-line no-async-promise-executor
        return await new Promise(async (resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            let node;
            try {
                node = await this.trie._lookupNode(root);
            }
            catch (error) {
                return this.reject(error);
            }
            this.processNode(root, node, []);
        });
    }
    /**
     * Run all children of a node. Priority of these nodes are the key length of the children.
     * @param node - Node to get all children of and call onNode on.
     * @param key - The current `key` which would yield the `node` when trying to get this node with a `get` operation.
     */
    allChildren(node, key = []) {
        if (node instanceof trieNode_1.LeafNode) {
            return;
        }
        let children;
        if (node instanceof trieNode_1.ExtensionNode) {
            children = [[node.key, node.value]];
        }
        else if (node instanceof trieNode_1.BranchNode) {
            children = node.getChildren().map((b) => [[b[0]], b[1]]);
        }
        if (!children) {
            return;
        }
        for (const child of children) {
            const keyExtension = child[0];
            const childRef = child[1];
            const childKey = key.concat(keyExtension);
            const priority = childKey.length;
            this.pushNodeToQueue(childRef, childKey, priority);
        }
    }
    /**
     * Push a node to the queue. If the queue has places left for tasks, the node is executed immediately, otherwise it is queued.
     * @param nodeRef - Push a node reference to the event queue. This reference is a 32-byte keccak hash of the value corresponding to the `key`.
     * @param key - The current key.
     * @param priority - Optional priority, defaults to key length
     */
    pushNodeToQueue(nodeRef, key = [], priority) {
        this.taskExecutor.executeOrQueue(priority !== null && priority !== void 0 ? priority : key.length, async (taskFinishedCallback) => {
            let childNode;
            try {
                childNode = await this.trie._lookupNode(nodeRef);
            }
            catch (error) {
                return this.reject(error);
            }
            taskFinishedCallback(); // this marks the current task as finished. If there are any tasks left in the queue, this will immediately execute the first task.
            this.processNode(nodeRef, childNode, key);
        });
    }
    /**
     * Push a branch of a certain BranchNode to the event queue.
     * @param node - The node to select a branch on. Should be a BranchNode.
     * @param key - The current key which leads to the corresponding node.
     * @param childIndex - The child index to add to the event queue.
     * @param priority - Optional priority of the event, defaults to the total key length.
     */
    onlyBranchIndex(node, key = [], childIndex, priority) {
        if (!(node instanceof trieNode_1.BranchNode)) {
            throw new Error('Expected branch node');
        }
        const childRef = node.getBranch(childIndex);
        if (!childRef) {
            throw new Error('Could not get branch of childIndex');
        }
        const childKey = key.slice(); // This copies the key to a new array.
        childKey.push(childIndex);
        const prio = priority !== null && priority !== void 0 ? priority : childKey.length;
        this.pushNodeToQueue(childRef, childKey, prio);
    }
    processNode(nodeRef, node, key = []) {
        this.onNode(nodeRef, node, key, this);
        if (this.taskExecutor.finished()) {
            // onNode should schedule new tasks. If no tasks was added and the queue is empty, then we have finished our walk.
            this.resolve();
        }
    }
}
exports.WalkController = WalkController;
//# sourceMappingURL=walkController.js.map