import Color from './color';


describe('Color', () => {
  const c = new Color({r: 66, g: 66, b: 66});


  // ----- Serializers ---------------------------------------------------------

  describe('#toString', () => {
    it('should return a HEX2 representation of the color', () => {
      const color = c.alpha(0.26);
      expect(color.toString()).toBe('#42424242');
    });
  });

  describe('#toJSON', () => {
    it('should return a HEX2 representation of the color', () => {
      expect(c.toJSON()).toBe('#424242');
    });
  });

  describe('#string', () => {
    it('should return a valid CSS representation of the color', () => {
      expect(c.string()).toBe('rgb(66, 66, 66)');
    });
  });

  describe('#percentString', () => {
    it('should return a valid CSS percentage representation of the color', () => {
      expect(c.percentString()).toBe('rgb(26%, 26%, 26%)');
    });
  });

  describe('#array', () => {
    it('should return an array representation of the color', () => {
      expect(c.array()).toEqual([66, 66, 66]);
    });
  });

  describe('#object', () => {
    it('should return an object representation of the color', () => {
      expect(c.object()).toEqual({r: 66, g: 66, b: 66});
    });
  });

  describe('#unitArray', () => {
    it('should return an unit array representation of the color', () => {
      expect(c.unitArray()).toEqual([0.25882352941176473, 0.25882352941176473, 0.25882352941176473]);
    });
  });

  describe('#unitObject', () => {
    it('', () => {
      expect(c.unitObject()).toEqual({r: 0.25882352941176473, g: 0.25882352941176473, b: 0.25882352941176473});
    });
  });

  describe('#rgbNumber', () => {
    it('should return the RGB number representation of the color', () => {
      expect(c.rgbNumber()).toBe(4342338);
    });
  });

  describe('#luminosity', () => {
    it('should return the luminosity of the color', () => {
      expect(c.luminosity()).toBe(0.05448027644244236);
    });
  });


  // ----- Getters/Setters -----------------------------------------------------

  function randomBetween(low: number, high: number) {
    return Math.floor(Math.random() * high) + low;
  }

  const getterSetters = [
    ['alpha', 1],
    ['red', 255],
    ['green', 255],
    ['blue', 255],
    ['hue', 255],
    ['saturationl', 100],
    ['saturationv', 100],
    ['lightness', 100],
    ['value', 100],
    ['chroma', 100],
    ['gray', 100],
    ['white', 100],
    ['wblack', 100],
    ['cyan', 100],
    ['magenta', 100],
    ['yellow', 100],
    ['black', 100],
    ['x', 100],
    ['y', 100],
    ['z', 100],
    ['l', 100],
    ['a', 100],
    ['b', 100]
  ];

  getterSetters.forEach(([method, maxValue]) => {
    describe(`#${method}`, () => {
      it(`should return a new color with the provided ${method} value`, () => {
        const newValue = randomBetween(0.25, maxValue as number);
        const c2 = c[method](newValue);
        expect(c2).not.toEqual(c);
        expect(c[method]()).not.toEqual(c2[method]());
        expect(c2[method]()).toBe(newValue);
      });
    });
  });

  describe('#keyword', () => {
    it('should get the keyword of the color', () => {
      expect(c.keyword()).toBe('darkslategray');
    });

    it('should return a new color with the provided alpha value', () => {
      const c2 = c.keyword('rebeccapurple');
      expect(c2).not.toEqual(c);
      expect(c2.keyword()).toBe('rebeccapurple');
    });
  });

  describe('#hex', () => {
    it('should get the hex value of the color', () => {
      expect(c.hex()).toBe('#424242');
    });

    it('should return a new color with the provided hex value', () => {
      const c2 = c.hex('#161616');
      expect(c2).not.toEqual(c);
      expect(c2.hex()).toBe('#161616');
    });
  });


  // ----- Mutations -----------------------------------------------------------

  describe('#negate', () => {
    it('should return a new color that is the negation of the original', () => {
      expect(c.negate().toString()).toEqual('#BDBDBD');
    });
  });

  describe('#lighten', () => {
    it('should return a new color lightened by the provided amount', () => {
      expect(c.lighten(0.32).toString()).toEqual('#575757');
    });
  });

  describe('#darken', () => {
    it('should return a new color darkened by the provided amount', () => {
      expect(c.darken(0.32).toString()).toEqual('#2D2D2D');
    });
  });

  describe('#saturate', () => {
    it('should return a new color saturated by the provided amount', () => {
      expect(c.keyword('rebeccapurple').saturate(0.32).toString()).toEqual('#6623A9');
    });
  });

  describe('#desaturate', () => {
    it('should return a new color de-saturated by the provided amount', () => {
      expect(c.keyword('rebeccapurple').desaturate(0.32).toString()).toEqual('#664389');
    });
  });

  describe('#whiten', () => {
    it('should return a new color whitened by the provided amount', () => {
      expect(c.whiten(0.32).toString()).toEqual('#505050');
    });
  });

  describe('#blacken', () => {
    it('should return a new color blackened by the provided amount', () => {
      expect(c.blacken(0.32).toString()).toEqual('#353535');
    });
  });

  describe('#grayscale', () => {
    it('should return a new grayscale representation of the color', () => {
      expect(c.keyword('rebeccapurple').grayscale().toString()).toEqual('#4E4E4E');
    });
  });

  describe('#fade', () => {
    it('should return a new color faded by the provided amount', () => {
      expect(c.fade(0.32).toString()).toEqual('#424242AD');
    });
  });

  describe('#opaquer', () => {
    it('should return a new color de-saturated by the provided amount', () => {
      expect(c.fade(0.32).opaquer(0.16).toString()).toEqual('#424242C9');
    });
  });

  describe('#rotate', () => {
    it('should return a new color faded by the provided amount', () => {
      expect(c.keyword('rebeccapurple').rotate(128).toString()).toEqual('#997433');
    });
  });

  describe('#mix', () => {
    it('should return a new color faded by the provided amount', () => {
      const mixColor = new Color('rebeccapurple');
      expect(c.mix(mixColor, 0.5).toString()).toEqual('#543B6E');
    });
  });

  describe('#round', () => {
    it('should return a new color with all values rounded to the provided precision', () => {
      const c2 = new Color({r: 12.345, g: 12.345, b: 12.345});
      expect(c2.round(1).object()).toEqual({r: 12.3, g: 12.3, b: 12.3});
    });
  });


  // ----- Comparators ---------------------------------------------------------

  describe('#contrast', () => {
    it('should return the contrast between itself and the provided color', () => {
      const c2 = new Color('rebeccapurple');
      expect(c.contrast(c2)).toBe(1.1956650178207555);
    });
  });

  describe('#level', () => {
    it('should return the level difference between itself and the provided color', () => {
      const c2 = new Color('white');
      const c3 = new Color('black');
      expect(c2.level(c3)).toBe('AAA');
    });
  });


  // ----- Predicates ----------------------------------------------------------

  describe('#isDark', () => {
    it('should return true if the color is dark', () => {
      expect(c.isDark()).toBe(true);
      expect(c.negate().isDark()).toBe(false);
    });
  });

  describe('#isLight', () => {
    it('should return true if the color is light', () => {
      expect(c.isLight()).toBe(false);
      expect(c.negate().isLight()).toBe(true);
    });
  });


  // ----- Converters ----------------------------------------------------------

  describe('#rgb', () => {
    it('should return a new color that uses the RGB model', () => {
      // @ts-ignore
      expect(c.rgb()._color.model).toBe('rgb');
    });
  });

  describe('#hsl', () => {
    it('should return a new color that uses the HSL model', () => {
      // @ts-ignore
      expect(c.hsl()._color.model).toBe('hsl');
    });
  });

  describe('#hsv', () => {
    it('should return a new color that uses the HSV model', () => {
      // @ts-ignore
      expect(c.hsv()._color.model).toBe('hsv');
    });
  });

  describe('#hwb', () => {
    it('should return a new color that uses the HWB model', () => {
      // @ts-ignore
      expect(c.hwb()._color.model).toBe('hwb');
    });
  });

  describe('#cmyk', () => {
    it('should return a new color that uses the CMYK model', () => {
      // @ts-ignore
      expect(c.cmyk()._color.model).toBe('cmyk');
    });
  });

  describe('#xyz', () => {
    it('should return a new color that uses the XYZ model', () => {
      // @ts-ignore
      expect(c.xyz()._color.model).toBe('xyz');
    });
  });

  describe('#lab', () => {
    it('should return a new color that uses the LAB model', () => {
      // @ts-ignore
      expect(c.lab()._color.model).toBe('lab');
    });
  });

  describe('#lch', () => {
    it('should return a new color that uses the LCH model', () => {
      // @ts-ignore
      expect(c.lch()._color.model).toBe('lch');
    });
  });

  describe('#ansi16', () => {
    it('should return a new color that uses the ANSI16 model', () => {
      // @ts-ignore
      expect(c.ansi16()._color.model).toBe('ansi16');
    });
  });

  describe('#ansi256', () => {
    it('should return a new color that uses the ANSI256 model', () => {
      // @ts-ignore
      expect(c.ansi256()._color.model).toBe('ansi256');
    });
  });

  describe('#hcg', () => {
    it('should return a new color that uses the HCG model', () => {
      // @ts-ignore
      expect(c.hcg()._color.model).toBe('hcg');
    });
  });

  describe('#apple', () => {
    it('should return a new color that uses the apple model', () => {
      // @ts-ignore
      expect(c.apple()._color.model).toBe('apple');
    });
  });
});
