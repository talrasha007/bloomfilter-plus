const BloomFilter = require('../');

function testBloom(bf) {
  // Test if an item is in our filter.
  // Returns true if an item is probably in the set,
  // or false if an item is definitely not in the set.
  console.log('BF test foo:', bf.test('foo'));
  console.log('BF test bar:', bf.test('bar'));
  console.log('BF test blah:', bf.test('blah'));
  console.log();
}

/* Just the same as the bloomfilter lib. */
const bloom = new BloomFilter(
  32 * 256, // number of bits to allocate.
  3         // number of hash functions.
);

// Add some elements to the filter.
bloom.add('foo');
bloom.add('bar');

console.log('Test bloom.');
testBloom(bloom);

// Int32Array
const array = bloom.buckets;

// Deserialisation. Note that the any array-like object is supported, but
// this will be used directly, so you may wish to use a typed array for
// performance.
const bloomFromArr = new BloomFilter(array, 3);
console.log('Test bloomFromArr.');
testBloom(bloomFromArr);

// Convert bloom buckets to buffer.
const bytes = bloom.toBuffer();
// Rebuild bloom from buffer.
const bloomFromBytes = BloomFilter.fromBuffer(bytes, 3);
console.log('Test bloomFromBytes.');
testBloom(bloomFromBytes);

// Serialize bloom to a buffer with numHash desc.
const serialized = bloom.serialize();
// Deserialize bloom from serialized.
const bloomDeserialized = BloomFilter.deserialize(serialized);
console.log('Test bloomDeserialized.');
testBloom(bloomDeserialized);

// Create a best bloom filter for numElem & falsePositiveRate
const bestBf = BloomFilter.bestFor(1000, 0.01);
bestBf.add('foo');
bestBf.add('bar');
console.log('Test bestBf.');
testBloom(bestBf);
