import type { Sources, CollectedSources } from "./types";
/**
 * Collects sources, targets into collections with OS-independent paths,
 * along with a reverse mapping to the original path (for post-processing)
 *
 * @param originalSources - { [originalSourcePath]: contents }
 * @param originalTargets - originalSourcePath[]
 * @param baseDirectory - a directory to remove as a prefix
 * @param replacement - what to replace it with
 * @return { sources, targets, originalSourcePaths }
 */
export declare function collectSources(originalSources: Sources, originalTargets?: string[], baseDirectory?: string, replacement?: string): CollectedSources;
