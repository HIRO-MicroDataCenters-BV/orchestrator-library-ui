import { Directive, computed, effect, input, untracked } from '@angular/core';
import { hlm, injectCustomClassSettable } from '@spartan-ng/brain/core';
import type { ClassValue } from 'clsx';

@Directive({
  selector: '[hlmSheetOverlay],brn-sheet-overlay[hlm]',
  host: {
    '[class]': '_computedClass()',
  },
})
export class HlmSheetOverlayDirective {
  private readonly _classSettable = injectCustomClassSettable({
    optional: true,
    host: true,
  });
  public readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly _computedClass = computed(() =>
    hlm(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      this.userClass()
    )
  );

  constructor() {
    effect(() => {
      const classValue = this._computedClass();
      untracked(() => this._classSettable?.setClassToCustomElement(classValue));
    });
  }
}
