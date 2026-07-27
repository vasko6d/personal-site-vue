import type { ComponentPublicInstance, Directive } from "vue";

// Directive to make an element close itself on an "outside click"
export interface ClosableBinding {
  handler: string; // method name on the owning component to call to close the element
  excludeList: string[]; // ref names whose click events should NOT count as "outside"
  uniqueFxnId: string; // must be unique per open dropdown instance, see below
}

const handleOutsideClick: Record<string, (e: Event) => void> = {};

export const closable: Directive<HTMLElement, ClosableBinding> = {
  mounted(el, binding) {
    const { handler, excludeList, uniqueFxnId } = binding.value;
    const instance = binding.instance as ComponentPublicInstance;

    const onOutsideEvent = (e: Event) => {
      e.stopPropagation();
      let clickedOnExcludedEl = false;
      excludeList.forEach((exclude) => {
        if (!clickedOnExcludedEl) {
          const excludedEls = instance.$refs[exclude] as Element | Element[] | undefined;
          if (Array.isArray(excludedEls)) {
            excludedEls.forEach((excludedEl) => {
              clickedOnExcludedEl = excludedEl === e.target;
            });
          } else {
            clickedOnExcludedEl = excludedEls === e.target;
          }
        }
      });
      if (!el.contains(e.target as Node) && !clickedOnExcludedEl) {
        const method = (instance as unknown as Record<string, ((id: string) => void) | undefined>)[
          handler
        ];
        method?.(uniqueFxnId);
      }
    };
    handleOutsideClick[uniqueFxnId] = onOutsideEvent;
    document.addEventListener("click", onOutsideEvent);
    document.addEventListener("touchstart", onOutsideEvent);
  },
  unmounted(_el, binding) {
    const { uniqueFxnId } = binding.value;
    const onOutsideEvent = handleOutsideClick[uniqueFxnId];
    if (onOutsideEvent) {
      document.removeEventListener("click", onOutsideEvent);
      document.removeEventListener("touchstart", onOutsideEvent);
      delete handleOutsideClick[uniqueFxnId];
    }
  },
};
