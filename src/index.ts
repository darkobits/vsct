// @ts-ignore
declare module '@darkobits/vsct' {

}

export { default as Color } from 'lib/color';
export { default } from 'lib/theme';
import type { VSCTConfiguration } from 'etc/types';

type UserConfigurationArgument =
  VSCTConfiguration |
  (() => VSCTConfiguration) |
  (() => Promise<VSCTConfiguration>);

export function defineConfig(arg: UserConfigurationArgument) {
  return arg;
}

export type { VSCTConfiguration } from 'etc/types';
