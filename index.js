/*
 * The calculation logic refers from : https://github.com/bitpay/bloom-filter/blob/master/lib/filter.js
 * @param {Number} elementNum - the number of target element items.
 * @param {Number} falsePositiveRate - false positive rate defined.
 */
const MAX_BLOOM_FILTER_SIZE = 100 * 1024 * 1024; // bytes
const MAX_HASH_FUNCS = 50;
const MIN_HASH_FUNCS = 1;
const LN2SQUARED = Math.pow(Math.log(2), 2); // 0.4804530139182014246671025263266649717305529515945455
const LN2 = Math.log(2); // 0.6931471805599453094172321214581765680755001343602552

class BloomFilter extends require('bloomfilter').BloomFilter {
  constructor(...args) {
    super(...args);
  }

  toBuffer() {
    return Buffer.from(this.buckets.buffer);
  }

  serialize() {
    const buffer = this.toBuffer();

    const serialized = Buffer.alloc(buffer.length + 1);
    serialized.writeUInt8(this.k);
    buffer.copy(serialized, 1, 0);

    return serialized;
  }

  static fromBuffer(buffer, numHash) {
    if (!numHash) {
      throw new Error('From buffer need numHash param.');
    }

    const bytes = new Uint8Array(buffer);
    const buckets = new Int32Array(bytes.buffer);
    return new BloomFilter(buckets, numHash);
  }

  static deserialize(buffer) {
    const numHash = buffer.readUInt8();
    return BloomFilter.fromBuffer(buffer.slice(1), numHash);
  }

  static bestFor(elementNum, falsePositiveRate, maxBytes = MAX_BLOOM_FILTER_SIZE) {
    let bitSize = -1.0 / LN2SQUARED * elementNum * Math.log(falsePositiveRate);
    bitSize = Math.min(maxBytes * 8, bitSize);

    // The ideal number of hash functions is:
    // filter size * ln(2) / number of elements
    // See: https://github.com/bitcoin/bitcoin/blob/master/src/bloom.cpp
    let nHashFuncs = Math.floor(bitSize / elementNum * LN2);
    if (nHashFuncs > MAX_HASH_FUNCS) {
      nHashFuncs = MAX_HASH_FUNCS;
    }
    if (nHashFuncs < MIN_HASH_FUNCS) {
      nHashFuncs = MIN_HASH_FUNCS;
    }

    return new BloomFilter(bitSize, nHashFuncs);
  }
}

module.exports = BloomFilter;