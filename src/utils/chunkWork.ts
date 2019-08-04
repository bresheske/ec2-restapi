import { getLogger } from './logger';
const logger = getLogger();
/**
 * Resolves an array of () => Promises, similar to Promise.all(), but with a max
 * concurrency setting.
 * @param work an array of functions that return a promise each.
 * @param concurrency max conncurrency to process at one time.
 */
export async function processWork<T>(work: (() => Promise<T>)[], concurrency: number = 50): Promise<T[]> {
    let resolved: T[] = [];
    const numChunks = Math.ceil(work.length / concurrency);
    
    return new Promise<T[]>(async (res) => {
        for (let currentChunk = 0; currentChunk < numChunks; currentChunk++) {
            const start = currentChunk * concurrency;
            const end = start + concurrency;
            const currentWork = work
                .slice(start, end);

            logger.writeDebugLine(`chunker: processing ${currentWork.length} work.`);
            const promises = currentWork.map(w => w());
            const results = await Promise.all(promises);
            logger.writeDebugLine(`chunker: processed ${results.length} work.`);
            resolved = resolved.concat(results);
        }
        return res(resolved);
    });
}