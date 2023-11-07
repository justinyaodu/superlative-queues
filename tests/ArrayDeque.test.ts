import { describe, expect, test } from "@jest/globals";

import { ArrayDeque as _ArrayDeque } from "../src/ArrayDeque.js";

interface ArrayDequeLike<T> {
  size: number;
  _head: number;
  _buffer: (T | undefined)[];
}

function make<T>({ size, _head, _buffer }: ArrayDequeLike<T>): ArrayDeque<T> {
  const deque = new ArrayDeque<T>();
  (deque as { size: number }).size = size;
  deque._head = _head;
  deque._buffer = _buffer;
  return deque;
}

class ArrayDeque<T> extends _ArrayDeque<T> {
  override _wrapRight(offset: number): number {
    expect(offset).toBeGreaterThanOrEqual(0);
    expect(offset).toBeLessThanOrEqual(this._buffer.length);
    return super._wrapRight(offset);
  }

  override _tail(): number {
    expect(this.size).toBeGreaterThan(0);
    return super._tail();
  }

  assert(expected: ArrayDequeLike<T>): void {
    expect(this).toEqual(expected);
  }

  override first(): T | undefined {
    const value = super.first();
    expect(value).toStrictEqual(this.at(0));
    return value;
  }

  override last(): T | undefined {
    const value = super.last();
    expect(value).toStrictEqual(this.at(-1));
    return value;
  }
}

function empty(n: number): undefined[] {
  return new Array<undefined>(n);
}

describe("_ensureCapacity", () => {
  test("empty", () => {
    const deque = new ArrayDeque();

    deque._ensureCapacity(0);
    deque.assert(new ArrayDeque());

    deque._ensureCapacity(1);
    deque.assert(new ArrayDeque());

    deque._ensureCapacity(2);
    expect(deque).toEqual({
      size: 0,
      _head: 0,
      _buffer: [undefined, undefined],
    });

    deque._ensureCapacity(3);
    deque.assert(
      make({
        size: 0,
        _head: 0,
        _buffer: empty(4),
      }),
    );
  });

  test("not full, not wrapped", () => {
    const deque = make({
      size: 3,
      _head: 1,
      _buffer: [undefined, 10, 20, 30],
    });

    deque._ensureCapacity(5);
    deque.assert({
      size: 3,
      _head: 1,
      _buffer: [undefined, 10, 20, 30, ...empty(4)],
    });
  });

  test("not full, wrapped", () => {
    const deque = make({
      size: 3,
      _head: 3,
      _buffer: [30, 40, undefined, 10],
    });

    deque._ensureCapacity(5);
    deque.assert({
      size: 3,
      _head: 7,
      _buffer: [30, 40, ...empty(5), 10],
    });
  });

  test("full, not wrapped", () => {
    const deque = make({
      size: 4,
      _head: 0,
      _buffer: [10, 20, 30, 40],
    });

    deque._ensureCapacity(5);
    deque.assert({
      size: 4,
      _head: 0,
      _buffer: [10, 20, 30, 40, ...empty(4)],
    });
  });

  test("full, wrapped", () => {
    const deque = make({
      size: 4,
      _head: 2,
      _buffer: [30, 40, 10, 20],
    });

    deque._ensureCapacity(5);
    deque.assert({
      size: 4,
      _head: 6,
      _buffer: [30, 40, ...empty(4), 10, 20],
    });
  });
});

describe("addFirst", () => {
  test("empty", () => {
    const deque = new ArrayDeque();

    deque.addFirst(10);
    deque.assert({
      size: 1,
      _head: 0,
      _buffer: [10],
    });
  });

  test("not full, start of buffer", () => {
    const deque = make({
      size: 3,
      _head: 1,
      _buffer: [undefined, 20, 30, 40],
    });

    deque.addFirst(10);
    deque.assert({
      size: 4,
      _head: 0,
      _buffer: [10, 20, 30, 40],
    });
  });

  test("not full, middle of buffer", () => {
    const deque = make({
      size: 2,
      _head: 2,
      _buffer: [undefined, undefined, 20, 30],
    });

    deque.addFirst(10);
    deque.assert({
      size: 3,
      _head: 1,
      _buffer: [undefined, 10, 20, 30],
    });
  });

  test("not full, end of buffer", () => {
    const deque = make({
      size: 2,
      _head: 0,
      _buffer: [20, 30, undefined, undefined],
    });

    deque.addFirst(10);
    deque.assert({
      size: 3,
      _head: 3,
      _buffer: [20, 30, undefined, 10],
    });
  });

  test("full, not wrapped", () => {
    const deque = make({
      size: 2,
      _head: 0,
      _buffer: [20, 30],
    });

    deque.addFirst(10);
    deque.assert({
      size: 3,
      _head: 3,
      _buffer: [20, 30, undefined, 10],
    });
  });

  test("full, wrapped", () => {
    const deque = make({
      size: 4,
      _head: 2,
      _buffer: [40, 50, 20, 30],
    });

    deque.addFirst(10);
    deque.assert({
      size: 5,
      _head: 5,
      _buffer: [40, 50, ...empty(3), 10, 20, 30],
    });
  });
});

describe("enqueue", () => {
  test("empty", () => {
    const deque = new ArrayDeque();

    deque.enqueue(10);
    deque.assert({
      size: 1,
      _head: 0,
      _buffer: [10],
    });
  });

  test("not full, start of buffer", () => {
    const deque = make({
      size: 3,
      _head: 1,
      _buffer: [undefined, 10, 20, 30],
    });

    deque.enqueue(40);
    deque.assert({
      size: 4,
      _head: 1,
      _buffer: [40, 10, 20, 30],
    });
  });

  test("not full, middle of buffer", () => {
    const deque = make({
      size: 2,
      _head: 3,
      _buffer: [20, undefined, undefined, 10],
    });

    deque.enqueue(30);
    deque.assert({
      size: 3,
      _head: 3,
      _buffer: [20, 30, undefined, 10],
    });
  });

  test("not full, end of buffer", () => {
    const deque = make({
      size: 2,
      _head: 1,
      _buffer: [undefined, 10, 20, undefined],
    });

    deque.enqueue(30);
    deque.assert({
      size: 3,
      _head: 1,
      _buffer: [undefined, 10, 20, 30],
    });
  });

  test("full, not wrapped", () => {
    const deque = make({
      size: 2,
      _head: 0,
      _buffer: [10, 20],
    });

    deque.enqueue(30);
    deque.assert({
      size: 3,
      _head: 0,
      _buffer: [10, 20, 30, undefined],
    });
  });

  test("full, wrapped", () => {
    const deque = make({
      size: 2,
      _head: 1,
      _buffer: [20, 10],
    });

    deque.enqueue(30);
    deque.assert({
      size: 3,
      _head: 3,
      _buffer: [20, 30, undefined, 10],
    });
  });
});

describe("dequeue", () => {
  test("empty", () => {
    const deque = new ArrayDeque();

    expect(deque.dequeue()).toStrictEqual(undefined);
    deque.assert(new ArrayDeque());
  });

  test("start of buffer", () => {
    const deque = make({
      size: 4,
      _head: 0,
      _buffer: [10, 20, 30, 40],
    });

    expect(deque.dequeue()).toStrictEqual(10);
    deque.assert({
      size: 3,
      _head: 1,
      _buffer: [undefined, 20, 30, 40],
    });
  });

  test("middle of buffer", () => {
    const deque = make({
      size: 4,
      _head: 1,
      _buffer: [40, 10, 20, 30],
    });

    expect(deque.dequeue()).toStrictEqual(10);
    deque.assert({
      size: 3,
      _head: 2,
      _buffer: [40, undefined, 20, 30],
    });
  });

  test("end of buffer", () => {
    const deque = make({
      size: 3,
      _head: 3,
      _buffer: [20, 30, undefined, 10],
    });

    expect(deque.dequeue()).toStrictEqual(10);
    deque.assert({
      size: 2,
      _head: 0,
      _buffer: [20, 30, undefined, undefined],
    });
  });
});

describe("removeLast", () => {
  test("empty", () => {
    const deque = new ArrayDeque();

    expect(deque.removeLast()).toStrictEqual(undefined);
    deque.assert(new ArrayDeque());
  });

  test("start of buffer", () => {
    const deque = make({
      size: 3,
      _head: 2,
      _buffer: [30, undefined, 10, 20],
    });

    expect(deque.removeLast()).toStrictEqual(30);
    deque.assert({
      size: 2,
      _head: 2,
      _buffer: [undefined, undefined, 10, 20],
    });
  });

  test("middle of buffer", () => {
    const deque = make({
      size: 3,
      _head: 0,
      _buffer: [10, 20, 30, undefined],
    });

    expect(deque.removeLast()).toStrictEqual(30);
    deque.assert({
      size: 2,
      _head: 0,
      _buffer: [10, 20, undefined, undefined],
    });
  });

  test("end of buffer", () => {
    const deque = make({
      size: 2,
      _head: 0,
      _buffer: [10, 20],
    });

    expect(deque.removeLast()).toStrictEqual(20);
    deque.assert({
      size: 1,
      _head: 0,
      _buffer: [10, undefined],
    });
  });
});

describe("at, first, last, iterator", () => {
  test("empty", () => {
    const deque = new ArrayDeque();

    expect(deque.first()).toStrictEqual(undefined);
    expect(deque.at(1)).toStrictEqual(undefined);
    expect(deque.last()).toStrictEqual(undefined);
    expect(deque.at(-2)).toStrictEqual(undefined);
    expect(Array.from(deque)).toStrictEqual([]);

    const iterator = deque[Symbol.iterator]();
    expect(iterator).toBe(iterator[Symbol.iterator]());
  });

  test("not full, not wrapped", () => {
    const deque = make({
      size: 3,
      _head: 1,
      _buffer: [undefined, 10, 20, 30],
    });

    expect(deque.first()).toStrictEqual(10);
    expect(deque.at(1)).toStrictEqual(20);
    expect(deque.at(2)).toStrictEqual(30);
    expect(deque.at(3)).toStrictEqual(undefined);
    expect(deque.last()).toStrictEqual(30);
    expect(deque.at(-2)).toStrictEqual(20);
    expect(deque.at(-3)).toStrictEqual(10);
    expect(deque.at(-4)).toStrictEqual(undefined);
    expect(Array.from(deque)).toStrictEqual([10, 20, 30]);
  });

  test("not full, wrapped", () => {
    const deque = make({
      size: 3,
      _head: 3,
      _buffer: [20, 30, undefined, 10],
    });

    expect(deque.first()).toStrictEqual(10);
    expect(deque.at(1)).toStrictEqual(20);
    expect(deque.at(2)).toStrictEqual(30);
    expect(deque.at(3)).toStrictEqual(undefined);
    expect(deque.last()).toStrictEqual(30);
    expect(deque.at(-2)).toStrictEqual(20);
    expect(deque.at(-3)).toStrictEqual(10);
    expect(deque.at(-4)).toStrictEqual(undefined);
    expect(Array.from(deque)).toStrictEqual([10, 20, 30]);
  });

  test("full, not wrapped", () => {
    const deque = make({
      size: 4,
      _head: 0,
      _buffer: [10, 20, 30, 40],
    });

    expect(deque.first()).toStrictEqual(10);
    expect(deque.at(1)).toStrictEqual(20);
    expect(deque.at(2)).toStrictEqual(30);
    expect(deque.at(3)).toStrictEqual(40);
    expect(deque.at(4)).toStrictEqual(undefined);
    expect(deque.last()).toStrictEqual(40);
    expect(deque.at(-2)).toStrictEqual(30);
    expect(deque.at(-3)).toStrictEqual(20);
    expect(deque.at(-4)).toStrictEqual(10);
    expect(deque.at(-5)).toStrictEqual(undefined);
    expect(Array.from(deque)).toStrictEqual([10, 20, 30, 40]);
  });

  test("full, wrapped", () => {
    const deque = make({
      size: 4,
      _head: 2,
      _buffer: [30, 40, 10, 20],
    });

    expect(deque.first()).toStrictEqual(10);
    expect(deque.at(1)).toStrictEqual(20);
    expect(deque.at(2)).toStrictEqual(30);
    expect(deque.at(3)).toStrictEqual(40);
    expect(deque.at(4)).toStrictEqual(undefined);
    expect(deque.last()).toStrictEqual(40);
    expect(deque.at(-2)).toStrictEqual(30);
    expect(deque.at(-3)).toStrictEqual(20);
    expect(deque.at(-4)).toStrictEqual(10);
    expect(deque.at(-5)).toStrictEqual(undefined);
    expect(Array.from(deque)).toStrictEqual([10, 20, 30, 40]);
  });
});