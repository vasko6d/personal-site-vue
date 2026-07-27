export interface OptChoice<T = string> {
  name: string;
  val: T;
}

export interface XwordOpts {
  clues: {
    showCluePanel: boolean;
    contextOpt: "always" | "toggle" | "never";
    contextOpts: OptChoice[];
    hideClueOpt: "onCorrect" | "onFill" | "never";
    hideClueOpts: OptChoice[];
  };
  keyboard: {
    showOnPageKeyboard: boolean;
    enableNativeKeyboardToggle: boolean;
  };
  currentClue: {
    loc: "top" | "bottom";
    locOpts: OptChoice[];
  };
  errors: {
    showErrors: boolean;
  };
  navigation: {
    autoSkipFilledCells: boolean;
  };
}

export interface SetOptionPayload {
  optionPath: string[];
  value: unknown;
  dontSave?: boolean;
}
