import Color from './lib/color';
import Theme from './lib/theme';


export {Color};
export default Theme;


// @ts-ignore
declare module '@darkobits/vsct' {
  export {Color};
  export default Theme;
}
