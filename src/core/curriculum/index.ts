/**
 * Curriculum module — barrel export.
 * Spec: docs/foundations/29-34
 */
export * from './types.js';
export { buildGraph, detectCycles, topologicalSort, allPrerequisites, dependents, detectGaps, learningPath, findReadyConcepts } from './KnowledgeGraph.js';
export type { GraphNode, GraphEdge } from './KnowledgeGraph.js';
export { computeRetention, computeConceptRetention, updateAfterSuccess, updateAfterFailure, createCurve, computeReviewCandidates, nextDepthLevel, computeRetentionStats } from './ForgettingCurve.js';
// REVIEW_THRESHOLD and CRITICAL_THRESHOLD are re-exported via export * from './types.js' above.
export { classifyDepth, assessDualDepth, updateConceptState } from './DepthAssessment.js';
export { CurriculumRegistry, getCurriculumRegistry, resetCurriculumRegistry } from './CurriculumRegistry.js';
export { bridgeCurriculumToDevelopmental, bridgeDevelopmentalToCurriculum, computeCurriculumReviewSchedule, computeDepthProgressions, computeKnowledgeHealth } from './CurriculumBridge.js';
export { lintHolon, lintRegistry } from './CurriculumLinter.js';
export type { CurriculumBridgeResult, DevelopmentalNeed } from './CurriculumBridge.js';
