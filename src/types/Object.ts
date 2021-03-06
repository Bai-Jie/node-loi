import * as t from 'io-ts';
import { LoiDecoratorNullAsUndefined } from '../decorators/nullAsUndefined';
import { decorate, ILoiOption, LoiFactory, metadata } from '../utilties/factory';
import { isString, objectMapValues } from '../utilties/lodash';
import { LoiFactoryBase } from './Base';

/** @internal */
export interface ILoiOptionObject extends ILoiOption {
  name: string,
  type?: Function,
  instanceof?: Function,
  strict?: boolean,
  violet?: boolean,
}

/** @internal */
export function getNameFromProps(required: t.Props = {}, optional: t.Props = {}): string {
  const result = `{ ${[
    ...Object.keys(required).map((k) => `${k}: ${required[k].name}`),
    ...Object.keys(optional).map((k) => `${k}?: ${optional[k].name}`),
  ].join(', ')} }`

  return result === "{  }" ? "{}" : result;
}

export declare type TypeOfPartialUndefinedableProps<P extends t.AnyProps> = {
  [K in keyof P]?: t.TypeOf<P[K]> | undefined;
};

export declare type OutputOfPartialUndefinedableProps<P extends t.AnyProps> = {
  [K in keyof P]?: t.OutputOf<P[K]> | undefined;
};

/** @internal */
export function nullablePartial<P extends t.Props>(props: P, name?: string): t.PartialType<
  P,
  TypeOfPartialUndefinedableProps<P>,
  OutputOfPartialUndefinedableProps<P>
> {
  return t.partial(objectMapValues(props, (i) => new LoiDecoratorNullAsUndefined(i) as typeof i) as P, name);
}

export class LoiTypeObject<R extends t.Props, O extends t.Props> extends t.Type<
  t.TypeOfProps<R> & TypeOfPartialUndefinedableProps<O>,
  t.OutputOfProps<R> & OutputOfPartialUndefinedableProps<O>
> {
  static readonly _tag: 'LoiTypeObject' = 'LoiTypeObject'
  readonly _tag: 'LoiTypeObject' = 'LoiTypeObject'
  constructor(
    readonly props: R,
    readonly optionalProps: O,
    name: string = getNameFromProps(props, optionalProps),
  ) {
    super(
      name,
      (loose = t.intersection([t.interface(props), nullablePartial(optionalProps)])).is,
      loose.validate,
      loose.encode
    )

    // [ts] A 'super' call must be the first statement in the constructor when a class contains initialized properties or has parameter properties.
    // tslint:disable-next-line:no-var-keyword
    var loose: t.IntersectionType<
      [
        t.InterfaceType<R, t.TypeOfProps<R>, t.OutputOfProps<R>>,
        t.PartialType<O, TypeOfPartialUndefinedableProps<O>, OutputOfPartialUndefinedableProps<O>>
      ],
      t.TypeOfProps<R> & TypeOfPartialUndefinedableProps<O>,
      t.OutputOfProps<R> & OutputOfPartialUndefinedableProps<O>
    >;
  }
}

/**
 * Return a new type that validates successfully only
 * when the instance (object) contains no unknow properties.
 *
 * https://github.com/gunzip/digital-citizenship-functions/blob/cd5c57629cb188dbda4b03037fbb399115fd6d29/lib/utils/types.ts#L92
 * https://github.com/gcanti/io-ts/issues/106
 *
 */
export class LoiTypeObjectStrict<R extends t.Props, O extends t.Props> extends t.Type<
  t.TypeOfProps<R> & TypeOfPartialUndefinedableProps<O>,
  t.OutputOfProps<R> & OutputOfPartialUndefinedableProps<O>
  > {
  static readonly _tag: 'LoiTypeObjectStrict' = 'LoiTypeObjectStrict'
  readonly _tag: 'LoiTypeObjectStrict' = 'LoiTypeObjectStrict'
  constructor(
    readonly props: R,
    readonly optionalProps: O,
    name: string = getNameFromProps(props, optionalProps),
  ) {
    super(
      name,
      (v): v is t.TypeOfProps<R> & TypeOfPartialUndefinedableProps<O> =>
        loose.is(v) && Object.getOwnPropertyNames(v).every((k) => allProps.hasOwnProperty(k)),
      (s, c) =>
        loose.validate(s, c).chain((o) => {
          const errors: t.Errors = Object.getOwnPropertyNames(o)
            .map(
              (key) =>
                !allProps.hasOwnProperty(key)
                  ? t.getValidationError(o[key], t.appendContext(c, key, t.never))
                  : undefined
            )
            .filter((e): e is t.ValidationError => e !== undefined);
          return errors.length ? t.failures(errors) : t.success(o);
        }),
      (loose = t.intersection([t.interface(props), nullablePartial(optionalProps)])).encode
    );

    // [ts] A 'super' call must be the first statement in the constructor when a class contains initialized properties or has parameter properties.
    // tslint:disable-next-line:no-var-keyword
    var loose: t.IntersectionType<
      [
        t.InterfaceType<R, t.TypeOfProps<R>, t.OutputOfProps<R>>,
        t.PartialType<O, TypeOfPartialUndefinedableProps<O>, OutputOfPartialUndefinedableProps<O>>
      ],
      t.TypeOfProps<R> & TypeOfPartialUndefinedableProps<O>,
      t.OutputOfProps<R> & OutputOfPartialUndefinedableProps<O>
      >;

    // tslint:disable-next-line:prefer-const no-var-keyword
    var allProps: R & O & {} = Object.assign({}, props, optionalProps);
  }
}

export class LoiTypeObjectViolet<R extends t.Props, O extends t.Props> extends t.Type<
  t.TypeOfProps<R> & TypeOfPartialUndefinedableProps<O>,
  t.OutputOfProps<R> & OutputOfPartialUndefinedableProps<O>
  > {
  static readonly _tag: 'LoiTypeObjectViolet' = 'LoiTypeObjectViolet'
  readonly _tag: 'LoiTypeObjectViolet' = 'LoiTypeObjectViolet'
  constructor(
    readonly props: R,
    readonly optionalProps: O,
    name: string = getNameFromProps(props, optionalProps),
  ) {
    super(
      name,
      (v): v is t.TypeOfProps<R> & TypeOfPartialUndefinedableProps<O> => loose.is(v),
      (s, c) =>
        loose.validate(s, c).chain((o) => {
          const keys = Object.getOwnPropertyNames(o)
          const newObject: t.OutputOfProps<R> & t.OutputOfPartialProps<O> = {} as any;
          const len = keys.length
          for (let i = 0; i < len; i++) {
            const key = keys[i]
            if (allProps.hasOwnProperty(key)) {
              newObject[key] = o[key];
            }
          }
          return t.success(newObject)
        }),
      (loose = t.intersection([t.interface(props), nullablePartial(optionalProps)])).encode
    );

    // [ts] A 'super' call must be the first statement in the constructor when a class contains initialized properties or has parameter properties.
    // tslint:disable-next-line:no-var-keyword
    var loose: t.IntersectionType<
      [
        t.InterfaceType<R, t.TypeOfProps<R>, t.OutputOfProps<R>>,
        t.PartialType<O, TypeOfPartialUndefinedableProps<O>, OutputOfPartialUndefinedableProps<O>>
      ],
      t.TypeOfProps<R> & TypeOfPartialUndefinedableProps<O>,
      t.OutputOfProps<R> & OutputOfPartialUndefinedableProps<O>
      >;

    // tslint:disable-next-line:prefer-const no-var-keyword
    var allProps: R & O & {} = Object.assign({}, props, optionalProps);
  }
}

/** @internal */
export const loiObjectRequired = Symbol('loiObjectRequired')
/** @internal */
export const loiObjectOptional = Symbol('loiObjectOptional')

type Clean<T extends t.Any> = t.Type<T['_A'], T['_O'], T['_I']>
export type LoiFactoryTypeObject<R extends t.Props, O extends t.Props, T extends t.Any> = T & LoiFactoryObject<R, O, T> & LoiFactoryBase<T>
export type LoiFactoryTypeObjectInitial<R extends t.Props, O extends t.Props, T extends t.Any> = T & LoiFactoryObjectInitial<R, O, T> & LoiFactoryObject<R, O, T> & LoiFactoryBase<T>

export class LoiFactoryObject<R extends t.Props, O extends t.Props, T extends t.Any> extends LoiFactory<T> {
  /** @internal */
  [loiObjectRequired]: R

  /** @internal */
  [loiObjectOptional]: O

  /** @internal */
  static decorate<R extends t.Props, O extends t.Props, T extends t.Any>(t: T): LoiFactoryTypeObject<R, O, T> {
    return LoiFactoryBase.decorate(decorate<T, LoiFactoryObject<R, O, t.Type<T['_A'], T['_O'], T['_I']>>>(this, t));
  }

  public type<F>(constructor: { new(...args: any[]): F }) {
    const type = t.refinement(this, (i: any) => i && i.constructor === constructor) as t.Type<this['_A'] & F, this['_O'] & F, this['_I']>
    return metadata(LoiFactoryObject.decorate<R, O, Clean<typeof type>>(type), {
      parent: this,
      option: <ILoiOptionObject>{ name: `type ${constructor.name}`, type: constructor }
    });
  }

  public instanceof<F>(constructor: { new(...args: any[]): F }) {
    const type = t.refinement(this, (i: any) => i instanceof constructor) as t.Type<this['_A'] & F, this['_O'] & F, this['_I']>
    return metadata(LoiFactoryObject.decorate<R, O, Clean<typeof type>>(type), {
      parent: this,
      option: <ILoiOptionObject>{ name: `instanceof ${constructor.name}`, instanceof: constructor }
    });
  }
}

export class LoiFactoryObjectInitial<R extends t.Props, O extends t.Props, T extends t.Any> extends LoiFactory<T> {
  /** @internal */
  [loiObjectRequired]: R

  /** @internal */
  [loiObjectOptional]: O

  /** @internal */
  static decorate<R extends t.Props, O extends t.Props, T extends t.Any>(t: T): LoiFactoryTypeObjectInitial<R, O, T> {
    return LoiFactoryObject.decorate(LoiFactoryBase.decorate(decorate<T, LoiFactoryObjectInitial<R, O, t.Type<T['_A'], T['_O'], T['_I']>>>(this, t)));
  }

  public strict() {
    const type = new LoiTypeObjectStrict(this[loiObjectRequired], this[loiObjectOptional], this.name)
    return metadata(LoiFactoryObject.decorate<R, O, Clean<T>>(type), {
      parent: this,
      option: <ILoiOptionObject>{ name: `strict`, strict: true }
    });
  }

  public violet() {
    const type = new LoiTypeObjectViolet(this[loiObjectRequired], this[loiObjectOptional], this.name)
    return metadata(LoiFactoryObject.decorate<R, O, Clean<T>>(type), {
      parent: this,
      option: <ILoiOptionObject>{ name: `violet`, violet: true }
    });
  }
}

export function object(
  name?: string
): LoiFactoryTypeObjectInitial<
  { },
  { },
  t.Type<
    { },
    { },
    t.mixed
  >
>

export function object<R extends t.Props = {}>(
  required: R,
  name?: string
): LoiFactoryTypeObjectInitial<
  { [K in keyof R]: t.Type<R[K]['_A'], R[K]['_O'], R[K]['_I']> },
  { },
  t.Type<
    { [K in keyof R]: t.TypeOf<R[K]> },
    { [K in keyof R]: t.OutputOf<R[K]> },
    t.mixed
  >
>

export function object<R extends t.Props = {}, O extends t.Props = {}>(
  required: R,
  optional: O,
  name?: string
): LoiFactoryTypeObjectInitial<
  { [K in keyof R]: t.Type<R[K]['_A'], R[K]['_O'], R[K]['_I']> },
  { [K in keyof O]: t.Type<O[K]['_A'], O[K]['_O'], O[K]['_I']> },
  t.Type<
    { [K in keyof R]: t.TypeOf<R[K]> } & { [K in keyof O]?: t.TypeOf<O[K]> },
    { [K in keyof R]: t.OutputOf<R[K]> } & { [K in keyof O]?: t.OutputOf<O[K]> },
    t.mixed
  >
>

export function object(a?: any, b?: any, c?: any) {
  let required, optional, name
  if ((a === null || a === undefined) && (b === null || b === undefined) && (c === null || c === undefined)) {
    required = {}
    optional = {}
    name = getNameFromProps(required, optional)
  } else if ((b === null || b === undefined) && (c === null || c === undefined)) {
    if (isString(a)) {
      required = {}
      optional = {}
      name = a
    } else {
      required = a
      optional = {}
      name = getNameFromProps(required, optional)
    }
  } else if ((c === null || c === undefined)) {
    if (isString(b)) {
      required = a
      optional = {}
      name = b
    } else {
      required = a
      optional = b
      name = getNameFromProps(required, optional)
    }
  } else {
    required = a
    optional = b
    name = c
  }

  const type = new LoiTypeObject(required, optional, name);
  const decorated = metadata(LoiFactoryObjectInitial.decorate(type), {
    tag: name
  });
  decorated[loiObjectRequired] = required;
  decorated[loiObjectOptional] = optional;
  return decorated;
}
