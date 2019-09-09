<script>
export default {
  name: "MatrixMath",
  data() {
    return {
      sizes: {
        vec2: new Float32Array(this.flatten(this.vec2())).byteLength,
        vec3: new Float32Array(this.flatten(this.vec3())).byteLength,
        vec4: new Float32Array(this.flatten(this.vec4())).byteLength,
        mat2: new Float32Array(this.flatten(this.mat2())).byteLength,
        mat3: new Float32Array(this.flatten(this.mat3())).byteLength,
        mat4: new Float32Array(this.flatten(this.mat4())).byteLength
      }
    };
  },

  methods: {
    //  Vector Constructors
    vec2() {
      var result = this._argumentsToArray(arguments);
      switch (result.length) {
        case 0:
          result.push(0.0);
        //fallsthrough
        case 1:
          result.push(0.0);
      }
      return result.splice(0, 2);
    },

    vec3() {
      var result = this._argumentsToArray(arguments);
      switch (result.length) {
        case 0:
          result.push(0.0);
        //fallsthrough
        case 1:
          result.push(0.0);
        //fallsthrough
        case 2:
          result.push(0.0);
      }
      return result.splice(0, 3);
    },

    vec4() {
      var result = this._argumentsToArray(arguments);
      switch (result.length) {
        case 0:
          result.push(0.0);
        //fallsthrough
        case 1:
          result.push(0.0);
        //fallsthrough
        case 2:
          result.push(0.0);
        //fallsthrough
        case 3:
          result.push(1.0);
      }
      return result.splice(0, 4);
    },

    //  Matrix Constructors
    mat2() {
      var v = this._argumentsToArray(arguments);
      var m = [];
      switch (v.length) {
        case 0:
          v[0] = 1;
        //fallsthrough
        case 1:
          m = [this.vec2(v[0], 0.0), this.vec2(0.0, v[0])];
          break;
        default:
          m.push(this.vec2(v));
          v.splice(0, 2);
          m.push(this.vec2(v));
          break;
      }
      m.matrix = true;
      return m;
    },

    mat3() {
      var v = this._argumentsToArray(arguments);
      var m = [];
      switch (v.length) {
        case 0:
          v[0] = 1;
        //fallsthrough
        case 1:
          m = [
            this.vec3(v[0], 0.0, 0.0),
            this.vec3(0.0, v[0], 0.0),
            this.vec3(0.0, 0.0, v[0])
          ];
          break;
        default:
          m.push(this.vec3(v));
          v.splice(0, 3);
          m.push(this.vec3(v));
          v.splice(0, 3);
          m.push(this.vec3(v));
          break;
      }
      m.matrix = true;
      return m;
    },

    mat4() {
      var v = this._argumentsToArray(arguments);
      var m = [];
      switch (v.length) {
        case 0:
          v[0] = 1;
        //fallsthrough
        case 1:
          m = [
            this.vec4(v[0], 0.0, 0.0, 0.0),
            this.vec4(0.0, v[0], 0.0, 0.0),
            this.vec4(0.0, 0.0, v[0], 0.0),
            this.vec4(0.0, 0.0, 0.0, v[0])
          ];
          break;
        //fallsthrough
        default:
          m.push(this.vec4(v));
          v.splice(0, 4);
          m.push(this.vec4(v));
          v.splice(0, 4);
          m.push(this.vec4(v));
          v.splice(0, 4);
          m.push(this.vec4(v));
          break;
      }
      m.matrix = true;
      return m;
    },

    //  Generic Mathematical Operations for Vectors and Matrices
    equal(u, v) {
      if (u.length != v.length) {
        return false;
      }

      if (u.matrix && v.matrix) {
        for (let i = 0; i < u.length; ++i) {
          if (u[i].length != v[i].length) {
            return false;
          }

          for (var j = 0; j < u[i].length; ++j) {
            if (u[i][j] !== v[i][j]) {
              return false;
            }
          }
        }
      } else if ((u.matrix && !v.matrix) || (!u.matrix && v.matrix)) {
        return false;
      } else {
        for (let i = 0; i < u.length; ++i) {
          if (u[i] !== v[i]) {
            return false;
          }
        }
      }

      return true;
    },

    add(u, v) {
      var result = [];

      if (u.matrix && v.matrix) {
        if (u.length != v.length) {
          throw "add(): trying to add matrices of different dimensions";
        }

        for (let i = 0; i < u.length; ++i) {
          if (u[i].length != v[i].length) {
            throw "add(): trying to add matrices of different dimensions";
          }
          result.push([]);

          for (var j = 0; j < u[i].length; ++j) {
            result[i].push(u[i][j] + v[i][j]);
          }
        }
        result.matrix = true;

        return result;
      } else if ((u.matrix && !v.matrix) || (!u.matrix && v.matrix)) {
        throw "add(): trying to add matrix and non-matrix variables";
      } else {
        if (u.length != v.length) {
          throw "add(): vectors are not the same dimension";
        }

        for (let i = 0; i < u.length; ++i) {
          result.push(u[i] + v[i]);
        }
        return result;
      }
    },

    subtract(u, v) {
      var result = [];
      if (u.matrix && v.matrix) {
        if (u.length != v.length) {
          throw "subtract(): trying to subtract matrices" +
            " of different dimensions";
        }

        for (let i = 0; i < u.length; ++i) {
          if (u[i].length != v[i].length) {
            throw "subtract(): trying to subtact matrices" +
              " of different dimensions";
          }
          result.push([]);

          for (var j = 0; j < u[i].length; ++j) {
            result[i].push(u[i][j] - v[i][j]);
          }
        }
        result.matrix = true;

        return result;
      } else if ((u.matrix && !v.matrix) || (!u.matrix && v.matrix)) {
        throw "subtact(): trying to subtact  matrix and non-matrix variables";
      } else {
        if (u.length != v.length) {
          throw "subtract(): vectors are not the same length";
        }

        for (let i = 0; i < u.length; ++i) {
          result.push(u[i] - v[i]);
        }

        return result;
      }
    },
    mult(u, v) {
      var result = [];

      if (u.matrix && v.matrix) {
        if (u.length != v.length) {
          throw "mult(): trying to add matrices of different dimensions";
        }

        for (let i = 0; i < u.length; ++i) {
          if (u[i].length != v[i].length) {
            throw "mult(): trying to add matrices of different dimensions";
          }
        }

        for (let i = 0; i < u.length; ++i) {
          result.push([]);

          for (var j = 0; j < v.length; ++j) {
            var sum = 0.0;
            for (var k = 0; k < u.length; ++k) {
              sum += u[i][k] * v[k][j];
            }
            result[i].push(sum);
          }
        }

        result.matrix = true;

        return result;
      } else {
        if (u.length != v.length) {
          throw "mult(): vectors are not the same dimension";
        }

        for (let i = 0; i < u.length; ++i) {
          result.push(u[i] * v[i]);
        }

        return result;
      }
    },

    //  Basic Transformation Matrix Generators
    translationMatrix(x, y, z) {
      if (Array.isArray(x) && x.length == 3) {
        z = x[2];
        y = x[1];
        x = x[0];
      }
      var result = this.mat4();
      result[0][3] = x;
      result[1][3] = y;
      result[2][3] = z;
      return result;
    },

    rotationMatrix(angle, axis) {
      if (!Array.isArray(axis)) {
        axis = [arguments[1], arguments[2], arguments[3]];
      }

      var v = this.normalize(axis);

      var x = v[0];
      var y = v[1];
      var z = v[2];

      var c = Math.cos(this.radians(angle));
      var omc = 1.0 - c;
      var s = Math.sin(this.radians(angle));

      var result = this.mat4(
        this.vec4(
          x * x * omc + c,
          x * y * omc - z * s,
          x * z * omc + y * s,
          0.0
        ),
        this.vec4(
          x * y * omc + z * s,
          y * y * omc + c,
          y * z * omc - x * s,
          0.0
        ),
        this.vec4(
          x * z * omc - y * s,
          y * z * omc + x * s,
          z * z * omc + c,
          0.0
        ),
        this.vec4()
      );

      return result;
    },

    scalarMatrix() {
      var xyz = this._argumentsToArray(arguments);
      while (xyz.length < 3) {
        xyz.push(xyz[0]);
      }

      var result = this.mat4();
      result[0][0] = xyz[0];
      result[1][1] = xyz[1];
      result[2][2] = xyz[2];

      return result;
    },

    rotationMatrix2d(thetaInDegrees) {
      var m = this.mat2();
      var theta = this.radians(thetaInDegrees);
      m[0][0] = Math.cos(theta);
      m[0][1] = Math.sin(theta);
      m[1][0] = -m[0][1];
      m[1][1] = m[0][0];
      return m;
    },

    //  ModelView Matrix Generators
    lookAt(eye, at, up) {
      if (!Array.isArray(eye) || eye.length != 3) {
        throw "lookAt(): first parameter [eye] must be an a vec3";
      }
      if (!Array.isArray(at) || at.length != 3) {
        throw "lookAt(): first parameter [at] must be an a vec3";
      }
      if (!Array.isArray(up) || up.length != 3) {
        throw "lookAt(): first parameter [up] must be an a vec3";
      }
      if (this.equal(eye, at)) {
        return this.mat4();
      }

      var v = this.normalize(this.subtract(at, eye)); // view direction vector
      var n = this.normalize(this.cross(v, up)); // perpendicular vector
      var u = this.normalize(this.cross(n, v)); // "new" up vector

      v = this.negate(v);

      var result = this.mat4(
        this.vec4(n, -this.dot(n, eye)),
        this.vec4(u, -this.dot(u, eye)),
        this.vec4(v, -this.dot(v, eye)),
        this.vec4()
      );

      return result;
    },

    //  Projection Matrix Generators
    ortho(left, right, bottom, top, near, far) {
      if (left == right) {
        throw "ortho(): left and right are equal";
      }
      if (bottom == top) {
        throw "ortho(): bottom and top are equal";
      }
      if (near == far) {
        throw "ortho(): near and far are equal";
      }

      var w = right - left;
      var h = top - bottom;
      var d = far - near;

      var result = this.mat4();
      result[0][0] = 2.0 / w;
      result[1][1] = 2.0 / h;
      result[2][2] = -2.0 / d;
      result[0][3] = -(left + right) / w;
      result[1][3] = -(top + bottom) / h;
      result[2][3] = -(near + far) / d;

      return result;
    },
    perspective(fovy, aspect, near, far) {
      var f = 1.0 / Math.tan(this.radians(fovy) / 2);
      var d = far - near;

      var result = this.mat4();
      result[0][0] = f / aspect;
      result[1][1] = f;
      result[2][2] = -(near + far) / d;
      result[2][3] = (-2 * near * far) / d;
      result[3][2] = -1;
      result[3][3] = 0.0;

      return result;
    },

    //  Matrix Functions
    transpose(m) {
      if (!m.matrix) {
        return "transpose(): trying to transpose a non-matrix";
      }
      var result = [];
      for (let i = 0; i < m.length; ++i) {
        result.push([]);
        for (var j = 0; j < m[i].length; ++j) {
          result[i].push(m[j][i]);
        }
      }
      result.matrix = true;
      return result;
    },

    //  Vector Functions
    dot(u, v) {
      if (u.length != v.length) {
        throw "dot(): vectors are not the same dimension";
      }
      var sum = 0.0;
      for (let i = 0; i < u.length; ++i) {
        sum += u[i] * v[i];
      }
      return sum;
    },

    negate(u) {
      var result = [];
      for (let i = 0; i < u.length; ++i) {
        result.push(-u[i]);
      }
      return result;
    },

    cross(u, v) {
      if (!Array.isArray(u) || u.length < 3) {
        throw "cross(): first argument is not a vector of at least 3";
      }
      if (!Array.isArray(v) || v.length < 3) {
        throw "cross(): second argument is not a vector of at least 3";
      }
      var result = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
      ];
      return result;
    },

    length1(u) {
      return Math.sqrt(this.dot(u, u));
    },

    normalize(u, excludeLastComponent) {
      if (excludeLastComponent) {
        var last = u.pop();
      }

      var len = this.length1(u);

      if (!isFinite(len)) {
        throw "normalize: vector " + u + " has zero length";
      }

      for (let i = 0; i < u.length; ++i) {
        u[i] /= len;
      }

      if (excludeLastComponent) {
        u.push(last);
      }

      return u;
    },

    mix(u, v, s) {
      if (typeof s !== "number") {
        throw "mix: the last paramter " + s + " must be a number";
      }
      if (u.length != v.length) {
        throw "vector dimension mismatch";
      }
      var result = [];
      for (let i = 0; i < u.length; ++i) {
        result.push(s * u[i] + (1.0 - s) * v[i]);
      }
      return result;
    },

    // Vector and Matrix functions
    scale(s, u) {
      if (!Array.isArray(u)) {
        throw "scale: second parameter " + u + " is not a vector";
      }

      var result = [];
      for (let i = 0; i < u.length; ++i) {
        result.push(s * u[i]);
      }

      return result;
    },

    flatten(v) {
      if (v.matrix === true) {
        v = this.transpose(v);
      }

      var n = v.length;
      var elemsAreArrays = false;

      if (Array.isArray(v[0])) {
        elemsAreArrays = true;
        n *= v[0].length;
      }

      var floats = new Float32Array(n);

      if (elemsAreArrays) {
        let idx = 0;
        for (let i = 0; i < v.length; ++i) {
          for (var j = 0; j < v[i].length; ++j) {
            floats[idx++] = v[i][j];
          }
        }
      } else {
        for (let i = 0; i < v.length; ++i) {
          floats[i] = v[i];
        }
      }

      return floats;
    },

    //  Other Helpers
    _argumentsToArray(args) {
      return [].concat.apply([], Array.prototype.slice.apply(args));
    },

    radians(degrees) {
      return (degrees * Math.PI) / 180.0;
    },

    sizeof(type) {
      return this.sizes[type];
    }
  }
};
</script>
