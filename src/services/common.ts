type BigintsToStrings<T> = {
  [P in keyof T]: T[P] extends bigint ? string : T[P];
};

export const bigintsToStrings = <T>(args: T): BigintsToStrings<T> => {
  const replaceInternal = (x: unknown): unknown => {
    if (typeof x === 'bigint') {
      return x.toString();
    } else if (Array.isArray(x)) {
      return x.map(replaceInternal);
    } else if (typeof x === 'object') {
      return Object.keys(x as object).reduce(
        (acc, key) => {
          acc[key] = replaceInternal((x as Record<string, unknown>)[key]);
          return acc;
        },
        {} as Record<string, unknown>,
      );
    }

    return x;
  };

  return replaceInternal(args) as BigintsToStrings<T>;
};
