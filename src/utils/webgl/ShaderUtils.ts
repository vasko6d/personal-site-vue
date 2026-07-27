export function init(
  gl: WebGLRenderingContext,
  vertexShaderId: string,
  fragmentShaderId: string,
): WebGLProgram | -1 {
  let vertShdr: WebGLShader
  let fragShdr: WebGLShader

  const vertElem = document.getElementById(vertexShaderId) as HTMLScriptElement | null
  if (!vertElem) {
    alert('Unable to load vertex shader ' + vertexShaderId)
    return -1
  } else {
    vertShdr = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertShdr, vertElem.text)
    gl.compileShader(vertShdr)
    if (!gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS)) {
      const msg =
        'Vertex shader failed to compile.  The error log is:' +
        '<pre>' +
        gl.getShaderInfoLog(vertShdr) +
        '</pre>'
      alert(msg)
      return -1
    }
  }

  const fragElem = document.getElementById(fragmentShaderId) as HTMLScriptElement | null
  if (!fragElem) {
    alert('Unable to load fragment shader ' + fragmentShaderId)
    return -1
  } else {
    fragShdr = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragShdr, fragElem.text)
    gl.compileShader(fragShdr)
    if (!gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS)) {
      const msg =
        'Fragment shader failed to compile.  The error log is:' +
        '<pre>' +
        gl.getShaderInfoLog(fragShdr) +
        '</pre>'
      alert(msg)
      return -1
    }
  }

  const program = gl.createProgram()!
  gl.attachShader(program, vertShdr)
  gl.attachShader(program, fragShdr)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const msg =
      'Shader program failed to link.  The error log is:' +
      '<pre>' +
      gl.getProgramInfoLog(program) +
      '</pre>'
    alert(msg)
    return -1
  }

  return program
}
