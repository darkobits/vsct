import {VSCTConfiguration} from 'etc/types';


const defaultConfig: VSCTConfiguration = {
  /**
   * By default, compiled themes will be written to <host package root>/themes.
   */
  outDir: 'themes',

  /**
   * Init theme descriptors array.
   */
  themes: []
};


export default defaultConfig;
