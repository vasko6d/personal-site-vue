<script>
import ShaderUtils from "@/mixins/webgl/ShaderUtils.vue";
var su = ShaderUtils.methods;

export default {
  name: "WebGLUtils",
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
   *
   * Instead of setting up a context manually it is recommended to
   * use. This will check for success or failure. On failure it
   * will attempt to present an approriate message to the user.
   *
   *       gl = WebGLUtils.setupWebGL(canvas);
   *
   * For animated WebGL apps use of setTimeout or setInterval are
   * discouraged. It is recommended you structure your rendering
   * loop like this.
   *
   *       function render() {
   *         window.requestAnimFrame(render, canvas);
   *
   *         // do rendering
   *         ...
   *       }
   *       render();
   *
   * This will call your rendering function up to the refresh rate
   * of your display but will stop rendering if your app is not
   * visible.
   */
  methods: {
    /**
     * Creates the HTLM for a failure message
     * @param {string} canvasContainerId id of container of th
     *        canvas.
     * @return {string} The html.
     */
    makeFailHTML(msg) {
      return (
        "" +
        '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
        '<td align="center">' +
        '<div style="display: table-cell; vertical-align: middle;">' +
        '<div style="">' +
        msg +
        "</div>" +
        "</div>" +
        "</td></tr></table>"
      );
    },

    /**
     * Mesasge for getting a webgl browser
     * @type {string}
     */
    GET_A_WEBGL_BROWSER() {
      return (
        "This page requires a browser that supports WebGL.<br/>" +
        '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>'
      );
    },

    /**
     * Mesasge for need better hardware
     * @type {string}
     */
    OTHER_PROBLEM() {
      return (
        "It doesn't appear your computer can support WebGL.<br/>" +
        '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>'
      );
    },

    /**
     * Creates a webgl context. If creation fails it will
     * change the contents of the container of the <canvas>
     * tag to an error message with the correct links for WebGL.
     * @param {Element} canvas. The canvas element to create a
     *     context from.
     * @param {WebGLContextCreationAttirbutes} opt_attribs Any
     *     creation attributes you want to pass in.
     * @return {WebGLRenderingContext} The created context.
     */
    setupWebGL(canvas, opt_attribs) {
      function showLink(str) {
        var container = canvas.parentNode;
        if (container) {
          container.innerHTML = this.makeFailHTML(str);
        }
      }

      if (!window.WebGLRenderingContext) {
        showLink(this.GET_A_WEBGL_BROWSER());
        return null;
      }

      var context = this.create3DContext(canvas, opt_attribs);
      if (!context) {
        showLink(this.OTHER_PROBLEM());
      }
      return context;
    },

    /**
     * Creates a webgl context.
     * @param {!Canvas} canvas The canvas tag to get context
     *     from. If one is not passed in one will be created.
     * @return {!WebGLContext} The created context.
     */
    create3DContext(canvas, opt_attribs) {
      var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
      var context = null;
      for (var ii = 0; ii < names.length; ++ii) {
        try {
          context = canvas.getContext(names[ii], opt_attribs);
        } catch (e) {
          continue;
        }
        if (context) {
          break;
        }
      }
      return context;
    },

    /**
     * Provides requestAnimationFrame in a cross browser way.
     */
    requestAnimFrame() {
      return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame
      );
    },

    /**
     * Provide a standard way to resize the canvas element for fit smaller screens
     */
    resize(gl) {
      // Lookup the size the browser is displaying the canvas.
      var displayWidth = screen.width;
      var displayHeight = screen.height;

      // Check if the canvas is not the same size.
      if (gl.canvas.width > displayWidth || gl.canvas.height > displayHeight) {
        // Make the canvas the same size
        gl.canvas.width = displayWidth;
        gl.canvas.height = displayWidth;
        gl.viewport(0, 0, displayWidth, displayWidth);
      }
    },

    /**
     * The configuration steps of WebGL that are the same across my examples.
     */
    baseWebGL(canvasId, vertexShaderId, fragmentShaderId) {
      var canvas = document.getElementById(canvasId);
      var gl = this.setupWebGL(canvas);
      if (!gl) {
        alert("WebGL isn't available");
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);

      //  Load shaders and initialize attribute buffers
      var program = su.init(gl, vertexShaderId, fragmentShaderId);
      gl.useProgram(program);

      // Resize if the screen sice wont fit default canvas size
      this.resize(gl);

      // Return the GL Context and the program for more specific set up
      return [gl, program];
    }
  }
};
</script>