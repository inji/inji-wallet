import {groupBy} from './javascript';

describe('javascript utils', () => {
  describe('groupBy', () => {
    it('should group elements based on predicate', () => {
      const array = [1, 2, 3, 4, 5, 6];
      const predicate = (num: number) => num % 2 === 0;

      const [trueElements, falseElements] = groupBy(array, predicate);

      expect(trueElements).toEqual([2, 4, 6]);
      expect(falseElements).toEqual([1, 3, 5]);
    });

    it('should return empty arrays for empty input', () => {
      const array: number[] = [];
      const predicate = (num: number) => num > 0;

      const [trueElements, falseElements] = groupBy(array, predicate);

      expect(trueElements).toEqual([]);
      expect(falseElements).toEqual([]);
    });

    it('should put all elements in true group when predicate always returns true', () => {
      const array = ['a', 'b', 'c'];
      const predicate = () => true;

      const [trueElements, falseElements] = groupBy(array, predicate);

      expect(trueElements).toEqual(['a', 'b', 'c']);
      expect(falseElements).toEqual([]);
    });

    it('should put all elements in false group when predicate always returns false', () => {
      const array = ['a', 'b', 'c'];
      const predicate = () => false;

      const [trueElements, falseElements] = groupBy(array, predicate);

      expect(trueElements).toEqual([]);
      expect(falseElements).toEqual(['a', 'b', 'c']);
    });

    it('should handle complex objects', () => {
      const array = [
        {name: 'John', age: 30},
        {name: 'Jane', age: 25},
        {name: 'Bob', age: 35},
      ];
      const predicate = (person: {name: string; age: number}) =>
        person.age >= 30;

      const [trueElements, falseElements] = groupBy(array, predicate);

      expect(trueElements).toEqual([
        {name: 'John', age: 30},
        {name: 'Bob', age: 35},
      ]);
      expect(falseElements).toEqual([{name: 'Jane', age: 25}]);
    });

    it('should handle undefined array', () => {
      const array = undefined as any;
      const predicate = (num: number) => num > 0;

      const [trueElements, falseElements] = groupBy(array, predicate);

      expect(trueElements).toEqual([]);
      expect(falseElements).toEqual([]);
    });
  });
});
