// Ported from the course-provided MV.js-style vector/matrix helper library
// used throughout the WebGL demos. Vectors are plain number[]; matrices are
// number[][] with a `.matrix = true` marker property bolted on so the
// generic ops (add/subtract/mult/equal) can tell them apart at runtime -
// this loose, duck-typed shape is inherent to the original library, not
// something introduced by the TS port.
export type Vec = number[]
export type Mat = number[][] & { matrix: true }
export type VecOrMat = Vec | Mat

function argsToArray(args: unknown[]): number[] {
  return ([] as number[]).concat(...(args as number[][]))
}

//  Vector Constructors
export function vec2(...args: unknown[]): Vec {
  const result = argsToArray(args)
  switch (result.length) {
    case 0:
      result.push(0.0)
    // fallsthrough
    case 1:
      result.push(0.0)
  }
  return result.splice(0, 2)
}

export function vec3(...args: unknown[]): Vec {
  const result = argsToArray(args)
  switch (result.length) {
    case 0:
      result.push(0.0)
    // fallsthrough
    case 1:
      result.push(0.0)
    // fallsthrough
    case 2:
      result.push(0.0)
  }
  return result.splice(0, 3)
}

export function vec4(...args: unknown[]): Vec {
  const result = argsToArray(args)
  switch (result.length) {
    case 0:
      result.push(0.0)
    // fallsthrough
    case 1:
      result.push(0.0)
    // fallsthrough
    case 2:
      result.push(0.0)
    // fallsthrough
    case 3:
      result.push(1.0)
  }
  return result.splice(0, 4)
}

//  Matrix Constructors
export function mat2(...args: unknown[]): Mat {
  const v = argsToArray(args)
  let m: Vec[] = []
  switch (v.length) {
    case 0:
      v[0] = 1
    // fallsthrough
    case 1:
      m = [vec2(v[0], 0.0), vec2(0.0, v[0])]
      break
    default:
      m.push(vec2(v))
      v.splice(0, 2)
      m.push(vec2(v))
      break
  }
  ;(m as Mat).matrix = true
  return m as Mat
}

export function mat3(...args: unknown[]): Mat {
  const v = argsToArray(args)
  let m: Vec[] = []
  switch (v.length) {
    case 0:
      v[0] = 1
    // fallsthrough
    case 1:
      m = [vec3(v[0], 0.0, 0.0), vec3(0.0, v[0], 0.0), vec3(0.0, 0.0, v[0])]
      break
    default:
      m.push(vec3(v))
      v.splice(0, 3)
      m.push(vec3(v))
      v.splice(0, 3)
      m.push(vec3(v))
      break
  }
  ;(m as Mat).matrix = true
  return m as Mat
}

export function mat4(...args: unknown[]): Mat {
  const v = argsToArray(args)
  let m: Vec[] = []
  switch (v.length) {
    case 0:
      v[0] = 1
    // fallsthrough
    case 1:
      m = [
        vec4(v[0], 0.0, 0.0, 0.0),
        vec4(0.0, v[0], 0.0, 0.0),
        vec4(0.0, 0.0, v[0], 0.0),
        vec4(0.0, 0.0, 0.0, v[0]),
      ]
      break
    default:
      m.push(vec4(v))
      v.splice(0, 4)
      m.push(vec4(v))
      v.splice(0, 4)
      m.push(vec4(v))
      v.splice(0, 4)
      m.push(vec4(v))
      break
  }
  ;(m as Mat).matrix = true
  return m as Mat
}

//  Generic Mathematical Operations for Vectors and Matrices
export function equal(u: VecOrMat, v: VecOrMat): boolean {
  if (u.length != v.length) {
    return false
  }

  if ((u as Mat).matrix && (v as Mat).matrix) {
    const um = u as Mat
    const vm = v as Mat
    for (let i = 0; i < um.length; ++i) {
      if (um[i]!.length != vm[i]!.length) {
        return false
      }
      for (let j = 0; j < um[i]!.length; ++j) {
        if (um[i]![j] !== vm[i]![j]) {
          return false
        }
      }
    }
  } else if (
    ((u as Mat).matrix && !(v as Mat).matrix) ||
    (!(u as Mat).matrix && (v as Mat).matrix)
  ) {
    return false
  } else {
    const uv = u as Vec
    const vv = v as Vec
    for (let i = 0; i < uv.length; ++i) {
      if (uv[i] !== vv[i]) {
        return false
      }
    }
  }

  return true
}

export function add(u: VecOrMat, v: VecOrMat): VecOrMat {
  if ((u as Mat).matrix && (v as Mat).matrix) {
    const um = u as Mat
    const vm = v as Mat
    if (um.length != vm.length) {
      throw 'add(): trying to add matrices of different dimensions'
    }
    const result: Vec[] = []
    for (let i = 0; i < um.length; ++i) {
      if (um[i]!.length != vm[i]!.length) {
        throw 'add(): trying to add matrices of different dimensions'
      }
      result.push([])
      for (let j = 0; j < um[i]!.length; ++j) {
        result[i]!.push(um[i]![j]! + vm[i]![j]!)
      }
    }
    ;(result as Mat).matrix = true
    return result as Mat
  } else if (
    ((u as Mat).matrix && !(v as Mat).matrix) ||
    (!(u as Mat).matrix && (v as Mat).matrix)
  ) {
    throw 'add(): trying to add matrix and non-matrix variables'
  } else {
    const uv = u as Vec
    const vv = v as Vec
    if (uv.length != vv.length) {
      throw 'add(): vectors are not the same dimension'
    }
    const result: Vec = []
    for (let i = 0; i < uv.length; ++i) {
      result.push(uv[i]! + vv[i]!)
    }
    return result
  }
}

export function subtract(u: VecOrMat, v: VecOrMat): VecOrMat {
  if ((u as Mat).matrix && (v as Mat).matrix) {
    const um = u as Mat
    const vm = v as Mat
    if (um.length != vm.length) {
      throw 'subtract(): trying to subtract matrices of different dimensions'
    }
    const result: Vec[] = []
    for (let i = 0; i < um.length; ++i) {
      if (um[i]!.length != vm[i]!.length) {
        throw 'subtract(): trying to subtact matrices of different dimensions'
      }
      result.push([])
      for (let j = 0; j < um[i]!.length; ++j) {
        result[i]!.push(um[i]![j]! - vm[i]![j]!)
      }
    }
    ;(result as Mat).matrix = true
    return result as Mat
  } else if (
    ((u as Mat).matrix && !(v as Mat).matrix) ||
    (!(u as Mat).matrix && (v as Mat).matrix)
  ) {
    throw 'subtact(): trying to subtact  matrix and non-matrix variables'
  } else {
    const uv = u as Vec
    const vv = v as Vec
    if (uv.length != vv.length) {
      throw 'subtract(): vectors are not the same length'
    }
    const result: Vec = []
    for (let i = 0; i < uv.length; ++i) {
      result.push(uv[i]! - vv[i]!)
    }
    return result
  }
}

export function mult(u: VecOrMat, v: VecOrMat): VecOrMat {
  if ((u as Mat).matrix && (v as Mat).matrix) {
    const um = u as Mat
    const vm = v as Mat
    if (um.length != vm.length) {
      throw 'mult(): trying to add matrices of different dimensions'
    }
    for (let i = 0; i < um.length; ++i) {
      if (um[i]!.length != vm[i]!.length) {
        throw 'mult(): trying to add matrices of different dimensions'
      }
    }
    const result: Vec[] = []
    for (let i = 0; i < um.length; ++i) {
      result.push([])
      for (let j = 0; j < vm.length; ++j) {
        let sum = 0.0
        for (let k = 0; k < um.length; ++k) {
          sum += um[i]![k]! * vm[k]![j]!
        }
        result[i]!.push(sum)
      }
    }
    ;(result as Mat).matrix = true
    return result as Mat
  } else {
    const uv = u as Vec
    const vv = v as Vec
    if (uv.length != vv.length) {
      throw 'mult(): vectors are not the same dimension'
    }
    const result: Vec = []
    for (let i = 0; i < uv.length; ++i) {
      result.push(uv[i]! * vv[i]!)
    }
    return result
  }
}

//  Basic Transformation Matrix Generators
export function translationMatrix(x: number | Vec, y?: number, z?: number): Mat {
  if (Array.isArray(x) && x.length == 3) {
    z = x[2]
    y = x[1]
    x = x[0]!
  }
  const result = mat4()
  result[0]![3] = x as number
  result[1]![3] = y!
  result[2]![3] = z!
  return result
}

export function rotationMatrix(angle: number, axis: Vec): Mat {
  const v = normalize(axis)

  const x = v[0]!
  const y = v[1]!
  const z = v[2]!

  const c = Math.cos(rad(angle))
  const omc = 1.0 - c
  const s = Math.sin(rad(angle))

  return mat4(
    vec4(x * x * omc + c, x * y * omc - z * s, x * z * omc + y * s, 0.0),
    vec4(x * y * omc + z * s, y * y * omc + c, y * z * omc - x * s, 0.0),
    vec4(x * z * omc - y * s, y * z * omc + x * s, z * z * omc + c, 0.0),
    vec4(),
  )
}

export function scalarMatrix(...args: unknown[]): Mat {
  const xyz = argsToArray(args)
  while (xyz.length < 3) {
    xyz.push(xyz[0]!)
  }

  const result = mat4()
  result[0]![0] = xyz[0]!
  result[1]![1] = xyz[1]!
  result[2]![2] = xyz[2]!

  return result
}

export function rotationMatrix2d(thetaInDegrees: number): Mat {
  const m = mat2()
  const theta = rad(thetaInDegrees)
  m[0]![0] = Math.cos(theta)
  m[0]![1] = Math.sin(theta)
  m[1]![0] = -m[0]![1]!
  m[1]![1] = m[0]![0]!
  return m
}

//  ModelView Matrix Generators
export function lookAt(eye: Vec, at: Vec, up: Vec): Mat {
  if (!Array.isArray(eye) || eye.length != 3) {
    throw 'lookAt(): first parameter [eye] must be an a vec3'
  }
  if (!Array.isArray(at) || at.length != 3) {
    throw 'lookAt(): first parameter [at] must be an a vec3'
  }
  if (!Array.isArray(up) || up.length != 3) {
    throw 'lookAt(): first parameter [up] must be an a vec3'
  }
  if (equal(eye, at)) {
    return mat4()
  }

  const n = normalize(subtract(eye, at) as Vec) // view direction vector
  const u = normalize(cross(up, n)) // perpendicular vector
  const v = normalize(cross(n, u)) // "new" up vector

  return mat4(vec4(u, -dot(u, eye)), vec4(v, -dot(v, eye)), vec4(n, -dot(n, eye)), vec4())
}

//  Projection Matrix Generators
export function ortho(
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number,
): Mat {
  if (left == right) {
    throw 'ortho(): left and right are equal'
  }
  if (bottom == top) {
    throw 'ortho(): bottom and top are equal'
  }
  if (near == far) {
    throw 'ortho(): near and far are equal'
  }

  const w = right - left
  const h = top - bottom
  const d = far - near

  const result = mat4()
  result[0]![0] = 2.0 / w
  result[1]![1] = 2.0 / h
  result[2]![2] = -2.0 / d
  result[0]![3] = -(left + right) / w
  result[1]![3] = -(top + bottom) / h
  result[2]![3] = -(near + far) / d

  return result
}

export function perspective(fovy: number, aspect: number, near: number, far: number): Mat {
  const f = 1.0 / Math.tan(rad(fovy) / 2)
  const d = far - near

  const result = mat4()
  result[0]![0] = f / aspect
  result[1]![1] = f
  result[2]![2] = -(near + far) / d
  result[2]![3] = (-2 * near * far) / d
  result[3]![2] = -1
  result[3]![3] = 0.0

  return result
}

//  Matrix Functions
export function transpose(m: Mat): Mat {
  if (!m.matrix) {
    throw 'transpose(): trying to transpose a non-matrix'
  }
  const result: Vec[] = []
  for (let i = 0; i < m.length; ++i) {
    result.push([])
    for (let j = 0; j < m[i]!.length; ++j) {
      result[i]!.push(m[j]![i]!)
    }
  }
  ;(result as Mat).matrix = true
  return result as Mat
}

//  Vector Functions
export function dot(u: Vec, v: Vec): number {
  if (u.length != v.length) {
    throw 'dot(): vectors are not the same dimension'
  }
  let sum = 0.0
  for (let i = 0; i < u.length; ++i) {
    sum += u[i]! * v[i]!
  }
  return sum
}

export function negate(u: Vec): Vec {
  const result: Vec = []
  for (let i = 0; i < u.length; ++i) {
    result.push(-u[i]!)
  }
  return result
}

export function cross(u: Vec, v: Vec): Vec {
  if (!Array.isArray(u) || u.length < 3) {
    throw 'cross(): first argument is not a vector of at least 3'
  }
  if (!Array.isArray(v) || v.length < 3) {
    throw 'cross(): second argument is not a vector of at least 3'
  }
  return [
    u[1]! * v[2]! - u[2]! * v[1]!,
    u[2]! * v[0]! - u[0]! * v[2]!,
    u[0]! * v[1]! - u[1]! * v[0]!,
  ]
}

export function length1(u: Vec): number {
  return Math.sqrt(dot(u, u))
}

export function normalize(u: Vec, excludeLastComponent?: boolean): Vec {
  let last: number | undefined
  if (excludeLastComponent) {
    last = u.pop()
  }

  const len = length1(u)

  if (!isFinite(len)) {
    throw 'normalize: vector ' + u + ' has zero length'
  }

  for (let i = 0; i < u.length; ++i) {
    u[i]! /= len
  }

  if (excludeLastComponent) {
    u.push(last!)
  }

  return u
}

export function mix(u: Vec, v: Vec, s: number): Vec {
  if (typeof s !== 'number') {
    throw 'mix: the last paramter ' + s + ' must be a number'
  }
  if (u.length != v.length) {
    throw 'vector dimension mismatch'
  }
  const result: Vec = []
  for (let i = 0; i < u.length; ++i) {
    result.push(s * u[i]! + (1.0 - s) * v[i]!)
  }
  return result
}

// Vector and Matrix functions
export function scale(s: number, u: Vec): Vec {
  if (!Array.isArray(u)) {
    throw 'scale: second parameter ' + u + ' is not a vector'
  }
  const result: Vec = []
  for (let i = 0; i < u.length; ++i) {
    result.push(s * u[i]!)
  }
  return result
}

export function flatten(v: VecOrMat): Float32Array {
  let source: VecOrMat = v
  if ((v as Mat).matrix === true) {
    source = transpose(v as Mat)
  }

  let n = source.length
  let elemsAreArrays = false

  if (Array.isArray(source[0])) {
    elemsAreArrays = true
    n *= (source[0] as Vec).length
  }

  const floats = new Float32Array(n)

  if (elemsAreArrays) {
    let idx = 0
    for (let i = 0; i < source.length; ++i) {
      const row = source[i] as Vec
      for (let j = 0; j < row.length; ++j) {
        floats[idx++] = row[j]!
      }
    }
  } else {
    for (let i = 0; i < source.length; ++i) {
      floats[i] = source[i] as number
    }
  }

  return floats
}

//  Other Helpers
export function rad(degrees: number): number {
  return (degrees * Math.PI) / 180.0
}

export function deg(radians: number): number {
  return (radians * 180) / Math.PI
}
