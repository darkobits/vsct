/**
 * ===== Configuration Loader ==================================================
 *
 * This module loads the user's .vsctrc file.
 */
import rc from 'rc';
import pkgInfo, {getUnscopedName} from 'lib/pkg-info';
import defaultConfig from 'etc/default-config';


/**
 * Loads VSCT configuration from the host package's .vsctrc file.
 */
export default async function loadConfig() {
  const name = getUnscopedName((await pkgInfo(__dirname)).json.name);
  return rc(name, defaultConfig);
}
