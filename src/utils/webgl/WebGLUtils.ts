/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @fileoverview This file contains functions every webgl program will need
 * a version of one way or another.
 */
import * as ShaderUtils from './ShaderUtils'
import { flatten, type Vec, type Mat } from './MatrixMath'
import type { ActionCtrlMap, InvertedControlObject } from './types'

export function makeFailHTML(msg: string): string {
  return (
    '' +
    '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
    '<td align="center">' +
    '<div style="display: table-cell; vertical-align: middle;">' +
    '<div style="">' +
    msg +
    '</div>' +
    '</div>' +
    '</td></tr></table>'
  )
}

export function GET_A_WEBGL_BROWSER(): string {
  return (
    'This page requires a browser that supports WebGL.<br/>' +
    '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>'
  )
}

export function OTHER_PROBLEM(): string {
  return (
    "It doesn't appear your computer can support WebGL.<br/>" +
    '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>'
  )
}

export function create3DContext(
  canvas: HTMLCanvasElement,
  opt_attribs?: WebGLContextAttributes,
): WebGLRenderingContext | null {
  const names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl']
  let context: WebGLRenderingContext | null = null
  for (const name of names) {
    try {
      context = canvas.getContext(name, opt_attribs) as WebGLRenderingContext | null
    } catch {
      continue
    }
    if (context) {
      break
    }
  }
  return context
}

export function setupWebGL(
  canvas: HTMLCanvasElement,
  opt_attribs?: WebGLContextAttributes,
): WebGLRenderingContext | null {
  function showLink(str: string) {
    const container = canvas.parentNode as HTMLElement | null
    if (container) {
      container.innerHTML = makeFailHTML(str)
    }
  }

  if (!window.WebGLRenderingContext) {
    showLink(GET_A_WEBGL_BROWSER())
    return null
  }

  const context = create3DContext(canvas, opt_attribs)
  if (!context) {
    showLink(OTHER_PROBLEM())
  }
  return context
}

/**
 * Provides requestAnimationFrame in a cross browser way.
 */
export function requestAnimFrame(): (callback: FrameRequestCallback) => number {
  const w = window as unknown as Record<string, unknown>
  return (
    (w.requestAnimationFrame as typeof window.requestAnimationFrame) ||
    (w.webkitRequestAnimationFrame as typeof window.requestAnimationFrame) ||
    (w.mozRequestAnimationFrame as typeof window.requestAnimationFrame) ||
    (w.oRequestAnimationFrame as typeof window.requestAnimationFrame) ||
    (w.msRequestAnimationFrame as typeof window.requestAnimationFrame)
  )
}

/**
 * Provide a standard way to resize the canvas element for fit smaller screens
 */
export function resize(gl: WebGLRenderingContext) {
  // Lookup the size the browser is displaying the canvas.
  const displayWidth = screen.width
  const displayHeight = screen.height

  // Check if the canvas is not the same size.
  if (gl.canvas.width > displayWidth || gl.canvas.height > displayHeight) {
    // Make the canvas the same size
    const minDimension = Math.min(displayWidth, displayHeight)
    gl.canvas.width = minDimension
    gl.canvas.height = minDimension
    gl.viewport(0, 0, minDimension, minDimension)
  }
}

/**
 * The configuration steps of WebGL that are the same across my examples.
 */
export function baseWebGL(
  canvasId: string,
  vertexShaderId: string,
  fragmentShaderId: string,
  clearColor: [number, number, number, number] = [0.0, 0.0, 0.0, 1],
): [WebGLRenderingContext, WebGLProgram] {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  const gl = setupWebGL(canvas)
  if (!gl) {
    alert("WebGL isn't available")
  }
  const glCtx = gl as WebGLRenderingContext

  glCtx.viewport(0, 0, canvas.width, canvas.height)
  glCtx.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3])
  glCtx.enable(glCtx.DEPTH_TEST)

  //  Load shaders and initialize attribute buffers
  const program = ShaderUtils.init(glCtx, vertexShaderId, fragmentShaderId) as WebGLProgram
  glCtx.useProgram(program)

  // Resize if the screen sice wont fit default canvas size
  resize(glCtx)

  // Return the GL Context and the program for more specific set up
  return [glCtx, program]
}

/**
 * Create a single picture texture for quick loading
 */
export function bindSinglePixelTexture(
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  pixelColor: [number, number, number, number] = [0, 0, 255, 255],
) {
  gl.bindTexture(gl.TEXTURE_2D, texture)
  const level = 0
  const internalFormat = gl.RGBA
  const width = 1
  const height = 1
  const border = 0
  const srcFormat = gl.RGBA
  const srcType = gl.UNSIGNED_BYTE
  const pixel = new Uint8Array(pixelColor) // opaque blue
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel,
  )
}

/**
 * Create webGL buffer bound to gl isntance
 */
export function buffer(gl: WebGLRenderingContext, data: VecOrMatLike): WebGLBuffer {
  const b = gl.createBuffer()!
  return rebuffer(gl, data, b)
}

type VecOrMatLike = Vec[] | Mat[] | Vec | Mat

export function rebuffer(
  gl: WebGLRenderingContext,
  data: VecOrMatLike,
  b: WebGLBuffer,
): WebGLBuffer {
  gl.bindBuffer(gl.ARRAY_BUFFER, b)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(data as unknown as Vec), gl.STATIC_DRAW)
  return b
}

/**
 * Create webGL attribute bound to gl isntance and specified buffer
 */
export function attrib(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  attributeName: string,
  length: number,
  buf: WebGLBuffer,
): number {
  const attribute = gl.getAttribLocation(program, attributeName)
  return reattrib(gl, attribute, length, buf)
}

export function reattrib(
  gl: WebGLRenderingContext,
  attribute: number,
  length: number,
  buf: WebGLBuffer,
): number {
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.enableVertexAttribArray(attribute)
  gl.vertexAttribPointer(attribute, length, gl.FLOAT, false, 0, 0)
  return attribute
}

/**
 * Provide a consitent way to update [V]iew [A]ffecting [V]ariables in
 * interactive graphics
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function executeActions(ctrls: ActionCtrlMap<any>, vav: unknown) {
  const actions = Object.keys(ctrls)
  for (const action of actions) {
    const ctrl = ctrls[action]!
    if (ctrl.framesActive && ctrl.framesActive > 0) {
      ctrl.framesActive--
    }
    if (ctrl.updateFlag) {
      ctrl.updateFxn(vav)
      if (!ctrl.holdable) {
        ctrl.updateFlag = false
        ctrl.framesActive = 10 // Hack to make quick boolean changes tied to a CSS value last for a specified number of Render Loops.
      }
    }
  }
}

export function getInvertedControlObject(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctrls: ActionCtrlMap<any>,
  prePath?: string,
): InvertedControlObject {
  const invCtrls: InvertedControlObject = {}
  const cKeys = Object.keys(ctrls)
  for (const cKey of cKeys) {
    invCtrls[ctrls[cKey]!.keybind] = prePath ? [prePath, cKey] : [cKey]
  }
  return invCtrls
}

export interface BufferIndexer {
  lastEnd: number
  [bufferItem: string]: { start: number; len: number } | number
}

export function updateBufferIndex(bufferIndexer: BufferIndexer, bufferItem: string, len: number) {
  bufferIndexer[bufferItem] = {
    start: bufferIndexer.lastEnd,
    len: len,
  }
  bufferIndexer.lastEnd += len
}

export function draw(
  gl: WebGLRenderingContext,
  arrayType: number,
  bufferIndexer: BufferIndexer,
  bufferItem: string,
) {
  const idx = bufferIndexer[bufferItem] as { start: number; len: number }
  gl.drawArrays(arrayType, idx.start, idx.len)
}

/**
 * Vue 3's template compiler hard-errors on <script>/<style> tags nested inside
 * a component's <template> ("Tags with side effect are ignored in client
 * component templates"), unlike Vue 2. `ShaderUtils.init` still looks up shader
 * source via `document.getElementById(id).text`, so shader `<script>` elements
 * that used to live directly in the template are instead injected imperatively
 * on mount (and torn down on unmount, since two demo routes reuse the same ids).
 */
export function injectShaderScript(id: string, type: string, source: string) {
  document.getElementById(id)?.remove()
  const el = document.createElement('script')
  el.id = id
  el.type = type
  el.text = source
  document.body.appendChild(el)
}

export function removeShaderScript(id: string) {
  document.getElementById(id)?.remove()
}
