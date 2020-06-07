/**
 * ===== Color =================================================================
 *
 * Wraps the Color class, replacing toString/toJSON with methods that return a
 * hex2 (re: hex + alpha channel) color string, required by VS Code.
 *
 * Color uses Object.freeze on its instances to enforce immutability, and we
 * want to dynamically wrap many of its methods. Hence the somewhat
 * counter-intuitive approach taken here.
 */
import Color from 'color';


/**
 * Converts a number into its hexadecimal representation with zero padding.
 */
function rgbToHex(value: number): string {
  return Math.round(value).toString(16).padStart(2, '0').toUpperCase();
}


Color.prototype.toString = function(this: Color): string {
  const rgb = this.rgb();
  let hexColor = ['#', rgbToHex(rgb.red()), rgbToHex(rgb.green()), rgbToHex(rgb.blue())].join('');

  if (rgb.alpha() !== 1) {
    hexColor += rgbToHex(rgb.alpha() * 255);
  }

  return hexColor.toUpperCase();
};


Color.prototype.toJSON = function(this: Color): any {
  return this.toString();
};


export default Color;
