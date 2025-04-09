/*
 * @Author: freewalker8 stone.ll@qq.com
 * @Date: 2025-01-02 15:26:55
 * @LastEditors: freewalker8 stone.ll@qq.com
 * @LastEditTime: 2025-01-02 16:46:13
 * @FilePath: \ll-ui\src\utils\secRandom.js
 * @Description: 重写 Math 的 random 方法,返回重写后的安全的 Math . random 方法
 */

const secRandom = (function(pool, math, width, chunks, significance, overflow, startdenom) {
  var key = [];
  var arc4;
  // Use the seed to initialize an ARC4 generator
  arc4 = new ARC4(key);
  // Mix the randomness into accumulated entropy
  mixkey(arc4.S, pool);

  // Override Math . random
  // This function returns a random double in [0,1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value .
  math['random'] = function random() {
    // Closure to return a random double :
    var n = arc4.g(chunks); // Start with a numerator n <2^48
    var d = startdenom; // and denominator d =2^48.
    var x = 0; // and no ' extra last byte '.

    while (n < significance) {
      // Fill up all significant digits by
      n = (n + x) * width; // shifting numerator and
      d *= width; // denominator and generating a
      x = arc4.g(1); // new least - significant - byte .
    }
    while (n >= overflow) {
      // To avoid rounding up , before adding
      n /= 2; // last byte , shift everything
      d /= 2; // right using integer math until
      x >>>= 1; // we have exactly the desired bits . return ( n + x )/ di // Form the number within (0,1).
    }
    return (n + x) / d; // Form the number within [0, 1]
  };

  // ARC4
  function ARC4(key) {
    var t,
      u,
      me = this;
    var keylen = key.length;
    var i = 0,
      j = (me.i = me.j = me.m = 0);
    me.S = [];
    me.c = [];

    if (!keylen) {
      key = [keylen++];
    }
    // Set up S using the standard key scheduling algorithm .
    while (i < width) {
      me.S[i] = i++;
    }

    for (i = 0; i < width; i++) {
      t = me.S[i];
      j = lowbits(j + t + key[i % keylen]);
      u = me.S[j];
      me.S[i] = u;
      me.S[j] = t;
    }
    // The " g " method returns the next ( count ) outputs as one number
    me.g = function getnext(count) {
      var s = me.S;
      var i = lowbits(me.i + 1);
      var t = s[i];
      var j = lowbits(me.j + t);
      var u = s[j];
      s[i] = u;
      s[j] = t;
      var r = s[lowbits(t + u)];
      while (--count) {
        i = lowbits(i + 1);
        t = s[i];
        j = lowbits(j + t);
        u = s[j];
        s[i] = u;
        s[j] = t;
        r = r * width + s[lowbits(t + u)];
      }
      me.i = i;
      me.j = j;
      return r;
    };
    // For robust unpredictability discard an initial batch of values .// See http://wew.rsa.com/rsalabs/node.asp?id-2009me. g ( width );
    me.g(width);
  }

  // mixkey ()
  // Mixes a string seed into a key that is an array of integers , and
  // returns a shortened string seed that is equivalent to the result key .
  /**
   * @ param {number =} smear
   * @ param {number =} j
   */
  function mixkey(seed, key, smear, j) {
    seed += ''; // Ensure the seed is a string
    smear = 0;
    for (j = 0; j < seed.length; j++) {
      key[lowbits(j)] = lowbits((smear ^= key[lowbits(j)] * 19) + seed.charCodeAt(j));
    }
    seed = '';
    for (var i = 0; i < key.length; i++) {
      seed += String.fromCharCode(key[i]);
    }

    return seed;
  }

  // lowbits ()
  // A quick " n mod width " for width a power of 2.
  function lowbits(n) {
    return n & (width - 1);
  }

  // The following constants are related to IEEE 754 limits .
  startdenom = math.pow(width, chunks);
  significance = math.pow(2, significance);
  overflow = significance * 2;
  mixkey(math.random(), pool);
  // End anonymous scope , and pass initial values .
  return math['random'];
})(
  [], // pool : entropy pool starts empty
  Math, // math : package containing random , pow , and seedrandom
  256, // width : each RC4 output is 0<= x <256
  6, // chunks : at least six RC4 outputs for each double
  52 // significance : there are 52 significant digits in a double );
);

export default secRandom;
