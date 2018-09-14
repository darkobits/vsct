/**
 * ===== Color =================================================================
 *
 * Wraps the Color class, replacing toString/toJSON with methods that return a
 * hex2 (re: hex + alpha channel) color string, required by VS Code.
 *
 * - Why not just extend Color and re-implement toString/toJSON?
 *
 *   This approach will not work because the original methods in Color return a
 *   new instance of Color, so as soon as any color is mutated, the subclass is
 *   lost.
 */
import Color from 'color';


export default class ColorWrapper {
  [index: string]: any;

  private readonly _color: Color;

  constructor(...args: Array<any>) {
    this._color = new Color(...args);
  }

  private _formatColor(value: any): string {
    return Math.round(value).toString(16).padStart(2, '0').toUpperCase();
  }


  // ----- Serializers ---------------------------------------------------------

  toString() {
    const rgb = this._color.rgb();

    let hexColor = [
      '#',
      this._formatColor(rgb.red()),
      this._formatColor(rgb.green()),
      this._formatColor(rgb.blue())
    ].join('').toUpperCase();

    if (rgb.alpha() !== 1) {
      hexColor += this._formatColor(rgb.alpha() * 255);
    }

    return hexColor;
  }

  toJSON(): string {
    return this.toString();
  }

  string(places?: number | undefined) {
    return this._color.string(places);
  }

  percentString(places?: number | undefined) {
    return this._color.percentString(places);
  }

  array() {
    return this._color.array();
  }

  object() {
    return this._color.object();
  }

  unitArray() {
    return this._color.unitArray();
  }

  unitObject() {
    return this._color.unitObject();
  }


  // ----- Getters -------------------------------------------------------------

  rgbNumber(): number {
    return this._color.rgbNumber();
  }

  luminosity(): number {
    return this._color.luminosity();
  }


  // ----- Getter/Setters ------------------------------------------------------

  alpha(): number;
  alpha(val: number): ColorWrapper;
  alpha(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.alpha(val));
    }
    return this._color.alpha();
  }

  red(): number;
  red(val: number): ColorWrapper;
  red(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.red(val));
    }

    return this._color.red();
  }

  green(): number;
  green(val: number): ColorWrapper;
  green(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.green(val));
    }

    return this._color.green();
  }

  blue(): number;
  blue(val: number): ColorWrapper;
  blue(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.blue(val));
    }

    return this._color.blue();
  }

  hue(): number;
  hue(val: number): ColorWrapper;
  hue(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.hue(val));
    }

    return this._color.hue();
  }

  saturationl(): number;
  saturationl(val: number): ColorWrapper;
  saturationl(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.saturationl(val));
    }

    return this._color.saturationl();
  }

  saturationv(): number;
  saturationv(val: number): ColorWrapper;
  saturationv(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.saturationv(val));
    }

    return this._color.saturationv();
  }

  lightness(): number;
  lightness(val: number): ColorWrapper;
  lightness(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.lightness(val));
    }

    return this._color.lightness();
  }

  value(): number;
  value(val: number): ColorWrapper;
  value(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.value(val));
    }

    return this._color.value();
  }

  chroma(): number;
  chroma(val: number): ColorWrapper;
  chroma(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.chroma(val));
    }

    return this._color.chroma();
  }

  gray(): number;
  gray(val: number): ColorWrapper;
  gray(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.gray(val));
    }

    return this._color.gray();
  }

  white(): number;
  white(val: number): ColorWrapper;
  white(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.white(val));
    }

    return this._color.white();
  }

  wblack(): number;
  wblack(val: number): ColorWrapper;
  wblack(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.wblack(val));
    }

    return this._color.wblack();
  }

  cyan(): number;
  cyan(val: number): ColorWrapper;
  cyan(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.cyan(val));
    }

    return this._color.cyan();
  }

  magenta(): number;
  magenta(val: number): ColorWrapper;
  magenta(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.magenta(val));
    }

    return this._color.magenta();
  }

  yellow(): number;
  yellow(val: number): ColorWrapper;
  yellow(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.yellow(val));
    }

    return this._color.yellow();
  }

  black(): number;
  black(val: number): ColorWrapper;
  black(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.black(val));
    }

    return this._color.black();
  }

  x(): number;
  x(val: number): ColorWrapper;
  x(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.x(val));
    }

    return this._color.x();
  }

  y(): number;
  y(val: number): ColorWrapper;
  y(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.y(val));
    }

    return this._color.y();
  }

  z(): number;
  z(val: number): ColorWrapper;
  z(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.z(val));
    }

    return this._color.z();
  }

  l(): number;
  l(val: number): ColorWrapper;
  l(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.l(val));
    }

    return this._color.l();
  }

  a(): number;
  a(val: number): ColorWrapper;
  a(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.a(val));
    }

    return this._color.a();
  }

  b(): number;
  b(val: number): ColorWrapper;
  b(val?: number): ColorWrapper | number {
    if (val !== undefined) {
      return new ColorWrapper(this._color.b(val));
    }

    return this._color.b();
  }

  keyword(): string;
  keyword(val: string): ColorWrapper;
  keyword(val?: string): ColorWrapper | string {
    if (val !== undefined) {
      return new ColorWrapper(this._color.keyword(val));
    }

    return this._color.keyword();
  }

  hex(): string;
  hex(val: string): ColorWrapper;
  hex(val?: string): ColorWrapper | string {
    if (val !== undefined) {
      return new ColorWrapper(this._color.hex(val));
    }

    return this._color.hex();
  }


  // ----- Mutations -----------------------------------------------------------

  negate(): ColorWrapper {
    return new ColorWrapper(this._color.negate());
  }

  lighten(ratio: number): ColorWrapper {
    return new ColorWrapper(this._color.lighten(ratio));
  }

  darken(ratio: number): ColorWrapper {
    return new ColorWrapper(this._color.darken(ratio));
  }

  saturate(ratio: number): ColorWrapper {
    return new ColorWrapper(this._color.saturate(ratio));
  }

  desaturate(ratio: number): ColorWrapper {
    return new ColorWrapper(this._color.desaturate(ratio));
  }

  whiten(ratio: number): ColorWrapper {
    return new ColorWrapper(this._color.whiten(ratio));
  }

  blacken(ratio: number): ColorWrapper {
    return new ColorWrapper(this._color.blacken(ratio));
  }

  grayscale(): ColorWrapper {
    return new ColorWrapper(this._color.grayscale());
  }

  fade(ratio: number): ColorWrapper {
    return new ColorWrapper(this._color.fade(ratio));
  }

  opaquer(ratio: number): ColorWrapper {
    return new ColorWrapper(this._color.opaquer(ratio));
  }

  rotate(degrees: number): ColorWrapper {
    return new ColorWrapper(this._color.rotate(degrees));
  }

  mix(mixinColor: ColorWrapper, weight?: number): ColorWrapper {
    return new ColorWrapper(this._color.mix(mixinColor._color, weight));
  }

  round(places?: number): ColorWrapper {
    return new ColorWrapper(this._color.round(places));
  }


  // ----- Comparators ---------------------------------------------------------

  contrast(color2: ColorWrapper): number {
    return this._color.contrast(color2._color);
  }

  level(color2: ColorWrapper): string {
    return this._color.level(color2._color);
  }


  // ----- Predicates ----------------------------------------------------------

  isDark(): boolean {
    return this._color.isDark();
  }

  isLight(): boolean {
    return this._color.isLight();
  }


  // ----- Converters ----------------------------------------------------------

  rgb() {
    return new ColorWrapper(this._color.rgb());
  }

  hsl() {
    return new ColorWrapper(this._color.hsl());
  }

  hsv() {
    return new ColorWrapper(this._color.hsv());
  }

  hwb() {
    return new ColorWrapper(this._color.hwb());
  }

  cmyk() {
    return new ColorWrapper(this._color.cmyk());
  }

  xyz() {
    return new ColorWrapper(this._color.xyz());
  }

  lab() {
    return new ColorWrapper(this._color.lab());
  }

  lch() {
    return new ColorWrapper(this._color.lch());
  }

  ansi16() {
    return new ColorWrapper(this._color.ansi16());
  }

  ansi256() {
    return new ColorWrapper(this._color.ansi256());
  }

  hcg() {
    return new ColorWrapper(this._color.hcg());
  }

  apple() {
    return new ColorWrapper(this._color.apple());
  }
}
