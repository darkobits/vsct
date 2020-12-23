import ThemeFactory from './theme';


describe('Theme', () => {
  describe('adding token colors', () => {
    it('should have the correct token colors', () => {
      const tokenColorsDescriptor = {
        scope: [
          'muh.scope'
        ],
        settings: {
          foreground: 'red'
        }
      };

      const theme = ThemeFactory(t => {
        t.tokenColors.add(tokenColorsDescriptor);
      });

      const serializedTheme = JSON.stringify(theme);

      expect(JSON.parse(serializedTheme)).toMatchObject({
        tokenColors: [
          tokenColorsDescriptor
        ]
      });
    });
  });

  describe('adding interface colors', () => {
    it('should have the correct interface colors', () => {
      const colorGroupDescriptor = {
        'foo.bar': '#FF00FF',
        'baz.qux': '#00FFFF'
      };

      const theme = ThemeFactory(t => {
        t.colors.add(colorGroupDescriptor);
      });

      const serializedTheme = JSON.stringify(theme);

      expect(JSON.parse(serializedTheme)).toMatchObject({
        colors: {
          ...colorGroupDescriptor
        }
      });
    });
  });

  describe('adding values at arbitrary paths', () => {
    const PATH = 'foo.bar';
    const VALUE = 'baz';

    it('should allow setting a value at an arbitrary path', () => {
      const theme = ThemeFactory(t => {
        t.set(PATH, VALUE);
      });

      const serializedTheme = JSON.stringify(theme);

      expect(JSON.parse(serializedTheme)).toMatchObject({
        foo: { bar: VALUE } });
    });

    it('should allow getting a value at an arbitrary path', () => {
      let result: any;

      ThemeFactory(t => {
        t.set(PATH, VALUE);
        result = t.get(PATH);
      });

      expect(result).toBe(VALUE);
    });
  });
});
