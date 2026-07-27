import * as mv from "@/utils/webgl/MatrixMath";
import type { Vec } from "@/utils/webgl/MatrixMath";
import type { Camera, CameraCtrlMap } from "@/utils/webgl/types";

/**
 * These camera math/control functions were originally `WebglCamera.vue`
 * Options-API `methods`, grabbed as a static-like utility object by parent
 * views (`var wglc = WebglCamera.methods;`) independent of the component
 * instance. Vue 3 `<script setup>` components don't expose a `.methods`
 * object, so they're extracted here as plain functions and imported both
 * by `WebglCamera.vue` and by the views that used them as utilities.
 */

export function initCamera(cameraProps: Partial<Camera>): Camera {
  const camera: Camera = {
    theta: 0.0, // up down angle
    phi: 0.0, // left right angle
    alpha: 0.0, // rolling angle
    dr: mv.rad(1),
    fovy: 90,
    aspect: 1,
    near: 0.1,
    far: 100,
    stepSize: 0.25,
    position: mv.vec3(1, 0, 0), // this is also "eye"
    initialProps: cameraProps,
  };
  setProps(camera, cameraProps);
  return camera;
}

export function setProps(camera: Camera, cameraProps: Partial<Camera>) {
  for (const prop of Object.keys(camera) as (keyof Camera)[]) {
    if (cameraProps[prop]) {
      (camera[prop] as unknown) = cameraProps[prop];
    }
  }
}

export function defaultControls(): CameraCtrlMap<{ camera: Camera }> {
  const ctrls: CameraCtrlMap<{ camera: Camera }> = {
    move: {
      forward: {
        keybind: "w",
        icon: "fas fa-caret-up",
        desc: "Move forward",
        holdable: true,
        framesActive: 0,
        updateFlag: false,
        updateFxn: (vav) => {
          move(vav.camera, 1, 0);
        },
      },
      backward: {
        keybind: "s",
        icon: "fas fa-caret-down",
        desc: "Move backward",
        holdable: true,
        framesActive: 0,
        updateFlag: false,
        updateFxn: (vav) => {
          move(vav.camera, -1, 0);
        },
      },
      left: {
        keybind: "a",
        icon: "fas fa-caret-left",
        desc: "Strafe left",
        holdable: true,
        framesActive: 0,
        updateFlag: false,
        updateFxn: (vav) => {
          move(vav.camera, -1, 2);
        },
      },
      right: {
        keybind: "d",
        icon: "fas fa-caret-right",
        desc: "Strafe right",
        holdable: true,
        framesActive: 0,
        updateFlag: false,
        updateFxn: (vav) => {
          move(vav.camera, 1, 2);
        },
      },
      up: {
        keybind: "q",
        icon: "fas fa-arrow-up",
        desc: "Float upward",
        holdable: true,
        framesActive: 0,
        updateFlag: false,
        updateFxn: (vav) => {
          move(vav.camera, 1, 1);
        },
      },
      down: {
        keybind: "e",
        icon: "fas fa-arrow-down",
        desc: "Sink downward",
        holdable: true,
        framesActive: 0,
        updateFlag: false,
        updateFxn: (vav) => {
          move(vav.camera, -1, 1);
        },
      },
    },
    look: {
      up: {
        keybind: "u",
        icon: "fas fa-caret-up",
        desc: "Look upward",
        holdable: true,
        framesActive: 0,
        updateFlag: false,
        updateFxn(vav) {
          if (vav.camera.theta < mv.rad(90)) {
            vav.camera.theta += vav.camera.dr;
          }
        },
      },
      down: {
        keybind: "j",
        icon: "fas fa-caret-down",
        desc: "Look downward",
        holdable: true,
        framesActive: 0,
        updateFlag: false,
        updateFxn(vav) {
          if (vav.camera.theta > -mv.rad(90)) {
            vav.camera.theta -= vav.camera.dr;
          }
        },
      },
      left: {
        keybind: "h",
        icon: "fas fa-caret-left",
        desc: "Look left",
        holdable: true,
        framesActive: 0,
        updateFlag: false,
        updateFxn(vav) {
          vav.camera.phi -= vav.camera.dr;
        },
      },
      right: {
        keybind: "k",
        icon: "fas fa-caret-right",
        desc: "Look right",
        holdable: true,
        framesActive: 0,
        updateFlag: false,
        updateFxn(vav) {
          vav.camera.phi += vav.camera.dr;
        },
      },
      rollLeft: {
        keybind: "l",
        icon: "fas fa-redo",
        desc: "Roll Camera View Clockwise",
        holdable: true,
        framesActive: 0,
        updateFlag: false,
        updateFxn(vav) {
          vav.camera.alpha += vav.camera.dr;
        },
      },
      rollRight: {
        keybind: "o",
        icon: "fas fa-redo fa-flip-horizontal",
        desc: "Roll Camera View Counter-clockwise",
        holdable: true,
        framesActive: 0,
        updateFlag: false,
        updateFxn(vav) {
          vav.camera.alpha -= vav.camera.dr;
        },
      },
      zoomin: {
        keybind: "y",
        icon: "fas fa-plus",
        desc: "Narrow field of view",
        holdable: true,
        framesActive: 0,
        updateFlag: false,
        updateFxn(vav) {
          vav.camera.fovy -= 1;
        },
      },
      zoomout: {
        keybind: "i",
        icon: "fas fa-minus",
        desc: "Widen field of view",
        holdable: true,
        framesActive: 0,
        updateFlag: false,
        updateFxn(vav) {
          vav.camera.fovy += 1;
        },
      },
    },
  };
  return ctrls;
}

export function viewMatrix(camera: Camera) {
  return mv.lookAt(camera.position, atPosition(camera), upVector(camera));
}

export function perspectiveMatrix(camera: Camera) {
  return mv.perspective(camera.fovy, camera.aspect, camera.near, camera.far);
}

export function atPosition(camera: Camera) {
  return mv.add(atVector(camera), camera.position) as Vec;
}

export function atVector(camera: Camera) {
  return mv.vec3(Math.cos(camera.theta) * Math.cos(camera.phi), Math.sin(camera.theta), Math.cos(camera.theta) * Math.sin(camera.phi));
}

export function setAt(camera: Camera, atPos: number[]) {
  const atVec = mv.normalize(mv.subtract(atPos, camera.position) as Vec);
  // phases on arc trig functions are annoying. This may only work in my planets case...
  // ...will troubleshoot further errors if teh come up
  const correction = atVec[2]! < 0 ? -1 : 1;
  camera.theta = Math.asin(atVec[1]!);
  camera.phi = Math.acos(atVec[0]! / Math.cos(camera.theta)) * correction;
}

export function upVector(camera: Camera) {
  const cos = {
    t: Math.cos(camera.theta),
    p: Math.cos(camera.phi),
    a: Math.cos(camera.alpha),
  };
  const sin = {
    t: Math.sin(camera.theta),
    p: Math.sin(camera.phi),
    a: Math.sin(camera.alpha),
  };
  return mv.vec3(-sin.t * cos.p * cos.a - sin.p * sin.a, cos.t * cos.a, -sin.t * sin.p * cos.a + cos.p * sin.a);
}

export function move(camera: Camera, direction: number, vectorNum: number) {
  // create Orthonormal Basis based on camera
  const up = upVector(camera);
  const forward = atVector(camera);
  const right = mv.normalize(mv.cross(forward, up));
  const otrhoNormalBasis = [forward, up, right];

  const v = otrhoNormalBasis[vectorNum]!;
  const dx = camera.stepSize * direction;
  camera.position = mv.add(camera.position, mv.vec3(dx * v[0]!, dx * v[1]!, dx * v[2]!)) as Vec;
}
