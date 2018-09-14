import Theme from './theme';


describe('Theme', () => {
  describe('adding token colors', () => {
    it('should have the correct token colors', () => {
      const tokenColorsDescriptor = {
        settings: {
          foo: 'bar'
        },
        scope: [
          'muh.scope'
        ]
      };

      const theme = new Theme(t => {
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

      const theme = new Theme(t => {
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
});
