// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ActionCtrl<VAV = any> {
  keybind: string;
  icon: string;
  desc: string;
  holdable: boolean;
  framesActive: number;
  updateFlag: boolean;
  updateFxn: (vav: VAV) => void;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionCtrlMap<VAV = any> = Record<string, ActionCtrl<VAV>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CameraCtrlMap<VAV = any> = Record<string, ActionCtrlMap<VAV>>;

export interface Camera {
  theta: number;
  phi: number;
  alpha: number;
  dr: number;
  fovy: number;
  aspect: number;
  near: number;
  far: number;
  stepSize: number;
  position: number[];
  initialProps: Partial<Camera>;
  orthoNormalUpdateFlag?: boolean;
}

export interface InvertedControlObject {
  [keybind: string]: string[];
}
