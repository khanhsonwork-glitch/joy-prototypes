// The same rule evaluator drives the canvas, test preview and exported email.
export const CONDITION_OPERATORS = [
  {label: 'is', value: 'is'}, {label: 'is not', value: 'is-not'},
  {label: 'greater than', value: 'gt'}, {label: 'less than', value: 'lt'},
  {label: 'contains', value: 'contains'}, {label: 'is empty', value: 'empty'}, {label: 'is not empty', value: 'not-empty'},
];
export function conditionMatches(condition, values = {}) {
  if (!condition?.rules?.length) return true;
  const number = value => Number(String(value).replace(/[$,]/g, ''));
  const results = condition.rules.map(rule => {
    if (!rule.variable) return true;
    const actual = String(values[rule.variable] ?? '');
    const expected = String(rule.value ?? '');
    switch (rule.operator) {
      case 'is': return actual === expected;
      case 'is-not': return actual !== expected;
      case 'gt': return number(actual) > number(expected);
      case 'lt': return number(actual) < number(expected);
      case 'contains': return actual.toLowerCase().includes(expected.toLowerCase());
      case 'empty': return actual.trim() === '';
      case 'not-empty': return actual.trim() !== '';
      default: return true;
    }
  });
  return condition.match === 'any' ? results.some(Boolean) : results.every(Boolean);
}
