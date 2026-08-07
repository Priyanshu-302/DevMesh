const { createInitialState } = require('./statusSchema');
const { routeAfterQA } = require('./router');
const { architectAgent } = require('../agents/architectAgent');
const { developerAgent } = require('../agents/developerAgent');
const { qaTesterAgent } = require('../agents/qaTesterAgent');
const { logger } = require('../utils/logger');
const { EVENT_TYPES } = require('../utils/eventTypes');

class StateGraph {
    constructor() {
        this.nodes = {};
        this.edges = {};
        this.conditionalEdges = {};
    }

    addNode(name, fn) {
        this.nodes[name] = fn;
        return this;
    }

    addEdge(fromNode, toNode) {
        this.edges[fromNode] = toNode;
        return this;
    }

    addConditionalEdge(fromNode, routingFn) {
        this.conditionalEdges[fromNode] = routingFn;
        return this;
    }

    async run(initialState) {
        let state = { ...initialState };
        let currentNode = 'architect';

        logger.info(EVENT_TYPES.PIPELINE_START, 'Starting agent pipeline execution graph...');

        while (currentNode && currentNode !== 'end' && currentNode !== 'failed') {
            state.currentNode = currentNode;
            state.history.push(currentNode);

            const nodeFn = this.nodes[currentNode];
            if (!nodeFn) {
                throw new Error(`Node "${currentNode}" is not registered in the graph.`);
            }

            logger.info(EVENT_TYPES.NODE_EXECUTION, `Executing node: [${currentNode}]`);

            const result = await nodeFn(state);
            state = { ...state, ...result };

            if (currentNode === 'qa') {
                state.qaAttempts = (state.qaAttempts || 0) + 1;
            }

            if (this.conditionalEdges[currentNode]) {
                const nextNode = this.conditionalEdges[currentNode](state);
                currentNode = nextNode;
            } else {
                currentNode = this.edges[currentNode];
            }
        }

        state.currentNode = currentNode;
        state.history.push(currentNode);

        if (currentNode === 'end') {
            logger.info(EVENT_TYPES.PIPELINE_SUCCESS, 'Pipeline execution completed successfully!');
        } else {
            logger.error(EVENT_TYPES.PIPELINE_FAIL, 'Pipeline execution stopped with failure.');
        }

        return state;
    }
}

const workflow = new StateGraph()
    .addNode('architect', architectAgent)
    .addNode('developer', developerAgent)
    .addNode('qa', qaTesterAgent)
    .addEdge('architect', 'developer')
    .addEdge('developer', 'qa')
    .addConditionalEdge('qa', routeAfterQA);

async function runAgentPipeline(task, codebaseContext = {}, memory = {}) {
    const initialState = createInitialState(task, codebaseContext, memory);
    return await workflow.run(initialState);
}

module.exports = {
    StateGraph,
    runAgentPipeline
};
