// @ts-ignore
declare module '@darkobits/vsct' {

}

export { default as Color } from 'lib/color';
export { default } from 'lib/theme';
import type { VSCTConfiguration } from 'etc/types';

export function defineConfig(userConfig: VSCTConfiguration) {
  return userConfig;
}

export type { VSCTConfiguration } from 'etc/types';
