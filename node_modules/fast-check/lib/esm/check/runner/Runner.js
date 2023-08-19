import { Stream, stream } from '../../stream/Stream.js';
import { readConfigureGlobal } from './configuration/GlobalParameters.js';
import { QualifiedParameters } from './configuration/QualifiedParameters.js';
import { decorateProperty } from './DecorateProperty.js';
import { RunnerIterator } from './RunnerIterator.js';
import { SourceValuesIterator } from './SourceValuesIterator.js';
import { toss } from './Tosser.js';
import { pathWalk } from './utils/PathWalker.js';
import { asyncReportRunDetails, reportRunDetails } from './utils/RunDetailsFormatter.js';
function runIt(property, shrink, sourceValues, verbose, interruptedAsFailure) {
    const runner = new RunnerIterator(sourceValues, shrink, verbose, interruptedAsFailure);
    for (const v of runner) {
        const out = property.run(v);
        runner.handleResult(out);
    }
    return runner.runExecution;
}
async function asyncRunIt(property, shrink, sourceValues, verbose, interruptedAsFailure) {
    const runner = new RunnerIterator(sourceValues, shrink, verbose, interruptedAsFailure);
    for (const v of runner) {
        const out = await property.run(v);
        runner.handleResult(out);
    }
    return runner.runExecution;
}
function runnerPathWalker(valueProducers, shrink, path) {
    const pathPoints = path.split(':');
    const pathStream = stream(valueProducers)
        .drop(pathPoints.length > 0 ? +pathPoints[0] : 0)
        .map((producer) => producer());
    const adaptedPath = ['0', ...pathPoints.slice(1)].join(':');
    return stream(pathWalk(adaptedPath, pathStream, shrink)).map((v) => () => v);
}
function buildInitialValues(valueProducers, shrink, qParams) {
    if (qParams.path.length === 0) {
        return stream(valueProducers);
    }
    return runnerPathWalker(valueProducers, shrink, qParams.path);
}
function check(rawProperty, params) {
    if (rawProperty == null || rawProperty.generate == null)
        throw new Error('Invalid property encountered, please use a valid property');
    if (rawProperty.run == null)
        throw new Error('Invalid property encountered, please use a valid property not an arbitrary');
    const qParams = QualifiedParameters.read(Object.assign(Object.assign({}, readConfigureGlobal()), params));
    if (qParams.reporter !== null && qParams.asyncReporter !== null)
        throw new Error('Invalid parameters encountered, reporter and asyncReporter cannot be specified together');
    if (qParams.asyncReporter !== null && !rawProperty.isAsync())
        throw new Error('Invalid parameters encountered, only asyncProperty can be used when asyncReporter specified');
    const property = decorateProperty(rawProperty, qParams);
    const generator = toss(property, qParams.seed, qParams.randomType, qParams.examples);
    const maxInitialIterations = qParams.path.indexOf(':') === -1 ? qParams.numRuns : -1;
    const maxSkips = qParams.numRuns * qParams.maxSkipsPerRun;
    const shrink = property.shrink.bind(property);
    const initialValues = buildInitialValues(generator, shrink, qParams);
    const sourceValues = new SourceValuesIterator(initialValues, maxInitialIterations, maxSkips);
    const finalShrink = !qParams.endOnFailure ? shrink : Stream.nil;
    return property.isAsync()
        ? asyncRunIt(property, finalShrink, sourceValues, qParams.verbose, qParams.markInterruptAsFailure).then((e) => e.toRunDetails(qParams.seed, qParams.path, maxSkips, qParams))
        : runIt(property, finalShrink, sourceValues, qParams.verbose, qParams.markInterruptAsFailure).toRunDetails(qParams.seed, qParams.path, maxSkips, qParams);
}
function assert(property, params) {
    const out = check(property, params);
    if (property.isAsync())
        return out.then(asyncReportRunDetails);
    else
        reportRunDetails(out);
}
export { check, assert };
