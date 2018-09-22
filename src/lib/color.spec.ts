import Color from './color';


describe('Color', () => {
  const c = new Color({r: 66, g: 66, b: 66});

  describe('#toJSON', () => {
    it('should return a HEX2 representation of the color', () => {
      expect(c.rgb().hsl().toJSON()).toEqual('#424242');
    });
  });

  describe('#string', () => {
    it('should return a valid CSS representation of the color', () => {
      expect(c.hsl().rgb().string()).toBe('rgb(66, 66, 66)');
    });
  });
});
