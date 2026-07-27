import { onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

// Replaces the old v-closable directive, which relied on a module-level
// registry keyed by a caller-supplied string id (collision-prone) and
// string-name $refs lookups (fragile under <script setup>'s instance
// exposure rules). This composable instead just closes over real ref()
// instances directly - no shared state, no string keys, nothing that
// depends on Vue's $refs/directive-binding plumbing.
export function useClickOutside(
  targets: Ref<HTMLElement | null | undefined>[],
  onOutside: () => void,
) {
  function handler(e: Event) {
    const target = e.target as Node
    if (!targets.some((t) => t.value?.contains(target))) {
      onOutside()
    }
  }
  onMounted(() => {
    document.addEventListener('click', handler)
    document.addEventListener('touchstart', handler)
  })
  onUnmounted(() => {
    document.removeEventListener('click', handler)
    document.removeEventListener('touchstart', handler)
  })
}
