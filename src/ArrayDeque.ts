class ArrayDeque2<T> {
  _head: number;
  _tail: number;
  _buffer: (T | undefined)[];
  _indexMask: number;

  constructor() {
    this._head = 0;
    this._tail = 0;
    this._buffer = new Array<T | undefined>(16);
    this._indexMask = 15;
  }

  size(): number {
    return (this._tail - this._head) & this._indexMask;
  }

  _grow(): void {
    if (this._head === 0) {
      this._buffer.length <<= 1;
    } else {
      /*
      const newBuffer = new Array<T | undefined>(this._buffer.length << 1);
      for (let i = 0; i < this._buffer.length; i++) {
        newBuffer[i] = this._buffer[(this._head + i) & this._indexMask];
      }
      this._head = 0;
      this._tail = this._buffer.length;
      this._buffer = newBuffer;
      */
      this._head = 0;
      this._tail = this._buffer.length;
      this._buffer = this._buffer
        .slice(this._head)
        .concat(
          this._buffer.slice(0, this._head),
          new Array<undefined>(this._buffer.length),
        );
    }
    this._indexMask = this._buffer.length - 1;
  }

  addFirst(value: T): void {
    this._head = (this._head - 1) & this._indexMask;
    this._buffer[this._head] = value;
    if (this._head === this._tail) {
      this._grow();
    }
  }

  addLast(value: T): void {
    this._buffer[this._tail] = value;
    this._tail = (this._tail + 1) & this._indexMask;
    if (this._head === this._tail) {
      this._grow();
    }
  }

  removeFirst(): T | undefined {
    if (this._head === this._tail) {
      return undefined;
    }

    const value = this._buffer[this._head];
    this._buffer[this._head] = undefined;
    this._head = (this._head + 1) & this._indexMask;
    return value;
  }

  removeLast(): T | undefined {
    if (this._head === this._tail) {
      return undefined;
    }

    this._tail = (this._tail - 1) & this._indexMask;
    const value = this._buffer[this._tail];
    this._buffer[this._tail] = undefined;
    return value;
  }

  enqueue(value: T): void {
    this.addLast(value);
  }

  dequeue(): T | undefined {
    return this.removeFirst();
  }
}

/**
 * A double-ended queue backed by an array.
 *
 * ArrayDeques support amortized constant-time insertion and removal at both
 * ends, and constant-time access to elements by index. Iterating over an
 * ArrayDeque returns elements sequentially from the head to the tail.
 *
 * @public
 */
class ArrayDeque<T> {
  /**
   * The number of elements in the ArrayDeque.
   */
  readonly size: number;

  /**
   * The index of the head.
   *
   * @internal
   */
  _head: number;

  /**
   * Circular buffer containing the elements.
   *
   * @internal
   */
  _buffer: (T | undefined)[];

  _indexMask: number;

  /**
   * Constructs an empty ArrayDeque.
   */
  constructor() {
    this.size = 0;
    this._head = 0;
    this._buffer = new Array<T | undefined>(16);
    this._indexMask = 15;
  }

  /**
   * Ensures that the buffer has space for the specified number of elements.
   *
   * @internal
   */
  _ensureCapacity(capacity: number): void {
    if (capacity <= this._buffer.length) {
      return;
    }

    let pow2Capacity = this._buffer.length;
    do {
      pow2Capacity *= 2;
    } while (pow2Capacity < capacity);

    this._resizeTo(pow2Capacity);
  }

  _resizeTo(pow2Capacity: number): void {
    if (this._head + this.size <= this._buffer.length) {
      this._buffer.length = pow2Capacity;
    } else {
      /*
      const newBuffer = new Array<T | undefined>(pow2Capacity);
      for (let i = 0; i < this.size; i++) {
        newBuffer[i] = this._buffer[(this._head + i) & this._indexMask];
      }
      this._buffer = newBuffer;
      this._head = 0;
      */
      /*
      this._buffer = this._buffer
        .slice(this._head)
        .concat(this._buffer.slice(0, this._head), new Array<undefined>(this._buffer.length));
      this._head = 0;
      */
      const newBuffer = new Array<T | undefined>(pow2Capacity);
      let dest = 0;
      let src = this._head;

      do {
        newBuffer[dest++] = this._buffer[src++];
      } while (src < this._buffer.length);

      src = 0;
      do {
        newBuffer[dest++] = this._buffer[src++];
      } while (dest < this._buffer.length);

      this._buffer = newBuffer;
      this._head = 0;
    }

    this._indexMask = this._buffer.length - 1;
  }

  /**
   * Inserts a new element at the head.
   */
  addFirst(value: T): void {
    if (this.size === this._buffer.length) {
      this._resizeTo(this._buffer.length << 1);
    }

    const newHead = (this._head - 1) & this._indexMask;
    this._buffer[newHead] = value;
    this._head = newHead;

    (this as { size: number }).size++;
  }

  /**
   * Inserts a new element at the tail. Equivalent to
   * {@link ArrayDeque.enqueue}.
   */
  addLast(value: T): void {
    if (this.size === this._buffer.length) {
      this._resizeTo(this._buffer.length << 1);
    }

    const newTail = (this._head + this.size) & this._indexMask;
    this._buffer[newTail] = value;

    (this as { size: number }).size++;
  }

  /**
   * Returns the element at the head. Equivalent to {@link ArrayDeque.at}(0).
   *
   * @returns The element at the head, or undefined if the ArrayDeque is empty.
   */
  first(): T | undefined {
    return this._buffer[this._head];
  }

  /**
   * Removes and returns the element at the head. Equivalent to
   * {@link ArrayDeque.dequeue}.
   *
   * @returns The element removed from the head, or undefined if the ArrayDeque
   * is empty.
   */
  removeFirst(): T | undefined {
    // I tried using `this.size -= Math.sign(this.size)` to omit this branch,
    // but that implementation was slower.
    if (this.size === 0) {
      return undefined;
    }

    const value = this._buffer[this._head];
    this._buffer[this._head] = undefined;

    this._head = (this._head + 1) & this._indexMask;
    (this as { size: number }).size--;

    return value;
  }

  /**
   * Returns the element at the tail. Equivalent to {@link ArrayDeque.at}(-1).
   *
   * @returns The element at the tail, or undefined if the ArrayDeque is empty.
   */
  last(): T | undefined {
    const tail = (this._head + this.size - 1) & this._indexMask;
    return this._buffer[tail];
  }

  /**
   * Removes and returns the element at the tail.
   *
   * @returns The element removed from the tail, or undefined if the
   * ArrayDeque is empty.
   */
  removeLast(): T | undefined {
    if (this.size === 0) {
      return undefined;
    }

    const tail = (this._head + this.size - 1) & this._indexMask;
    const value = this._buffer[tail];
    this._buffer[tail] = undefined;

    (this as { size: number }).size--;

    return value;
  }

  /**
   * Returns the element at the specified index, where 0 is the head and higher
   * indices move toward the tail.
   *
   * For negative indices, -1 is the tail and lower indices move toward the
   * head, like [Array.at](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at).
   *
   * @returns The element at the specified index, or undefined if the index is
   * out of range.
   */
  at(index: number): T | undefined {
    if (index < -this.size || index >= this.size) {
      return undefined;
    }

    if (index < 0) {
      index += this.size;
    }

    return this._buffer[(this._head + index) & this._indexMask];
  }

  /**
   * Inserts a new element at the tail. Equivalent to {@link ArrayDeque.addLast}.
   */
  enqueue(value: T): void {
    this.addLast(value);
  }

  /**
   * Removes and returns the element at the head. Equivalent to
   * {@link ArrayDeque.removeFirst}.
   *
   * @returns The element removed from the head, or undefined if the ArrayDeque
   * is empty.
   */
  dequeue(): T | undefined {
    return this.removeFirst();
  }

  /**
   * Returns an iterator that returns elements sequentially, from the head to
   * the tail.
   *
   * The ArrayDeque must not be modified while the iterator is in use.
   * Otherwise, the behavior of the iterator is not defined.
   */
  [Symbol.iterator](): IterableIterator<T> {
    return new ArrayDequeIterator(this);
  }

  /**
   * Returns a shallow copy of this ArrayDeque.
   */
  clone(): ArrayDeque<T> {
    const clone = new ArrayDeque<T>();
    (clone as { size: number }).size = this.size;
    clone._head = this._head;
    clone._buffer = this._buffer.slice();
    clone._indexMask = this._indexMask;
    return clone;
  }

  /**
   * Returns an array containing the elements in this ArrayDeque, from the head
   * to the tail.
   */
  toArray(): T[] {
    // This could probably be optimized for better performance.
    return Array.from(this);
  }

  /**
   * Equivalent to {@link ArrayDeque.toArray}.
   */
  toJSON(): T[] {
    return this.toArray();
  }
}

class ArrayDequeIterator<T> implements IterableIterator<T> {
  _index: number;

  constructor(public _arrayDeque: ArrayDeque<T>) {
    this._index = 0;
  }

  next(): IteratorResult<T> {
    if (this._index >= this._arrayDeque.size) {
      return { done: true, value: undefined };
    }

    return {
      done: false,
      value: this._arrayDeque.at(this._index++)!,
    };
  }

  [Symbol.iterator]() {
    return this;
  }
}

export { ArrayDeque, ArrayDeque2 };
