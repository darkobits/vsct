/**
 * ===== Configuration Loader ==================================================
 *
 * This module loads the .vsctrc file in the host package's repository, parses
 * it, applies default configuration options, and returns an object representing
 * the final configuration for the host project.
 */
import rc from 'rc';

import {VSCTConfiguration} from 'etc/types';
import defaultConfig from 'etc/default-config';


/**
 * Loads VSCT configuration from the host package's .vsctrc file.
 */
export default function loadConfig(): VSCTConfiguration {
  const config: VSCTConfiguration = rc('vsct', defaultConfig);

  if (!config) {
    throw new Error('[loadConfig] No .vsctrc file found.');
  }

  return config;
}
