import * as fs from 'fs';
import * as glob from 'glob';
import * as _ from 'lodash';
import * as path from 'path';

import { ContractData } from './types';

export const collectContractsData = (artifactsPath: string, sourcesPath: string, networkId: number) => {
    const artifactsGlob = `${artifactsPath}/**/*.json`;
    const artifactFileNames = glob.sync(artifactsGlob, { absolute: true });
    const contractsData: ContractData[] = [];
    _.forEach(artifactFileNames, artifactFileName => {
        const artifact = JSON.parse(fs.readFileSync(artifactFileName).toString());
        const versionNames = _.keys(artifact.versions);
        for (const versionName of versionNames) {
            const version = artifact.versions[versionName];
            const sources = _.keys(version.sources);
            const contractName = artifact.contractName;
            // We don't compute coverage for dependencies
            const sourceCodes = _.map(sources, (source: string) => fs.readFileSync(source).toString());
            const contractData = {
                sourceCodes,
                sources,
                bytecode: version.compilerOutput.evm.bytecode.object,
                sourceMap: version.compilerOutput.evm.bytecode.sourceMap,
                runtimeBytecode: version.compilerOutput.evm.deployedBytecode.object,
                sourceMapRuntime: version.compilerOutput.evm.deployedBytecode.sourceMap,
            };
            contractsData.push(contractData);
        }
    });
    return contractsData;
};
